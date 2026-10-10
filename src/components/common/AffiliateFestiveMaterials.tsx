import { useState } from 'react';
import { Copy, Check, MessageCircle, Share2, Sparkles, Gift, ExternalLink, ChevronDown, ChevronUp, Tag, Percent } from 'lucide-react';
import { SITE_URL } from '@/utils';
import { FESTIVE_OFFER_NAME, FESTIVE_TIERS_CONFIG, CURATED_FESTIVE_GIFTS } from '@/data/festiveOffer';
import toast from 'react-hot-toast';

interface AffiliateFestiveMaterialsProps {
  referralCode: string;
  commissionRate?: number;
  compact?: boolean;
}

export function AffiliateFestiveMaterials({
  referralCode,
  commissionRate = 10,
  compact = false,
}: AffiliateFestiveMaterialsProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'social' | 'personal'>('whatsapp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCatalogCheatSheet, setShowCatalogCheatSheet] = useState(false);

  const homeReferralLink = `${SITE_URL}/?ref=${referralCode}`;
  const productsReferralLink = `${SITE_URL}/products?ref=${referralCode}`;

  const copyText = (text: string, key: string, label = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(label);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  // Pre-written festive marketing templates
  const templates = {
    whatsapp: {
      title: 'WhatsApp & Telegram Broadcast',
      description: 'Comprehensive festive announcement with full offer tier breakdown and emojis.',
      text: `🪔 *${FESTIVE_OFFER_NAME} Mega Festive Offer!* 🌸

Celebrate this grand festive season with authentic homemade Andhra pickles, podis & crunchy fryums from *Vaddadi Pickles*!

🎁 *Claim Complimentary FREE Gifts On Your Order:*
✨ *Order above ₹1,000*: Choose *1 FREE Item* (Pickle/Powder 100g, Fryums 50g)
✨ *Order above ₹2,500*: Choose *2 FREE Items* (100g each)
✨ *Order above ₹5,000*: Choose *3 FREE Items* (100g each)

✅ *Valid on both individual products & combo packs!*
🚚 *FREE All-India Delivery* on orders above ₹1,000!
🌿 Handcrafted with cold-pressed oils, pure ingredients & traditional heirloom recipes.

🛒 *Tap here to order & pick your FREE festive gifts*:
${homeReferralLink}

(Use code *${referralCode}* to claim)`,
    },
    social: {
      title: 'Short Status & Social Post',
      description: 'Quick, punchy caption perfect for WhatsApp Status, Instagram, and Facebook.',
      text: `🪔 Craving authentic homemade Andhra pickles this festive season? 

*Vaddadi Pickles* is celebrating *${FESTIVE_OFFER_NAME}* with up to *3 FREE GIFTS* (100g each) on pickles & combos! 🎁

✨ Free Delivery across India on orders above ₹1000!
✨ Authentic Andhra taste, zero preservatives.

Order your favourite festive treats here 👇
${homeReferralLink}`,
    },
    personal: {
      title: 'Friends & Family Greeting',
      description: 'Warm, personal festive recommendation with genuine homemade appeal.',
      text: `Namaste! 🙏✨

Wishing you and your family a blessed ${FESTIVE_OFFER_NAME}! 

If you are planning to order traditional Andhra pickles, spice powders or fryums for the festivities, check out *Vaddadi Pickles*. They are currently running their grand festive offer where you get *FREE 100g gift jars* with every order above ₹1000, ₹2500 & ₹5000.

Check out their menu and pick your free gifts:
${productsReferralLink}`,
    },
  };

  const currentTemplate = templates[activeTab];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${FESTIVE_OFFER_NAME} - Vaddadi Pickles`,
          text: currentTemplate.text,
          url: homeReferralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyText(currentTemplate.text, 'native-share', 'Promo message copied!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-900 via-orange-950 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-yellow-500/60 relative overflow-hidden">
      {/* Decorative festive ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-yellow-500/30 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-sm">
              <span>🪔</span> Festive Affiliate Marketing Kit <span>🎁</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              {FESTIVE_OFFER_NAME} Materials
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl font-medium">
              Share this mega festive offer with your unique referral link! Because festive orders frequently cross <span className="text-yellow-300 font-bold">₹1,000, ₹2,500 & ₹5,000</span>, your <span className="text-yellow-300 font-bold">{commissionRate}% commission</span> can earn you <span className="text-yellow-300 font-bold">₹100 to ₹500+</span> per referred order!
            </p>
          </div>

          {/* Quick Commission Badge */}
          <div className="shrink-0 bg-black/40 border border-yellow-400/40 rounded-2xl p-4 text-center sm:text-right backdrop-blur-md">
            <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs text-yellow-300 font-bold uppercase">
              <Percent size={14} /> Your Commission
            </div>
            <div className="text-2xl sm:text-3xl font-black text-yellow-400">
              {commissionRate}%
            </div>
            <div className="text-[11px] text-amber-200/80 font-mono">
              Ref Code: <span className="text-white font-bold">{referralCode}</span>
            </div>
          </div>
        </div>

        {/* Quick Share Links Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Home Page Link */}
          <div className="bg-black/30 border border-amber-500/40 rounded-2xl p-4 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-yellow-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Tag size={14} /> Main Festive Homepage Link
                </span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-amber-100/80 mb-2 truncate font-mono bg-black/40 px-3 py-2 rounded-lg border border-amber-500/20">
                {homeReferralLink}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyText(homeReferralLink, 'home-link', 'Homepage referral link copied!')}
                className="flex-1 py-2 px-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'home-link' ? (
                  <><Check size={14} /> Copied</>
                ) : (
                  <><Copy size={14} /> Copy Link</>
                )}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(templates.whatsapp.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Products Catalog Link */}
          <div className="bg-black/30 border border-amber-500/40 rounded-2xl p-4 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-yellow-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Gift size={14} /> Products & Combos Catalog Link
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Direct Shop
                </span>
              </div>
              <p className="text-[11px] text-amber-100/80 mb-2 truncate font-mono bg-black/40 px-3 py-2 rounded-lg border border-amber-500/20">
                {productsReferralLink}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyText(productsReferralLink, 'products-link', 'Products catalog referral link copied!')}
                className="flex-1 py-2 px-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'products-link' ? (
                  <><Check size={14} /> Copied</>
                ) : (
                  <><Copy size={14} /> Copy Link</>
                )}
              </button>
              <a
                href={productsReferralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-white/20"
              >
                <ExternalLink size={14} /> Open
              </a>
            </div>
          </div>
        </div>

        {/* Ready-to-Share Promotional Message Templates */}
        <div className="bg-black/40 border border-yellow-500/40 rounded-3xl p-5 sm:p-6 backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" />
                Pre-Written Promotional Templates
              </h3>
              <p className="text-xs text-amber-200/80">
                Click any tab below to preview and instantly copy or share high-converting festive copy.
              </p>
            </div>

            {/* Template Format Selector Tabs */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-amber-500/30 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'whatsapp'
                    ? 'bg-yellow-500 text-black shadow-sm'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                Detailed Message
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'social'
                    ? 'bg-yellow-500 text-black shadow-sm'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                Short Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'personal'
                    ? 'bg-yellow-500 text-black shadow-sm'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                Personal Greeting
              </button>
            </div>
          </div>

          {/* Active Template Content Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
              <span>{currentTemplate.title} ({currentTemplate.description})</span>
              <span className="text-[11px] text-amber-400/80">Includes your referral link</span>
            </div>

            <div className="relative">
              <pre className="w-full bg-black/60 border border-yellow-500/30 rounded-2xl p-4 sm:p-5 text-amber-100 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-yellow-400 selection:text-black">
                {currentTemplate.text}
              </pre>
            </div>

            {/* Action Buttons for the active template */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(currentTemplate.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle size={16} />
                <span>Share On WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => copyText(currentTemplate.text, `template-${activeTab}`, 'Festive promotional message copied!')}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg"
              >
                {copiedKey === `template-${activeTab}` ? (
                  <><Check size={16} /> Copied Message!</>
                ) : (
                  <><Copy size={16} /> Copy Message Text</>
                )}
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-white/20"
                title="Share via device menu"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">Device Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tier Reference Cheat Sheet */}
        <div className="bg-black/30 border border-amber-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowCatalogCheatSheet(!showCatalogCheatSheet)}>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-yellow-300">
              <Gift size={16} />
              <span>Offer Details Cheat Sheet (What your customers get)</span>
            </div>
            <button
              type="button"
              className="text-amber-300 hover:text-white p-1 rounded-lg transition"
            >
              {showCatalogCheatSheet ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {showCatalogCheatSheet && (
            <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-4">
              {/* Tiers Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FESTIVE_TIERS_CONFIG.map((tier) => (
                  <div
                    key={tier.tierNumber}
                    className="bg-black/50 border border-yellow-500/30 rounded-xl p-3 text-xs"
                  >
                    <div className="flex items-center justify-between text-yellow-300 font-black mb-1">
                      <span>{tier.title}</span>
                      <span className="bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full text-[10px]">
                        {tier.badge}
                      </span>
                    </div>
                    <p className="text-amber-100 font-semibold mb-2">
                      Spend ₹{tier.minAmount}{tier.maxAmount ? ` - ₹${tier.maxAmount}` : '+'}
                    </p>
                    <ul className="text-[11px] text-amber-200/80 space-y-1">
                      <li>• Pickles: {tier.pickleWeight} free</li>
                      <li>• Powders: {tier.powderWeight} free</li>
                      <li>• Fryums: {tier.fryumWeight} free</li>
                    </ul>
                  </div>
                ))}
              </div>

              {/* 16 Curated Gift Items Preview */}
              <div>
                <p className="text-xs font-bold text-amber-200 mb-2">
                  16 Curated Free Gift Items Available at Checkout:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CURATED_FESTIVE_GIFTS.map((g) => (
                    <span
                      key={g.id}
                      className="text-[10px] bg-amber-950/80 border border-amber-500/40 text-amber-200 px-2.5 py-1 rounded-full font-medium"
                    >
                      {g.name} ({g.category})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
