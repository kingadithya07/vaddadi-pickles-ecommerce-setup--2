export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) return '';
  
  // If it starts with 91 and has 12 digits (e.g. 919876543210)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return '+91 ' + cleaned.slice(2);
  }

  // If it has 11 digits and starts with 0 (e.g. 09876543210)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '+91 ' + cleaned.slice(1);
  }
  
  // If it's a 10-digit number (e.g. 9876543210)
  if (cleaned.length === 10) {
    return '+91 ' + cleaned;
  }
  
  // If it starts with 91 and has other lengths
  if (cleaned.startsWith('91') && cleaned.length > 2) {
    return '+91 ' + cleaned.slice(2);
  }

  // Fallback: ensure +91 with space
  return '+91 ' + cleaned;
}

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return phone;
  // WhatsApp wa.me links usually prefer numbers without the '+' sign but with country code.
  // The user explicitly requested "+91 before number even in whatsapp custome message also"
  // So we will return it with +91 or +<countrycode>
  return formatPhoneNumber(phone);
}
