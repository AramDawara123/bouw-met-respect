import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating test order...');
    
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Create a fake order
    const testOrder = {
      user_id: null,
      items: [
        {
          id: 'test-product-1',
          name: 'Test Product 1',
          price: 2500, // €25.00
          quantity: 2,
          image_url: 'https://via.placeholder.com/300x200'
        },
        {
          id: 'test-product-2', 
          name: 'Test Product 2',
          price: 1500, // €15.00
          quantity: 1,
          image_url: 'https://via.placeholder.com/300x200'
        }
      ],
      subtotal: 6500, // €65.00
      shipping: 0, // Free shipping over €50
      total: 6500,
      customer_first_name: 'Test',
      customer_last_name: 'Gebruiker',
      customer_email: 'info@bouwmetrespect.nl',
      customer_phone: '+31612345678',
      address_street: 'Teststraat',
      address_house_number: '123',
      address_postcode: '1234AB',
      address_city: 'Amsterdam',
      address_country: 'Nederland',
      payment_status: 'paid',
      mollie_payment_id: 'test_' + Date.now()
    };

    // Insert test order
    const { data: orderData, error: orderError } = await supabaseService
      .from('orders')
      .insert(testOrder)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating test order:', orderError);
      return new Response(JSON.stringify({ error: orderError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Test order created:', orderData);

    // Send confirmation email
    const confirmationData = {
      orderId: orderData.id,
      customerEmail: testOrder.customer_email,
      customerName: `${testOrder.customer_first_name} ${testOrder.customer_last_name}`,
      orderItems: testOrder.items,
      subtotal: testOrder.subtotal,
      shipping: testOrder.shipping,
      total: testOrder.total,
      shippingAddress: {
        street: testOrder.address_street,
        houseNumber: testOrder.address_house_number,
        postcode: testOrder.address_postcode,
        city: testOrder.address_city,
        country: testOrder.address_country
      },
      orderDate: new Date().toLocaleDateString('nl-NL')
    };

    // Send email
    const emailResponse = await supabaseService.functions.invoke('send-order-confirmation', {
      body: confirmationData
    });

    if (emailResponse.error) {
      console.error('Error sending confirmation email:', emailResponse.error);
    } else {
      console.log('Confirmation email sent successfully:', emailResponse.data);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Test order created successfully',
      orderId: orderData.id,
      emailResponse: emailResponse
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error in create-test-order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});