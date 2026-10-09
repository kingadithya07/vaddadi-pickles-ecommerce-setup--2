import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Share2 } from 'lucide-react';
import { ProductCard, ComboDetailsModal, ProductDetailsModal, CategoryShareModal, CategoryData, CATEGORIES_DATA } from '@/components';
import { useStore } from '@/store';
import { Product } from '@/types';

export function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId: routeProductId } = useParams<{ productId?: string }>();

  const products = useStore((state) => state.products);
  const combos = useStore((state) => state.combos);

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory.toLowerCase());
  const [sharedModalItem, setSharedModalItem] = useState<Product | null>(null);
  const [autoOpenedId, setAutoOpenedId] = useState<string | null>(null);
  const [sharingCategory, setSharingCategory] = useState<CategoryData | null>(null);

  const categories = ['all', 'pickles', 'fryums', 'powders', 'combo'];

  const rawProductId = queryParams.get('productId') || queryParams.get('product') || routeProductId;
  const urlProductId = rawProductId ? decodeURIComponent(rawProductId).trim() : null;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get('search');
    const urlCategory = queryParams.get('category');
    const currentProductId = queryParams.get('productId') || queryParams.get('product') || routeProductId;

    if (urlSearch !== null) {
      setSearch(urlSearch);
    }
    if (urlCategory !== null) {
      setCategory(urlCategory.toLowerCase());
    } else if (!currentProductId) {
      setCategory('all');
    }
    if (!currentProductId) {
      window.scrollTo(0, 0);
    }
  }, [location.search, routeProductId]);

  const calculateComboWeight = (comboProducts: { variantWeight: string }[]) => {
    const totalGrams = comboProducts.reduce((sum, p) => {
      const weight = p.variantWeight.toLowerCase();
      if (weight.includes('kg')) {
        return sum + parseFloat(weight) * 1000;
      }
      return sum + parseFloat(weight);
    }, 0);

    return totalGrams >= 1000
      ? `${totalGrams / 1000}kg`
      : `${totalGrams}g`;
  };

  // Convert combos to pseudo-products for display
  const comboProducts = useMemo(() => (combos || []).map(combo => ({
    id: combo.id,
    name: combo.name,
    description: combo.description,
    image: combo.image,
    category: 'Combo',
    variants: [{
      weight: `Pack (${calculateComboWeight(combo.products)})`,
      price: combo.comboPrice,
      mrp: combo.originalPrice,
      stock: combo.stock
    }],
    inStock: combo.stock > 0,
    rating: 5,
    reviews: 0,
    bestSeller: false,
  })), [combos]);

  const allItems: Product[] = useMemo(() => [...products, ...comboProducts], [products, comboProducts]);

  // Immediately open the shared product or combo when link is accessed
  useEffect(() => {
    if (urlProductId && allItems.length > 0) {
      const target = allItems.find(
        (p) => p.id === urlProductId || p.id.toLowerCase() === urlProductId.toLowerCase()
      );

      if (target) {
        // Adjust category tab if needed so it is shown in the catalog
        if (target.category === 'Combo') {
          setCategory('combo');
        } else if (category !== 'all' && category !== target.category.toLowerCase()) {
          setCategory('all');
        }

        // Open details modal immediately
        if (autoOpenedId !== target.id) {
          setSharedModalItem(target);
          setAutoOpenedId(target.id);
        }

        // Scroll into view & pulse highlight in background
        const timer = setTimeout(() => {
          const el = document.getElementById(`product-${target.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-green-500', 'ring-offset-2', 'transition-all', 'duration-500');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-green-500', 'ring-offset-2');
            }, 3500);
          }
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [urlProductId, allItems, autoOpenedId, category]);

  const handleCloseSharedModal = () => {
    setSharedModalItem(null);
    if (routeProductId) {
      navigate('/products', { replace: true });
    } else {
      const params = new URLSearchParams(location.search);
      params.delete('productId');
      params.delete('product');
      const remaining = params.toString() ? `?${params.toString()}` : '';
      navigate(`${location.pathname}${remaining}`, { replace: true });
    }
  };

  const filteredProducts = useMemo(() => allItems.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || product.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const aTotalStock = (a.variants || []).reduce((sum, v) => sum + v.stock, 0);
    const bTotalStock = (b.variants || []).reduce((sum, v) => sum + v.stock, 0);
    const aIsOutOfStock = !a.inStock || aTotalStock <= 0;
    const bIsOutOfStock = !b.inStock || bTotalStock <= 0;
    
    if (aIsOutOfStock === bIsOutOfStock) return 0;
    return aIsOutOfStock ? 1 : -1;
  }), [allItems, search, category]);

  const activeCategoryData = useMemo(() => {
    if (category === 'all') return null;
    return CATEGORIES_DATA.find((c) => c.id.toLowerCase() === category.toLowerCase()) || null;
  }, [category]);

  // Page title and meta descriptions for SEO / Social
  const pageTitle = sharedModalItem
    ? `${sharedModalItem.name} - Vaddadi Pickles | Refer & Earn 10%`
    : activeCategoryData
    ? `${activeCategoryData.name} - Vaddadi Pickles | Refer & Earn 10%`
    : 'All Products - Vaddadi Pickles | Refer & Earn 10%';

  const pageDescription = sharedModalItem
    ? `${sharedModalItem.description || sharedModalItem.name}. Authentic homemade Andhra taste. 🌟 Refer & Earn: Share with friends and earn 10% lifetime commission on every order!`
    : activeCategoryData
    ? `${activeCategoryData.description} 🌟 Refer & Earn: Share with friends and earn 10% lifetime commission on every order!`
    : 'Browse authentic homemade pickles, powders & fryums. 🌟 Refer & Earn: Share with friends and earn 10% lifetime commission on every order!';

  const pageImage = sharedModalItem && sharedModalItem.image && (sharedModalItem.image.startsWith('http') || sharedModalItem.image.startsWith('/'))
    ? (sharedModalItem.image.startsWith('http') ? sharedModalItem.image : `https://vaddadi-pickles.onrender.com${sharedModalItem.image}`)
    : 'https://vaddadi-pickles.onrender.com/og-image.jpg';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={`https://vaddadi-pickles.onrender.com/products${location.search}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Collection</h1>
        <p className="text-gray-600">Choose from our wide range of authentic homemade products</p>
      </div>

      {/* Loading banner if opening shared product while data initializes */}
      {urlProductId && !sharedModalItem && allItems.length === 0 && (
        <div className="flex items-center justify-center gap-3 py-4 px-6 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium animate-pulse shadow-sm">
          <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          Opening shared product details...
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full capitalize whitespace-nowrap transition flex-shrink-0 ${category === cat
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
          {activeCategoryData && (
            <button
              type="button"
              onClick={() => setSharingCategory(activeCategoryData)}
              className="px-3.5 py-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0 shadow-sm"
              title={`Share ${activeCategoryData.name} Category`}
            >
              <Share2 size={13} />
              Share Category
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}

      {/* Auto-Opened Shared Product or Combo Modal */}
      {sharedModalItem && (sharedModalItem.category === 'Combo' ? (
        <ComboDetailsModal
          product={sharedModalItem}
          isOpen={true}
          onClose={handleCloseSharedModal}
        />
      ) : (
        <ProductDetailsModal
          product={sharedModalItem}
          isOpen={true}
          onClose={handleCloseSharedModal}
        />
      ))}

      {/* Category Share Modal */}
      {sharingCategory && (
        <CategoryShareModal
          category={sharingCategory}
          isOpen={true}
          onClose={() => setSharingCategory(null)}
        />
      )}
    </div>
  );
}
