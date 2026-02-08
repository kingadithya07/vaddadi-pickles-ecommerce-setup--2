import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store';

export function Products() {
  const products = useStore((state) => state.products);
  const combos = useStore((state) => state.combos);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

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
      stock: combo.stock
    }],
    inStock: combo.stock > 0,
    rating: 5, // Default rating for combos
    reviews: 0,
    bestSeller: false,
  })), [combos]);

  const allItems = useMemo(() => [...products, ...comboProducts], [products, comboProducts]);

  const filteredProducts = useMemo(() => allItems.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || product.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  }), [allItems, search, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
