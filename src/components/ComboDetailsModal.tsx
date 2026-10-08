import { useState } from 'react';
import { X, Share2 } from 'lucide-react';
import { useStore } from '../store';
import { Product } from '../types';
import { ProductShareModal } from './ProductShareModal';

interface ComboDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ComboDetailsModal({ product, isOpen, onClose }: ComboDetailsModalProps) {
  const combos = useStore((state) => state.combos);
  const allProducts = useStore((state) => state.products);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!isOpen) return null;

  const combo = combos.find((c) => c.id === product.id);
  if (!combo) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-purple-600 rounded-full transition-colors shadow-sm"
              title="Share Combo"
              aria-label="Share Combo"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6 border-b border-gray-100 bg-purple-50">
            <h2 className="text-2xl font-bold text-gray-800 pr-20">{combo.name}</h2>
            <p className="text-gray-600 mt-2">{combo.description}</p>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Items in this Combo:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {combo.products.map((item, index) => {
                const itemProduct = allProducts.find((p) => p.id === item.productId);
                if (!itemProduct) return null;

                return (
                  <div key={`${item.productId}-${index}`} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                      {itemProduct.image.startsWith('http') || itemProduct.image.startsWith('/') ? (
                        <img src={itemProduct.image} alt={itemProduct.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{itemProduct.image}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">{itemProduct.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Weight: <span className="font-medium text-gray-700">{item.variantWeight}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Combo Price</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">₹{combo.comboPrice}</span>
                <span className="text-sm text-gray-400 line-through">₹{combo.originalPrice}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 text-sm shadow-sm"
              >
                <Share2 size={16} /> Share Combo
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <ProductShareModal
        product={product}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
}
