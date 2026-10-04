import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, IndianRupee, TrendingUp } from 'lucide-react';

export function AffiliatePromoToast() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed or seen the affiliate promo in this session
    const hasSeenPromo = sessionStorage.getItem('hasSeenAffiliatePromo');
    
    if (!hasSeenPromo) {
      // Show this promo after 30 seconds of browsing
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000); // 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenAffiliatePromo', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] sm:bottom-6 sm:left-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden w-[90vw] max-w-sm relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors z-10"
        >
          <X size={16} />
        </button>
        
        <div className="flex flex-row p-4 gap-4 items-center">
          <div className="bg-green-100 p-3 rounded-full text-green-600 shrink-0">
            <IndianRupee size={24} className="animate-pulse" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1">
              Earn with us! <TrendingUp size={14} className="text-green-600" />
            </h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Love our pickles? Join our Affiliate Program and earn money for every referral.
            </p>
            <Link
              to="/affiliate"
              onClick={handleDismiss}
              className="inline-block bg-green-600 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
