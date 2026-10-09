import { useState } from 'react';
import { X, Copy, CheckCircle2, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { SITE_URL } from '@/utils/constants';
import toast from 'react-hot-toast';

export interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
}

export const CATEGORIES_DATA: CategoryData[] = [
  {
    id: 'pickles',
    name: 'Pickles',
    icon: '🥭',
    color: 'from-orange-400 to-orange-500',
    tagline: 'Traditional Andhra Jars',
    description: 'Authentic Andhra pickles handcrafted with grandmother recipes, pure cold-pressed oils, and farm-fresh ingredients with no artificial preservatives.',
  },
  {
    id: 'fryums',
    name: 'Fryums',
    icon: '🥨',
    color: 'from-yellow-400 to-yellow-500',
    tagline: 'Crispy Sun-Dried Delights',
    description: 'Crispy, sun-dried Andhra fryums (vadiyalu) made from pure rice and lentils. The classic crunchy accompaniment for every Indian meal.',
  },
  {
    id: 'powders',
    name: 'Powders',
    icon: '🌶️',
    color: 'from-red-400 to-red-500',
    tagline: 'Aromatic Rice & Tiffin Podis',
    description: 'Aromatic roasted Andhra spice powders (karam podis) including Kandi Podi, Karivepaku Podi, and Idli Karam. Best savored with hot rice and ghee.',
  },
  {
    id: 'combo',
    name: 'Combos',
    icon: '🎁',
    color: 'from-purple-400 to-purple-500',
    tagline: 'Discounted Value Packs',
    description: 'Handpicked value combos pairing our best-selling pickles, fryums, and powders at special bundled discounts. Great for family hampers.',
  },
];

interface CategoryShareModalProps {
  category: CategoryData;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryShareModal({ category, isOpen, onClose }: CategoryShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const refCode = localStorage.getItem('affiliate_ref');
  const shareUrl = `${SITE_URL}/products?category=${encodeURIComponent(category.id)}${refCode ? `&ref=${encodeURIComponent(refCode)}` : ''}`;

  const shareText = `Explore authentic homemade *${category.name}* from Vaddadi Pickles! ${category.icon}✨\n\n${category.description}\n\n🛒 Browse the ${category.name} Collection: ${shareUrl}\n\n🌟 *Refer & Earn*: Share with friends and earn a 10% lifetime commission on every order!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(`${category.name} category link copied!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${category.name} - Vaddadi Pickles`,
          text: `Check out the ${category.name} collection at Vaddadi Pickles! ${category.icon}`,
          url: shareUrl,
        });
        onClose();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-full">
              <Share2 size={18} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">
              Share Category
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Preview Card */}
        <div className="p-5">
          <div className="bg-gradient-to-br from-gray-50 to-amber-50/30 p-4 rounded-2xl border border-gray-100 mb-5 relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl shadow-sm shrink-0`}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 bg-green-100/70 px-2 py-0.5 rounded-md inline-block mb-1">
                  {category.tagline}
                </span>
                <h4 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                  {category.name}
                </h4>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>

            {/* Refer & Earn Banner */}
            <div className="mt-3.5 pt-3 border-t border-gray-200/60 flex items-center gap-2 text-xs text-amber-900 bg-amber-50/80 -mx-1 -mb-1 px-3 py-2 rounded-xl">
              <Sparkles size={14} className="text-amber-600 shrink-0" />
              <span>Earn <strong>10% commission</strong> when friends order from this category!</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Share to WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm text-sm sm:text-base"
            >
              <MessageCircle size={20} />
              Share on WhatsApp
            </a>

            {/* Native Share if available */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm text-sm"
              >
                <Share2 size={18} />
                More Sharing Options
              </button>
            )}

            {/* Link Copy Box */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Or copy category link directly</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-gray-600 flex-1 outline-none truncate font-mono select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
