import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Gift } from 'lucide-react';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('hasSeenComboPopup');
    
    if (!hasSeenPopup) {
      // Delay the popup slightly for a better user experience
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenComboPopup', 'true');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-center text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 text-purple-400/30">
            <Gift size={100} />
          </div>
          <Gift size={48} className="mx-auto mb-3 text-yellow-300" />
          <h2 className="text-2xl font-bold mb-1">Special Offer!</h2>
          <p className="text-purple-100">Try our new Combos & Save More</p>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6">
            Get the best value with our carefully curated pickle combos. Perfect for your family or as a gift!
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/products?category=Combo"
              onClick={() => setIsOpen(false)}
              className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <Gift size={18} />
              View Combos
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
