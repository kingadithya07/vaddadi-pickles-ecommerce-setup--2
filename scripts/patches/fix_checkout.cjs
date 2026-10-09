const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

const searchRegex = /    const order: Order = \{\s*id: orderId,\s*userId: user!\.id,\s*userName: finalName,\s*userEmail: user!\.email,\s*userPhone: finalPhone,\s*items: cart,\s*total: subtotal,\s*discount,\s*finalAmount: total,\s*let validatedAffiliateCode = undefined;\s*const rawAffiliateCode = localStorage\.getItem\('affiliate_ref'\);\s*if \(rawAffiliateCode\) \{\s*try \{\s*const \{ data, error \} = await supabase\s*\.from\('affiliates'\)\s*\.select\('status'\)\s*\.eq\('referral_code', rawAffiliateCode\)\s*\.single\(\);\s*if \(!error && data && data\.status === 'active'\) \{\s*validatedAffiliateCode = rawAffiliateCode;\s*\} else \{\s*localStorage\.removeItem\('affiliate_ref'\);\s*\}\s*\} catch \(err\) \{\s*console\.error\('Affiliate validation error', err\);\s*\}\s*\}\s*couponCode: appliedCoupon\?\.code,\s*affiliateCode: validatedAffiliateCode,/s;

const replacement = `    let validatedAffiliateCode = undefined;
    const rawAffiliateCode = localStorage.getItem('affiliate_ref');
    if (rawAffiliateCode) {
      try {
        const { data, error } = await supabase
          .from('affiliates')
          .select('status')
          .eq('referral_code', rawAffiliateCode)
          .single();
        if (!error && data && data.status === 'active') {
          validatedAffiliateCode = rawAffiliateCode;
        } else {
          localStorage.removeItem('affiliate_ref');
        }
      } catch (err) {
        console.error('Affiliate validation error', err);
      }
    }

    const order: Order = {
      id: orderId,
      userId: user!.id,
      userName: finalName,
      userEmail: user!.email,
      userPhone: finalPhone,
      items: cart,
      total: subtotal,
      discount,
      finalAmount: total,
      couponCode: appliedCoupon?.code,
      affiliateCode: validatedAffiliateCode,`;

if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replacement);
    fs.writeFileSync('src/pages/Checkout.tsx', content);
    console.log("Successfully fixed Checkout.tsx");
} else {
    console.log("Regex didn't match.");
}
