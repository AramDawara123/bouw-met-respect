import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigitalProductEmailRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderDate: string;
  downloads: Array<{
    productName: string;
    url: string;
  }>;
  total: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: DigitalProductEmailRequest = await req.json();

    const downloadButtons = data.downloads.map(dl => `
      <tr>
        <td align="center" style="padding: 0 0 16px 0;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 14px; box-shadow: 0 8px 20px rgba(79,70,229,0.35);">
                <a href="${dl.url}"
                   download
                   target="_blank"
                   style="display: block; padding: 18px 40px; color: #ffffff; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap;">
                  &#8595;&nbsp;&nbsp;${dl.productName} downloaden
                </a>
              </td>
            </tr>
          </table>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af; font-family: sans-serif;">
            Klik op de knop om de PDF direct te openen
          </p>
        </td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Je digitale product staat klaar! - Bouw met Respect</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #7c3aed 100%); padding: 50px 40px 44px; text-align: center;">
              <!-- Icon -->
              <div style="width:72px;height:72px;background:rgba(255,255,255,0.15);border-radius:20px;margin:0 auto 24px;display:inline-block;vertical-align:middle;line-height:72px;font-size:36px;border:2px solid rgba(255,255,255,0.25);">
                &#128196;
              </div>
              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 10px;letter-spacing:-0.5px;">
                Je download staat klaar!
              </h1>
              <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0;">
                Bouw met Respect &mdash; Digitaal product
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 40px 0;">
              <h2 style="color:#1e1b4b;font-size:22px;font-weight:700;margin:0 0 12px;">
                Hallo ${data.customerName}! &#128075;
              </h2>
              <p style="color:#6b7280;font-size:16px;line-height:1.7;margin:0;">
                Bedankt voor je aankoop! Je digitale product is direct beschikbaar.
                Klik op de downloadknop hieronder om je PDF te openen.
              </p>
            </td>
          </tr>

          <!-- Download Section -->
          <tr>
            <td style="padding: 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:linear-gradient(135deg,#eef2ff 0%,#ede9fe 100%);border-radius:16px;border:2px solid #c7d2fe;">
                <tr>
                  <td style="padding: 32px 24px;">
                    <h3 style="color:#3730a3;font-size:18px;font-weight:700;margin:0 0 24px;text-align:center;">
                      &#128230;&nbsp; Jouw bestelling
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${downloadButtons}
                    </table>
                    <p style="color:#6366f1;font-size:13px;margin:16px 0 0;text-align:center;line-height:1.5;">
                      &#128274;&nbsp; Beveiligde download via Bouw met Respect
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <h4 style="color:#374151;font-size:14px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">
                      Bestelinformatie
                    </h4>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding:4px 0;">Bestelnummer</td>
                        <td style="color:#1f2937;font-size:14px;font-weight:600;text-align:right;font-family:monospace;">
                          #${data.orderId.slice(-8).toUpperCase()}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding:4px 0;">Datum</td>
                        <td style="color:#1f2937;font-size:14px;font-weight:600;text-align:right;">
                          ${data.orderDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;padding:4px 0;">Totaal betaald</td>
                        <td style="color:#4f46e5;font-size:16px;font-weight:700;text-align:right;">
                          &euro;${(data.total / 100).toFixed(2)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#fffbeb;border-radius:12px;border:1px solid #fde68a;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#92400e;font-size:14px;margin:0;line-height:1.6;">
                      <strong>Problemen met downloaden?</strong><br>
                      Stuur een e-mail naar
                      <a href="mailto:info@bouwmetrespect.nl" style="color:#d97706;font-weight:600;">
                        info@bouwmetrespect.nl
                      </a>
                      en we helpen je direct verder.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#6b7280;font-size:13px;margin:0 0 6px;">Met vriendelijke groet,</p>
              <p style="color:#1f2937;font-size:15px;font-weight:700;margin:0;">
                Het Bouw met Respect team
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:12px 0 0;">
                &copy; 2025 Bouw met Respect &bull;
                <a href="mailto:info@bouwmetrespect.nl" style="color:#6366f1;text-decoration:none;">
                  info@bouwmetrespect.nl
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Bouw met Respect <info@bouwmetrespect.nl>",
      to: [data.customerEmail],
      subject: `📥 Je download staat klaar! - Bouw met Respect`,
      html,
    });

    console.log("Digital product email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending digital product email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
