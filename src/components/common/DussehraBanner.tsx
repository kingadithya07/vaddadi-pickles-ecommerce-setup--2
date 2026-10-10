import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Sparkles, ArrowRight, CheckCircle2, HelpCircle, ShieldCheck, Truck } from 'lucide-react';
import { FESTIVE_TIERS_CONFIG, CURATED_FESTIVE_GIFTS } from '@/data/festiveOffer';
import { FestiveWelcomeModal } from './FestiveWelcomeModal';

export function DussehraBanner() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'All' | 'Pickles' | 'Powders' | 'Fryums'>('All');

  const filteredGifts = selectedCategoryTab === 'All' 
    ? CURATED_FESTIVE_GIFTS 
    : CURATED_FESTIVE_GIFTS.filter(g => g.category === selectedCategoryTab);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-900 via-orange-950 to-amber-950 text-white py-10 sm:py-14 md:py-16 shadow-2xl border-y-4 border-yellow-500/80">
      {/* Decorative Traditional Rangoli & Light Overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Top Auspicious Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 via-amber-400/30 to-yellow-500/20 border border-yellow-400/50 backdrop-blur-md shadow-lg">
            <span className="text-xl">🪔</span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-yellow-300">
              Dussehra/Durga Pooja And Diwali/Deepavali Mega Festive Offer
            </span>
            <span className="text-xl">🌸</span>
          </div>
        </div>

        {/* Main Heading & Intro */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-tight">
            Order Pickles & Combos, Get <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent underline decoration-amber-400 decoration-wavy decoration-2">
              FREE Festive Gifts
            </span> At Checkout!
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-amber-100/90 max-w-2xl mx-auto font-medium">
            Celebrate this grand festive season of Dussehra/Durga Pooja And Diwali/Deepavali with handcrafted authentic Andhra flavours. Valid on all <strong className="text-yellow-300">individual products & combo packs</strong>. Choose your complimentary treats when you check out!
          </p>
        </div>

        {/* The 3 Tier Offer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {FESTIVE_TIERS_CONFIG.map((tier) => {
            const isHighlight = tier.tierNumber === 2;
            return (
              <div
                key={tier.tierNumber}
                className={`relative rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between ${
                  isHighlight
                    ? 'bg-gradient-to-b from-amber-800/90 via-amber-900/90 to-orange-950 border-2 border-yellow-400 shadow-2xl shadow-yellow-500/20 md:-translate-y-2'
                    : 'bg-black/30 backdrop-blur-md border border-amber-500/30 hover:border-amber-400/60 shadow-xl'
                }`}
              >
                {/* Popular Pill */}
                {isHighlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black text-xs uppercase px-4 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1">
                    <Sparkles size={13} /> Most Popular Tier
                  </div>
                )}

                <div>
                  {/* Tier Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
                      {tier.title}
                    </span>
                    <span className="px-3 py-1 bg-yellow-400 text-amber-950 text-xs sm:text-sm font-black rounded-full shadow-sm">
                      {tier.badge}
                    </span>
                  </div>

                  {/* Order Threshold Amount */}
                  <div className="mb-4">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-baseline gap-1">
                      <span>Orders Above</span>
                      <span className="text-yellow-300">₹{tier.minAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-200 mt-1 font-medium">
                      Pick <strong className="text-white underline">{tier.freeGiftCount} item{tier.freeGiftCount > 1 ? 's' : ''}</strong> from the curated gift list!
                    </p>
                  </div>

                  {/* Item Weights & Specs */}
                  <div className="space-y-2.5 py-4 border-y border-amber-500/20 text-xs sm:text-sm text-amber-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-yellow-400 shrink-0" />
                      <span>
                        Pickles & Powders weight: <strong className="text-white">{tier.pickleWeight} each</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-yellow-400 shrink-0" />
                      <span>
                        Fryums (Vadiyalu) weight: <strong className="text-white">{tier.fryumWeight} each</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-yellow-400 shrink-0" />
                      <span>
                        <strong className="text-green-300">FREE Home Delivery</strong> all over India
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier Action */}
                <div className="mt-6">
                  <Link
                    to="/products"
                    className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md ${
                      isHighlight
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-amber-950 font-black'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <span>Claim With ₹{tier.minAmount}+ Order</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Curated Chooseable Free Products Showcase */}
        <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-yellow-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
                <Gift size={16} /> 16 Handcrafted Delicacies Available
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Choose Free Gifts From These Items At Checkout
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-black/50 rounded-xl border border-amber-500/30 overflow-x-auto">
              {(['All', 'Pickles', 'Powders', 'Fryums'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedCategoryTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    selectedCategoryTab === tab
                      ? 'bg-yellow-400 text-amber-950 shadow-sm'
                      : 'text-amber-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Eligible Gifts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredGifts.slice(0, 8).map((gift) => (
              <div
                key={gift.id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/50 rounded-2xl p-3 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 bg-black/40">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-400/30">
                      {gift.category === 'Fryums' ? '50g / 100g' : '100g'}
                    </span>
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                      FREE
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-yellow-300 transition-colors">
                    {gift.name}
                  </h4>
                  <p className="text-[11px] text-amber-200/80 font-medium truncate mb-1">
                    {gift.teluguName}
                  </p>
                  <p className="text-[10px] text-gray-300 line-clamp-1">
                    {gift.tagline}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300">
                  <span>₹0 at checkout</span>
                  <CheckCircle2 size={14} className="text-green-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <p className="text-xs text-amber-200 text-center sm:text-left">
              💡 <em>Weights automatically adapt based on your cart value (e.g. 100g for Pickles/Podis, 50g/100g for Fryums).</em>
            </p>
            <button
              onClick={() => setShowDetailsModal(true)}
              className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 hover:underline"
            >
              <HelpCircle size={14} /> View All 16 Eligible Items & Full Terms
            </button>
          </div>
        </div>

        {/* How It Works & Call To Action Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-300 uppercase tracking-widest">
              <ShieldCheck size={16} /> Fast & Easy Claim Process
            </div>
            <h4 className="text-lg sm:text-2xl font-black text-white">
              Ready to claim your free Dussehra/Durga Pooja And Diwali/Deepavali gifts?
            </h4>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              1. Add normal items or combos to cart ➔ 2. Cross ₹1000, ₹2500, or ₹5000 ➔ 3. Tap your free gifts in the checkout selector ➔ 4. Enjoy authentic homemade pickles delivered to your home!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-amber-400/40 text-xs sm:text-sm font-semibold transition"
            >
              Read Offer Details
            </button>
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-amber-950 font-black text-sm sm:text-base shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Shop All Products</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Offer Details Modal */}
      {showDetailsModal && (
        <FestiveWelcomeModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </section>
  );
}
