const fs = require('fs');
const file = 'src/pages/Admin.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. In printSingleLabel
content = content.replace(
  "    const senderName = isBikeParcel ? 'Vaddadi Pickles' : 'Vaddadi Udayaakumar, KK Homes 2';",
  "    const senderName = isBikeParcel ? 'Vaddadi Pickles' : 'Vaddadi Udayaakumar, KK Homes 2';\n    let displayWeight = (calculateOrderWeight(order) * 1000).toFixed(0) + 'g';\n    if (order.address?.isOffline) {\n      const override = window.prompt('Enter weight (in grams) for offline customer label:', displayWeight);\n      if (override !== null) displayWeight = override + (override.includes('g') ? '' : 'g');\n    }"
);
content = content.replace(
  "<span>⚖️ ~${(calculateOrderWeight(order) * 1000).toFixed(0)}g</span>",
  "<span>⚖️ ~${displayWeight}</span>"
);

// 3. In printBulkLabels
content = content.replace(
  "      const senderName = isBikeParcel ? 'Vaddadi Pickles' : 'Vaddadi Udayaakumar, KK Homes 2';",
  "      const senderName = isBikeParcel ? 'Vaddadi Pickles' : 'Vaddadi Udayaakumar, KK Homes 2';\n      let displayWeight = (calculateOrderWeight(order) * 1000).toFixed(0) + 'g';\n      if (order.address?.isOffline) {\n        const override = window.prompt('Enter weight (in grams) for offline customer '+order.userName+':', displayWeight);\n        if (override !== null) displayWeight = override + (override.includes('g') ? '' : 'g');\n      }"
);
content = content.replace(
  "<span>Weight: ~${(calculateOrderWeight(order) * 1000).toFixed(0)}g</span>",
  "<span>Weight: ~${displayWeight}</span>"
);

// 4. In printOrderLabel
content = content.replace(
  "    const senderName = isBikeParcel ? 'VADDADI PICKLES' : 'VADDADI UDAYAAKUMAR, KK HOMES 2';",
  "    const senderName = isBikeParcel ? 'VADDADI PICKLES' : 'VADDADI UDAYAAKUMAR, KK HOMES 2';\n    let displayWeight = calculateOrderWeight(order).toFixed(2) + ' KG';\n    if (order.address?.isOffline) {\n      const override = window.prompt('Enter weight for offline customer label:', displayWeight);\n      if (override !== null) displayWeight = override + (override.toLowerCase().includes('kg') ? '' : ' KG');\n    }"
);
content = content.replace(
  '<div class="detail-value">${calculateOrderWeight(order).toFixed(2)} KG</div>',
  '<div class="detail-value">${displayWeight}</div>'
);

// Barcode logic in printOrderLabel
const barcodeString = `          <div class="row">
            <div class="barcode-container" style="width: 100%;">
              <div class="barcode-font">*\${sanitizeHtml(order.id).toUpperCase()}*</div>
              <div class="barcode-text">\${sanitizeHtml(order.id).toUpperCase()}</div>
            </div>
          </div>`;

content = content.replace(barcodeString, `          \${isBikeParcel ? \`
          <div class="row">
            <div class="barcode-container" style="width: 100%;">
              <div class="barcode-font">*\${sanitizeHtml(order.id).toUpperCase()}*</div>
              <div class="barcode-text">\${sanitizeHtml(order.id).toUpperCase()}</div>
            </div>
          </div>
          \` : ''}`);

fs.writeFileSync(file, content);
console.log('Admin file modified successfully!');
