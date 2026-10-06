export interface AddressLines {
  line1: string;
  line2: string;
  line3: string;
  lines: string[];
}

export function cleanStreetAddress(street: string | undefined | null): string {
  if (!street) return '';
  return String(street)
    .replace(/&lt;br\s*\/?&gt;/gi, ', ')
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/[\r\n]+/g, ', ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/(,\s*)+/g, ', ')
    .replace(/^,\s*|,\s*$/g, '')
    .trim();
}

export function formatStreetAddress(street: string | undefined | null): string {
  return cleanStreetAddress(street);
}

export function getAddress3Lines(address: {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  postOffice?: string;
} | undefined | null): AddressLines {
  const rawStreet = cleanStreetAddress(address?.street);
  let line1 = '';
  let line2 = '';

  if (rawStreet.includes(',')) {
    const parts = rawStreet.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 1) {
      line1 = parts[0];
      line2 = '';
    } else if (parts.length === 2) {
      line1 = parts[0] + ',';
      line2 = parts[1];
    } else {
      const mid = Math.ceil(parts.length / 2);
      line1 = parts.slice(0, mid).join(', ') + ',';
      line2 = parts.slice(mid).join(', ');
    }
  } else if (rawStreet.length > 25 && rawStreet.includes(' ')) {
    const middle = Math.floor(rawStreet.length / 2);
    let splitIndex = -1;
    let minDistance = rawStreet.length;
    for (let i = 0; i < rawStreet.length; i++) {
      if (rawStreet[i] === ' ') {
        const distance = Math.abs(i - middle);
        if (distance < minDistance) {
          minDistance = distance;
          splitIndex = i;
        }
      }
    }
    if (splitIndex !== -1) {
      line1 = rawStreet.substring(0, splitIndex).trim() + ',';
      line2 = rawStreet.substring(splitIndex + 1).trim();
    } else {
      line1 = rawStreet;
    }
  } else {
    line1 = rawStreet;
  }

  const cityState = [address?.city?.trim(), address?.state?.trim()].filter(Boolean).join(', ');
  const pin = address?.pincode ? ` - ${address.pincode.trim()}` : '';
  let line3 = `${cityState}${pin}`.trim();

  // If street only had 1 line and no line2, put city & state on line2 and pincode on line3 for clean 3 lines
  if (!line2 && line1) {
    line2 = cityState;
    line3 = address?.pincode ? `PIN: ${address.pincode.trim()}` : '';
  }

  const cleanLine = (l: string) => (l || '')
    .replace(/&lt;br\s*\/?&gt;/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .trim();

  return {
    line1: cleanLine(line1),
    line2: cleanLine(line2),
    line3: cleanLine(line3),
    lines: [cleanLine(line1), cleanLine(line2), cleanLine(line3)].filter(Boolean)
  };
}
