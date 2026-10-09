const fs = require('fs');
const file = 'src/pages/Checkout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  const paymentAmount = total.toFixed(2);',
  '  const finalOrderTotal = total + (isAdmin ? Number(adminAdditionalAmount) || 0 : 0);\n  const paymentAmount = finalOrderTotal.toFixed(2);'
);

content = content.replace(
  /finalAddress = \{\s*\.\.\.newAddress,\s*street: newAddress\.street2 \? `\$\{newAddress\.street\.trim\(\)\}, \$\{newAddress\.street2\.trim\(\)\}` : newAddress\.street\.trim\(\)\s*\};/g,
  'finalAddress = { \n        ...newAddress, \n        street: newAddress.street2 ? `${newAddress.street.trim()}, ${newAddress.street2.trim()}` : newAddress.street.trim(),\n        isOffline: isAdmin,\n        adminAdditionalAmount: isAdmin ? (Number(adminAdditionalAmount) || 0) : 0\n      };'
);

content = content.replace(
  /finalAddress = \{\s*street: selectedAddr\.street,\s*city: selectedAddr\.city,\s*state: selectedAddr\.state,\s*pincode: selectedAddr\.pincode,\s*country: selectedAddr\.country,?\s*\};/g,
  'finalAddress = {\n        street: selectedAddr.street,\n        city: selectedAddr.city,\n        state: selectedAddr.state,\n        pincode: selectedAddr.pincode,\n        country: selectedAddr.country,\n        isOffline: isAdmin,\n        adminAdditionalAmount: isAdmin ? (Number(adminAdditionalAmount) || 0) : 0\n      };'
);

content = content.replace(
  /finalAmount: total,\s*couponCode: appliedCoupon\?\.code,/g,
  'finalAmount: finalOrderTotal,\n      couponCode: appliedCoupon?.code,'
);

content = content.replace(
  '<span>₹{displayAmount}</span>',
  '<span>₹{paymentAmount}</span>'
);

content = content.replace(
  /<div className=\"mt-4 mb-4\">\s*<label className=\"flex items-start gap-2 cursor-pointer select-none\">/g,
  '{isAdmin && (<div className=\"mt-4 mb-4\"><label className=\"block text-sm font-medium text-gray-700 mb-1\">Additional Amount (Admin only)</label><input type=\"number\" value={adminAdditionalAmount || \'\'} onChange={(e) => setAdminAdditionalAmount(Number(e.target.value))} placeholder=\"e.g., extra shipping, weight\" className=\"w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500\" /></div>)}\n            <div className=\"mt-4 mb-4\">\n              <label className=\"flex items-start gap-2 cursor-pointer select-none\">'
);

fs.writeFileSync(file, content);
console.log('File modified successfully!');
