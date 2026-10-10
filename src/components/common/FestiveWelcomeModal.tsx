import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, Gift, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { FESTIVE_TIERS_CONFIG, CURATED_FESTIVE_GIFTS } from '@/data/festiveOffer';

interface FestiveWelcomeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceOpen?: boolean;
}

export function FestiveWelcomeModal({ isOpen: controlledIsOpen, onClose, forceOpen = false }: FestiveWelcomeModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const showModal = isControlled ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    if (isControlled) return;

    if (forceOpen) {
      setInternalIsOpen(true);
      return;
    }

    // Check if customer has already seen the Dussehra offer popup in this session
    const hasSeen = sessionStorage.getItem('hasSeenDussehraOfferPopup');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
        sessionStorage.setItem('hasSeenDussehraOfferPopup', 'true');
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isControlled, forceOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 border-2 border-amber-300 my-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 bg-white/80 hover:bg-white p-2 rounded-full transition-colors z-20 shadow-md border border-gray-200"
          aria-label="Close offer modal"
        >
          <X size={20} />
        </button>

        {/* Festive Header Banner */}
        <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 p-6 sm:p-8 text-center text-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/30 text-yellow-100 border border-yellow-300/40 rounded-full text-xs sm:text-sm font-semibold mb-3 tracking-wide backdrop-blur-sm">
            <span>🪔</span> Dussehra/Durga Pooja And Diwali/Deepavali Offer <span>🌸</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm text-yellow-300 mb-2">
            Grand Festive Free Gift Offer!
          </h2>
          <p className="text-sm sm:text-base text-amber-100 max-w-lg mx-auto font-medium">
            Celebrate the festivities with traditional Andhra pickles & combos. Enjoy complimentary handmade delicacies on every qualifying order!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Offer Rules Highlight */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
            <span className="text-2xl mt-0.5">🎁</span>
            <div>
              <p className="font-bold text-amber-950 mb-0.5">Applicable to Normal Products & Combos!</p>
              <p className="text-amber-800">
                Your entire order value counts towards unlocking free gifts. When you proceed to checkout, easily choose your complimentary items for <strong className="text-green-700">₹0</strong>.
              </p>
            </div>
          </div>

          {/* 3 Tier Cards */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" /> Festive Reward Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {FESTIVE_TIERS_CONFIG.map((tier) => (
                <div
                  key={tier.tierNumber}
                  className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                    tier.tierNumber === 2
                      ? 'border-yellow-500 bg-gradient-to-b from-yellow-50/90 to-amber-50 shadow-md'
                      : 'border-gray-200 bg-gray-50/60'
                  }`}
                >
                  {tier.tierNumber === 2 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">{tier.title}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-extrabold rounded-full">
                        {tier.badge}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-gray-900 mb-1">
                      Orders Above ₹{tier.minAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 font-medium mb-3">
                      Pick <strong className="text-amber-700">{tier.freeGiftCount} item{tier.freeGiftCount > 1 ? 's' : ''}</strong> from the curated gift list!
                    </p>
                    <div className="text-[11px] text-gray-500 space-y-1 border-t border-gray-200/60 pt-2 mb-3">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                        <span>Pickles/Podis: <strong>{tier.pickleWeight}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                        <span>Fryums: <strong>{tier.fryumWeight}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-green-600 shrink-0" />
                        <span>Free Shipping Included</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Eligible Items Preview */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Gift size={16} className="text-red-500" /> Curated Free Gifts You Can Pick
              </h3>
              <span className="text-[11px] text-amber-700 font-medium">16 Authentic Delicacies</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CURATED_FESTIVE_GIFTS.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-amber-50/50 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-white shadow-sm shrink-0 border border-gray-200"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              + 8 more varieties including Kandi Podi, Karivepaku Podi, Curd Chillies, and Sago Fryums!
            </p>
          </div>

          {/* How It Works Steps */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200">
            <h4 className="text-xs font-bold uppercase text-orange-900 tracking-wider mb-2">How It Works:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Add pickles & combos to reach ₹1000, ₹2500, or ₹5000</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Select your free gift(s) in the festive box at checkout</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>We freshly pack & ship everything together for free!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-2.5 justify-end items-center">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-200 transition text-sm"
          >
            I'll Browse First
          </button>
          <Link
            to="/products"
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            Shop Pickles & Combos Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
