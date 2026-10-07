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
  const pincode = address?.pincode?.trim();
  const removePincode = (str: string | undefined | null) => {
    if (!str) return '';
    let res = str;
    if (pincode && pincode.length === 6) {
      const pinRegex = new RegExp(`(?:,\\s*|-\\s*|PIN:?\\s*)?\\b${pincode}\\b(?:,\\s*|-\\s*)?`, 'gi');
      res = res.replace(pinRegex, ' ').replace(/\s+,/g, ',').replace(/,\s*,/g, ', ').replace(/^[,\s-]+|[,\s-]+$/g, '').trim();
    }
    res = res.replace(/(?:,\s*|-\s*|PIN:?\s*)\b\d{6}\b/gi, '').replace(/^[,\s-]+|[,\s-]+$/g, '').trim();
    return res;
  };

  const rawStreet = removePincode(cleanStreetAddress(address?.street));
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

  const cleanCity = removePincode(address?.city?.trim());
  const cleanState = removePincode(address?.state?.trim());
  const cityState = [cleanCity, cleanState].filter(Boolean).join(', ');
  let line3 = cityState;

  // If street only had 1 line and no line2, put city & state on line2 and keep line3 empty
  // (Pincode is already rendered separately below state in labels)
  if (!line2 && line1) {
    line2 = cityState;
    line3 = '';
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
