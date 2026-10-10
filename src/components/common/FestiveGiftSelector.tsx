import { useState, useMemo } from 'react';
import { Gift, Check, Sparkles, AlertCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { CURATED_FESTIVE_GIFTS, getFestiveTierStatus, getGiftWeight, FestiveGiftItem } from '@/data/festiveOffer';
import { Link } from 'react-router-dom';

export interface SelectedFreeGift {
  id: string;
  name: string;
  category: 'Pickles' | 'Powders' | 'Fryums';
  weight: string;
  image: string;
  noGarlic?: boolean;
  price: 0;
}

interface FestiveGiftSelectorProps {
  subtotal: number;
  selectedGifts: SelectedFreeGift[];
  onChange: (gifts: SelectedFreeGift[]) => void;
  mode?: 'checkout' | 'cart';
}

export function FestiveGiftSelector({
  subtotal,
  selectedGifts,
  onChange,
  mode = 'checkout',
}: FestiveGiftSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Pickles' | 'Powders' | 'Fryums'>('All');
  const [garlicPreferences, setGarlicPreferences] = useState<Record<string, boolean>>({});

  const tierStatus = useMemo(() => getFestiveTierStatus(subtotal), [subtotal]);
  const { eligibleCount, tier, currentTierConfig, nextTierConfig, amountNeededForNext, progressPercent, isUnlocked } = tierStatus;

  // Filter items based on active tab
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return CURATED_FESTIVE_GIFTS;
    return CURATED_FESTIVE_GIFTS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const isGiftSelected = (id: string) => selectedGifts.some((g) => g.id === id);

  const toggleGift = (item: FestiveGiftItem) => {
    const isCurrentlySelected = isGiftSelected(item.id);

    if (isCurrentlySelected) {
      // Remove gift
      onChange(selectedGifts.filter((g) => g.id !== item.id));
    } else {
      // Check if limit reached
      if (selectedGifts.length >= eligibleCount) {
        // Can't add more if quota is full
        return;
      }
      const weight = getGiftWeight(item.category, subtotal);
      const isNoGarlic = !!garlicPreferences[item.id];
      const newGift: SelectedFreeGift = {
        id: item.id,
        name: item.name,
        category: item.category,
        weight,
        image: item.image,
        noGarlic: isNoGarlic,
        price: 0,
      };
      onChange([...selectedGifts, newGift]);
    }
  };

  const handleToggleGarlic = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !garlicPreferences[itemId];
    setGarlicPreferences((prev) => ({ ...prev, [itemId]: nextVal }));

    // If item is already selected, update its noGarlic state in the selected list
    if (isGiftSelected(itemId)) {
      onChange(
        selectedGifts.map((g) => (g.id === itemId ? { ...g, noGarlic: nextVal } : g))
      );
    }
  };

  // If below ₹1000 threshold
  if (!isUnlocked) {
    return (
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm text-lg">
            🪔
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-1.5">
                <span>Dussehra/Durga Pooja And Diwali/Deepavali Special Offer</span>
                <span className="text-xs bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                  100g/50g FREE
                </span>
              </h3>
              <span className="text-xs font-semibold text-amber-800">
                Unlock with ₹1,000+ Order
              </span>
            </div>

            <p className="text-xs sm:text-sm text-amber-900 mt-1">
              Add <strong className="text-red-700">₹{amountNeededForNext.toFixed(2)}</strong> more of any pickles or combos to choose <strong className="text-amber-950">1 FREE authentic delicacy (100g/50g)</strong> at checkout!
            </p>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-amber-800 font-medium mt-1">
                <span>Current: ₹{subtotal.toFixed(0)}</span>
                <span>Target: ₹1,000</span>
              </div>
            </div>

            {mode === 'checkout' && (
              <div className="mt-3 pt-3 border-t border-amber-200/70 flex items-center justify-between">
                <span className="text-xs text-amber-800">Want free gifts with this order?</span>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-orange-700 underline"
                >
                  Add More Items & Unlock <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // When ₹1000+ is unlocked
  const remainingChoices = eligibleCount - selectedGifts.length;
  const isQuotaFull = selectedGifts.length === eligibleCount;

  return (
    <div className="bg-gradient-to-b from-amber-50/90 to-orange-50/40 rounded-3xl p-4 sm:p-6 border-2 border-yellow-400 shadow-lg relative overflow-hidden">
      {/* Decorative Corner Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md text-2xl">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                Dussehra/Durga Pooja And Diwali/Deepavali Gift Selection
              </h3>
              <span className="text-xs bg-yellow-400 text-amber-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
                Tier {tier}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Eligible for <strong className="text-amber-800">{eligibleCount} FREE {eligibleCount > 1 ? 'items' : 'item'}</strong> (100g Pickles/Podis, 50g/100g Fryums)
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 border ${
              isQuotaFull
                ? 'bg-green-600 text-white border-green-700'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {isQuotaFull ? (
              <>
                <CheckCircle2 size={16} /> All {eligibleCount} Selected
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-amber-600" />
                <span>Selected: <strong>{selectedGifts.length}</strong> of <strong>{eligibleCount}</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Next Tier Upgrade Milestone Bar (if tier < 3) */}
      {nextTierConfig && (
        <div className="my-3 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs">
          <div className="flex justify-between items-center text-gray-700 font-medium mb-1.5">
            <span className="flex items-center gap-1 text-amber-900">
              <Sparkles size={14} className="text-yellow-500" />
              Add <strong>₹{amountNeededForNext.toFixed(2)}</strong> more to unlock{' '}
              <strong className="text-orange-700">{nextTierConfig.badge}</strong>!
            </span>
            <Link to="/products" className="text-amber-800 hover:text-orange-700 font-bold underline">
              Shop more
            </Link>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Selection Reminder Banner */}
      {!isQuotaFull ? (
        <div className="my-3 p-3 bg-amber-100/80 rounded-xl border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-700 shrink-0" />
          <span>
            Please pick <strong>{remainingChoices} more free {remainingChoices > 1 ? 'items' : 'item'}</strong> below before completing checkout.
          </span>
        </div>
      ) : (
        <div className="my-3 p-3 bg-green-100/80 rounded-xl border border-green-300 text-xs text-green-900 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-700 shrink-0" />
          <span>
            🎉 Perfect! Your {eligibleCount} free {eligibleCount > 1 ? 'items have' : 'item has'} been selected and will be added at <strong className="text-green-950">₹0</strong>.
          </span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 my-3 overflow-x-auto pb-1">
        {(['All', 'Pickles', 'Powders', 'Fryums'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-amber-100/60 border border-amber-200'
            }`}
          >
            {cat} {cat === 'Pickles' || cat === 'Powders' ? '(100g)' : cat === 'Fryums' ? (tier >= 2 ? '(100g)' : '(50g)') : ''}
          </button>
        ))}
      </div>

      {/* Grid of Selectable Gift Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 max-h-96 overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const selected = isGiftSelected(item.id);
          const weight = getGiftWeight(item.category, subtotal);
          const isGarlicFree = garlicPreferences[item.id] || false;
          const disabled = !selected && isQuotaFull;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!disabled) toggleGift(item);
              }}
              className={`relative rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 ${
                selected
                  ? 'bg-white border-green-600 shadow-md ring-2 ring-green-600/20'
                  : disabled
                  ? 'bg-gray-50/70 border-gray-200 opacity-60 cursor-not-allowed'
                  : 'bg-white border-amber-200/80 hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Image & Selected Badge */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Weight Badge */}
                  <span className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-sm text-yellow-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {weight}
                  </span>

                  {/* Selection Checkmark */}
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-gray-900 text-xs line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[10px] text-amber-700 font-medium truncate mb-1">
                  {item.teluguName}
                </p>
                <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">
                  {item.tagline}
                </p>
              </div>

              <div>
                {/* No Garlic Option Checkbox if applicable */}
                {item.hasNoGarlicOption && (
                  <div
                    onClick={(e) => handleToggleGarlic(item.id, e)}
                    className="mt-1 pt-1.5 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isGarlicFree}
                      onChange={() => {}} // Handled by parent div
                      className="w-3.5 h-3.5 text-green-600 rounded border-gray-300 pointer-events-none"
                    />
                    <span className="font-semibold text-green-800">No Garlic</span>
                  </div>
                )}

                {/* Selection Action Button */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) toggleGift(item);
                  }}
                  className={`w-full mt-2 py-1.5 rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1 ${
                    selected
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                      : disabled
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                  }`}
                >
                  {selected ? (
                    <>
                      <Check size={12} /> Selected
                    </>
                  ) : (
                    <span>+ Pick as Free Gift</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Items Summary Chips */}
      {selectedGifts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-amber-200">
          <p className="text-xs font-bold text-gray-700 mb-2">
            Selected Free Gift{selectedGifts.length > 1 ? 's' : ''}:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedGifts.map((gift) => (
              <div
                key={gift.id}
                className="bg-white border border-green-300 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs text-gray-800 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-semibold">{gift.name}</span>
                <span className="text-gray-500">({gift.weight})</span>
                {gift.noGarlic && (
                  <span className="bg-green-100 text-green-800 text-[10px] px-1 rounded font-bold">
                    No Garlic
                  </span>
                )}
                <span className="text-green-700 font-extrabold text-[11px]">FREE (₹0)</span>
                <button
                  type="button"
                  onClick={() => onChange(selectedGifts.filter((g) => g.id !== gift.id))}
                  className="text-gray-400 hover:text-red-500 font-bold ml-1 text-sm leading-none"
                  aria-label="Remove gift"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
