export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) return '';
  
  // If it's a 10-digit number, prepend +91
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  // If it's 12 digits and starts with 91, just add +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return '+' + cleaned;
  }
  
  // If it has other lengths, but starts with 91, add +
  if (cleaned.startsWith('91')) {
    return '+' + cleaned;
  }

  // Fallback, just ensure it has +91 if not present
  return '+91' + cleaned;
}

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return phone;
  // WhatsApp wa.me links usually prefer numbers without the '+' sign but with country code.
  // The user explicitly requested "+91 before number even in whatsapp custome message also"
  // So we will return it with +91 or +<countrycode>
  return formatPhoneNumber(phone);
}
