import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface OrderItemInput {
  id?: string;
  name: string;
  quantity?: number;
  price?: number;
}

export interface DownloadLink {
  productName: string;
  url: string;
  expiresAt: string;
}

/**
 * Generate secure download links for digital products in an order.
 * Uses download_tokens + the download-pdf edge function.
 */
export async function generateDigitalDownloadLinks(
  supabase: SupabaseClient,
  orderItems: OrderItemInput[],
  orderId: string,
  customerEmail: string
): Promise<DownloadLink[]> {
  const downloadLinks: DownloadLink[] = [];
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + sevenDaysMs);

  const productIds = orderItems
    .map((item) => item.id)
    .filter((id): id is string => !!id);

  const productNames = orderItems
    .map((item) => item.name?.trim())
    .filter((name): name is string => !!name);

  if (productIds.length === 0 && productNames.length === 0) {
    return downloadLinks;
  }

  type ProductRow = { id: string; name: string; pdf_url: string | null; is_digital: boolean };
  const productsMap = new Map<string, ProductRow>();

  if (productIds.length > 0) {
    const { data: byId } = await supabase
      .from("products")
      .select("id, name, pdf_url, is_digital")
      .in("id", productIds);

    for (const p of byId ?? []) {
      productsMap.set(p.id, p);
    }
  }

  // Fallback: match by product name when id is missing from order items
  const unmatchedNames = productNames.filter(
    (name) => ![...productsMap.values()].some((p) => p.name === name)
  );

  if (unmatchedNames.length > 0) {
    const { data: byName } = await supabase
      .from("products")
      .select("id, name, pdf_url, is_digital")
      .in("name", unmatchedNames);

    for (const p of byName ?? []) {
      if (!productsMap.has(p.id)) {
        productsMap.set(p.id, p);
      }
    }
  }

  const processedProductIds = new Set<string>();

  for (const product of productsMap.values()) {
    if (!product.is_digital || !product.pdf_url || processedProductIds.has(product.id)) {
      continue;
    }
    processedProductIds.add(product.id);

    const { data: tokenRow, error: tokenError } = await supabase
      .from("download_tokens")
      .insert({
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        customer_email: customerEmail,
        pdf_url: product.pdf_url,
        expires_at: expiresAt.toISOString(),
        max_downloads: 5,
      })
      .select("token")
      .single();

    if (tokenError || !tokenRow?.token) {
      console.error("[digital-downloads] Token insert failed:", tokenError);
      continue;
    }

    const downloadUrl = `${supabaseUrl}/functions/v1/download-pdf?token=${tokenRow.token}`;

    downloadLinks.push({
      productName: product.name,
      url: downloadUrl,
      expiresAt: expiresAt.toLocaleDateString("nl-NL"),
    });

    console.log(`[digital-downloads] Download link created for: ${product.name}`);
  }

  return downloadLinks;
}

export async function sendDigitalProductEmails(
  supabase: SupabaseClient,
  params: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    orderDate: string;
    total: number;
    downloadLinks: DownloadLink[];
  }
): Promise<void> {
  if (params.downloadLinks.length === 0) return;

  const { error } = await supabase.functions.invoke("send-digital-product-email", {
    body: {
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      orderId: params.orderId,
      orderDate: params.orderDate,
      downloads: params.downloadLinks.map((dl) => ({
        productName: dl.productName,
        url: dl.url,
      })),
      total: params.total,
    },
  });

  if (error) {
    console.error("[digital-downloads] send-digital-product-email failed:", error);
  }
}
