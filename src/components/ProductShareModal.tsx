import React, { useState } from 'react';
import { X, Copy, CheckCircle2, MessageCircle, Share2 } from 'lucide-react';
import { Product } from '../types';
import { SITE_URL } from '../utils/constants';
import toast from 'react-hot-toast';

interface ProductShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductShareModal({ product, isOpen, onClose }: ProductShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const refCode = localStorage.getItem('affiliate_ref');
  const shareUrl = `${SITE_URL}/products?productId=${encodeURIComponent(product.id)}${refCode ? `&ref=${encodeURIComponent(refCode)}` : ''}`;

  const minPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price))
    : 0;

  const isCombo = product.category === 'Combo';
  const priceText = minPrice > 0 ? `(₹${minPrice})` : '';

  const shareText = `Check out this delicious ${isCombo ? 'combo pack' : 'homemade pickle'} from Vaddadi Pickles: *${product.name}* ${priceText}! 🥒✨\n\nAuthentic Andhra recipes handcrafted with traditional love.\n\n🛒 Order here: ${shareUrl}\n\n🌟 *Refer & Earn*: Did you know? You can earn a 10% commission by sharing our pickles!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} - Vaddadi Pickles`,
          text: `Check out ${product.name} from Vaddadi Pickles! 🥒`,
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
              Share {isCombo ? 'Combo' : 'Product'}
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

        {/* Product Preview Card */}
        <div className="p-5">
          <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100 mb-5">
            <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
              {product.image.startsWith('http') || product.image.startsWith('/') ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{product.image}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</h4>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
              {minPrice > 0 && (
                <p className="text-sm font-bold text-green-600 mt-1">₹{minPrice}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Share to WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm"
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
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Or copy link directly</label>
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
