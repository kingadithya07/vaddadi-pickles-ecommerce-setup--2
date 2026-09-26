import { Order } from '../types';

export const sendTelegramNotification = async (order: Order) => {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8901824301:AAEyKPVkxj0tY4mEVHgXcU4fgGtJiV07bCo';
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID || '440241296';

  if (!botToken || !chatId) {
    console.warn('Telegram credentials are not set. Notification skipped.');
    return;
  }

  const itemsList = order.items
    .map((item) => `${item.product.name} (${item.variant.weight}${item.noGarlic ? ' - No Garlic' : ''}) x${item.quantity}`)
    .join('\n- ');

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
  `;

  try {
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
    });

    if (!response.ok) {
      console.error('Failed to send Telegram notification');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};
