import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order } = await req.json()

    if (!order) {
      throw new Error('Order data is required')
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      throw new Error('Telegram credentials are not configured on the server')
    }

    const itemsList = order.items
      .map((item: any) => `${item.product.name} (${item.variant.weight}${item.noGarlic ? ' - No Garlic' : ''}) x${item.quantity}`)
      .join('\n- ')

    const message = `
🚨 *NEW ORDER RECEIVED!* 🥒
━━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* \`${order.id}\`
👤 *Customer:* ${order.userName}
📱 *Phone:* ${order.userPhone}
📧 *Email:* ${order.userEmail}

🛒 *Items:*
- ${itemsList}

💰 *Amount:* ₹${order.finalAmount}
💳 *Payment:* ${order.paymentMethod.toUpperCase()}
🧾 *Txn ID:* \`${order.transactionId || 'N/A'}\`

📍 *Delivery Address:*
${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}
━━━━━━━━━━━━━━━━━━━━━
⏳ *Action Required:* Please verify the payment and process the order.
    `

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
