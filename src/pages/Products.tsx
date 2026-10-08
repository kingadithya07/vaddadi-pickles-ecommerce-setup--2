import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';

export function Products() {
  const products = useStore((state) => state.products);
  const combos = useStore((state) => state.combos);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory.toLowerCase());

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get('search');
    const urlCategory = queryParams.get('category');
    const urlProductId = queryParams.get('productId') || queryParams.get('product');

    if (urlSearch !== null) {
      setSearch(urlSearch);
    }
    if (urlCategory !== null) {
      setCategory(urlCategory.toLowerCase());
    } else if (!urlProductId) {
      setCategory('all');
    }
    if (!urlProductId) {
      window.scrollTo(0, 0);
    }
  }, [location.search]);

  const categories = ['all', 'pickles', 'fryums', 'powders', 'combo'];

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
    rating: 5, // Default rating for combos
    reviews: 0,
    bestSeller: false,
  })), [combos]);

  const allItems = useMemo(() => [...products, ...comboProducts], [products, comboProducts]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlProductId = queryParams.get('productId') || queryParams.get('product');

    if (urlProductId && allItems.length > 0) {
      const target = allItems.find(p => p.id === urlProductId);
      if (target) {
        if (target.category === 'Combo') {
          setCategory('combo');
        } else if (category !== 'all' && category !== target.category.toLowerCase()) {
          setCategory('all');
        }
      }

      const timer = setTimeout(() => {
        const el = document.getElementById(`product-${urlProductId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-green-500', 'ring-offset-2', 'transition-all', 'duration-500');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-green-500', 'ring-offset-2');
          }, 3500);
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [location.search, allItems]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>All Products - Vaddadi Pickles</title>
        <meta name="description" content="Browse authentic homemade pickles, powders & fryums. 🌟 Refer & Earn: Share with friends and earn 10% lifetime commission on every order!" />
        <meta property="og:title" content="All Products - Vaddadi Pickles | Refer & Earn 10%" />
        <meta property="og:description" content="Browse authentic homemade pickles, powders & fryums. 🌟 Refer & Earn: Share with friends and earn 10% lifetime commission on every order!" />
        <meta property="og:image" content="https://vaddadipickles.com/og-image.jpg" />
        <meta property="og:url" content="https://vaddadipickles.com/products" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="All Products - Vaddadi Pickles | Refer & Earn 10%" />
        <meta name="twitter:description" content="Browse authentic homemade pickles, powders & fryums. 🌟 Refer & Earn: Share with friends and earn 10% lifetime commission on every order!" />
        <meta name="twitter:image" content="https://vaddadipickles.com/og-image.jpg" />
      </Helmet>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Collection</h1>
        <p className="text-gray-600">Choose from our wide range of authentic homemade products</p>
      </div>

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
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full capitalize whitespace-nowrap transition flex-shrink-0 ${category === cat
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
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
    </div>
  );
}
