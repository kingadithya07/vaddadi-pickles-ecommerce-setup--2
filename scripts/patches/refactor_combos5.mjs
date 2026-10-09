import fs from 'fs';

const filePath = 'src/pages/Admin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Wrap products list and append combos list

const productsListStart = content.indexOf('{/* Products List */}');
const ordersManagementStart = content.indexOf('{/* Orders Management */}');

// The block to wrap: from {/* Products List */} to just before `          </div>\n        )}\n\n        {/* Orders Management */}`
// Specifically, let's capture up to the end of the products array map.
const productsListContent = content.slice(productsListStart, ordersManagementStart);

// It ends with:
//             </div>
//           </div>
//         )}
// Let's strip those ending tags out to find the exact boundary of the div wrapping the lists.
const boundaryRegex = /(?:\n\s*<\/div>\n\s*){2}\)\}\n\s*$/;
const actualListContent = productsListContent.replace(boundaryRegex, '');
const endingTags = productsListContent.match(boundaryRegex)[0];

const comboListHTML = `
            {/* Combos List */}
            {isCombo && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden mt-12">
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
                              <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-2xl overflow-hidden border shrink-0">
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

const newProductsList = `{!isCombo && (\n              <div className="w-full">\n                ` +
  actualListContent.replace(`{/* Products List */}`, `{/* Products List */}`) +
  `\n              </div>\n            )}\n` + comboListHTML;

content = content.replace(productsListContent, newProductsList + endingTags);

// Remove Combos from Dashboard safely
const dashboardCombosRegex = /\{\/\* Render Combos \*\/\}[\s\S]*?\n\s*\}\)\}/;
content = content.replace(dashboardCombosRegex, '');

const mobileCombosRegex = /\{\/\* Combos Cards \*\/\}[\s\S]*?\n\s*\}\)\}\n\s*<\/div>\n\s*\)\}/;
content = content.replace(mobileCombosRegex, '');

fs.writeFileSync(filePath, content);
console.log("Written!");
