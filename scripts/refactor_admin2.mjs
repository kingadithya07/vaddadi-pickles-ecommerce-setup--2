import fs from 'fs';

const filePath = 'src/pages/Admin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Tab type
content = content.replace(
  /type Tab = 'dashboard' \| 'products' \| 'orders' \| 'payments' \| 'coupons' \| 'labels' \| 'settings' \| 'feedback' \| 'abandoned' \| 'affiliates';/,
  "type Tab = 'dashboard' | 'products' | 'combos' | 'orders' | 'payments' | 'coupons' | 'labels' | 'settings' | 'feedback' | 'abandoned' | 'affiliates';"
);

// 2. Update navigation dropdown (mobile)
content = content.replace(
  /{ id: 'products', label: 'Products' },/,
  "{ id: 'products', label: 'Products' },\n                { id: 'combos', label: 'Combos' },"
);

// 3. Update navigation desktop
content = content.replace(
  /{ id: 'products', label: 'Products', icon: ShoppingBag },/,
  "{ id: 'products', label: 'Products', icon: ShoppingBag },\n            { id: 'combos', label: 'Combos', icon: Package },"
);

// 4. Replace isCombo state with computed variable
content = content.replace(
  /const \[isCombo, setIsCombo\] = useState\(false\);/,
  "const isCombo = activeTab === 'combos';"
);

// 5. Update handleEditProduct and handleEditCombo to no longer call setIsCombo, but instead setActiveTab
content = content.replace(
  /setActiveTab\('products'\);\n    setIsCombo\(false\);/,
  "setActiveTab('products');"
);
content = content.replace(
  /setActiveTab\('products'\);\n    setIsCombo\(true\);/,
  "setActiveTab('combos');"
);

// 6. Update the products tab condition to also render for combos
content = content.replace(
  /{activeTab === 'products' && \(/,
  "{(activeTab === 'products' || activeTab === 'combos') && ("
);

// 7. Remove the "Product" / "Combo" toggle buttons from the form header
const toggleButtonsRegex = /<div className="bg-gray-100 p-1 rounded-lg flex">[\s\S]*?<\/div>\s*<\/div>\s*\{isCombo \?/m;
content = content.replace(toggleButtonsRegex, "</div>\n\n              {isCombo ?");

// 8. Remove combos from Dashboard Desktop View
// It looks like:
// {/* Combos List */}
// <div className="bg-white rounded-xl shadow-md overflow-hidden">
// ...
// </div>
// Wait, I can just find the Combos table inside `activeTab === 'dashboard'` and delete it. But it's easier to remove it manually with string splitting.
const dashboardCombosDesktopStart = content.indexOf('{/* Combos List */}');
const dashboardCombosDesktopEnd = content.indexOf('{/* Mobile Recent Orders & Combos Card View */}');

if (dashboardCombosDesktopStart !== -1 && dashboardCombosDesktopEnd !== -1) {
  content = content.slice(0, dashboardCombosDesktopStart) + content.slice(dashboardCombosDesktopEnd);
}

// 9. Remove combos from Dashboard Mobile View
// It looks like:
// {/* Combos Cards */}
// {combos.length > 0 && (
//   <div className="mt-8">
// ...
//   </div>
// )}
const mobileCombosStart = content.indexOf('{/* Combos Cards */}');
const mobileCombosEnd = content.indexOf('</div>\n            </div>\n          </div>\n        )}\n\n        {/* Abandoned Carts */}');

if (mobileCombosStart !== -1 && mobileCombosEnd !== -1) {
  content = content.slice(0, mobileCombosStart) + content.slice(mobileCombosEnd);
}

// 10. Add the Combos List to the bottom of the Combos tab
// Wait, in `(activeTab === 'products' || activeTab === 'combos')`, there is already a `<div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">` that renders `products.map(...)`.
// We can just say: `if (isCombo) { render combo list } else { render product list }`
// Let's find the Product List section inside that tab.
const productListStart = content.indexOf('{/* Product List */}');
const productListEnd = content.indexOf('</div>\n        )}\n\n        {/* Orders Management */}');

const productListContent = content.slice(productListStart, productListEnd);

const comboListHTML = `
            {/* Combos List */}
            {isCombo && (
              <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50">
                  <h3 className="text-xl font-bold text-gray-800">Active Combos</h3>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {combos.length} Combos
                  </span>
                </div>
                <div className="overflow-x-auto hidden md:block">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Combo</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {combos.map((combo) => (
                        <tr key={combo.id} className="border-b hover:bg-gray-50 bg-purple-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                {combo.image.startsWith('http') || combo.image.startsWith('/') ? (
                                  <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl">{combo.image}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{combo.name}</div>
                                <div className="text-xs text-gray-500">Combo</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="font-semibold text-green-600">₹{combo.comboPrice}</div>
                            <div className="text-xs text-gray-500 line-through">₹{combo.originalPrice}</div>
                          </td>
                          <td className="px-6 py-3 text-sm">
                            {combo.stock} Packs
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => handleEditCombo(combo)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-500 transition mr-2"
                              title="Edit Combo"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteCombo(combo.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-500 transition"
                              title="Delete Combo"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile Combos */}
                <div className="md:hidden p-4 grid gap-4 bg-gray-50">
                  {combos.map((combo) => (
                    <div key={combo.id} className="p-4 border border-purple-100 rounded-xl bg-white shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                            {combo.image.startsWith('http') || combo.image.startsWith('/') ? (
                              <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">{combo.image}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-800 text-sm">{combo.name}</h5>
                            <span className="text-[10px] text-purple-600 font-semibold uppercase">Combo Item</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => handleEditCombo(combo)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg h-fit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => deleteCombo(combo.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg h-fit">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                        <div className="text-xs">
                          <span className="text-green-600 font-bold">₹{combo.comboPrice}</span>{' '}
                          <span className="text-gray-400 line-through ml-1">₹{combo.originalPrice}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{combo.stock} Packs in stock</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
`;

// wrap the product list in `{!isCombo && (`
content = content.replace(
  productListContent,
  `{/* Product List */}\n            {!isCombo && (\n              <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">` +
  productListContent.replace(`{/* Product List */}`, ``).replace(`<div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">`, ``) +
  `\n            )}\n` + comboListHTML
);

fs.writeFileSync(filePath, content);
console.log("Refactoring complete");
