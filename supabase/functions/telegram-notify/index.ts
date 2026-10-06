import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Safely escape HTML special characters for Telegram HTML parse mode
function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate Authorization Header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment configuration is missing')
    }

    // 2. Verify caller identity using Supabase Auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired session token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Validate Request Payload
    const { order } = await req.json()

    if (!order || typeof order !== 'object' || !order.id) {
      return new Response(
        JSON.stringify({ error: 'Valid order data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Verify Telegram Bot Credentials
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      throw new Error('Telegram credentials are not configured on the server')
    }

    // 5. Safely Format and Escape Order Details
    const itemsList = Array.isArray(order.items) && order.items.length > 0
      ? order.items
          .map((item: any) => {
            const name = escapeHtml(item.product?.name || item.name || 'Unknown Item')
            const weight = item.variant?.weight ? ` (${escapeHtml(item.variant.weight)}${item.noGarlic ? ' - No Garlic' : ''})` : ''
            const qty = escapeHtml(item.quantity || 1)
            return `${name}${weight} x${qty}`
          })
          .join('\n- ')
      : 'No items specified'

    const orderId = escapeHtml(order.id)
    const customerName = escapeHtml(order.userName || 'Guest')
    const customerPhone = escapeHtml(order.userPhone || 'N/A')
    const customerEmail = escapeHtml(order.userEmail || 'N/A')
    const finalAmount = escapeHtml(order.finalAmount || 0)
    const paymentMethod = escapeHtml(order.paymentMethod ? String(order.paymentMethod).toUpperCase() : 'N/A')
    const txnId = escapeHtml(order.transactionId || 'N/A')

    const street = escapeHtml(order.address?.street || 'N/A')
    const city = escapeHtml(order.address?.city || '')
    const state = escapeHtml(order.address?.state || '')
    const pincode = escapeHtml(order.address?.pincode || '')
    const fullAddress = `${street}, ${city}, ${state} - ${pincode}`.replace(/^[,\s-]+|[,\s-]+$/g, '')

    const message = `
🚨 <b>NEW ORDER RECEIVED!</b> 🥒
━━━━━━━━━━━━━━━━━━━━━
📦 <b>Order ID:</b> <code>${orderId}</code>
👤 <b>Customer:</b> ${customerName}
📱 <b>Phone:</b> ${customerPhone}
📧 <b>Email:</b> ${customerEmail}

🛒 <b>Items:</b>
- ${itemsList}

💰 <b>Amount:</b> ₹${finalAmount}
💳 <b>Payment:</b> ${paymentMethod}
🧾 <b>Txn ID:</b> <code>${txnId}</code>

📍 <b>Delivery Address:</b>
${fullAddress}
━━━━━━━━━━━━━━━━━━━━━
⏳ <b>Action Required:</b> Please verify the payment and process the order.
    `.trim()

    // 6. Send message to Telegram API with parse_mode=HTML
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Telegram API error:', response.status, errorText)
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error in telegram-notify function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message?.includes('Unauthorized') ? 401 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
