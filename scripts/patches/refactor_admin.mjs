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

// 4. handleEditProduct and handleEditCombo
content = content.replace(
  /const handleEditProduct = \(product: Product\) => {([\s\S]*?)setNewProduct\(\{/g,
  "const handleEditProduct = (product: Product) => {\n    setActiveTab('products');\n    window.scrollTo({ top: 0, behavior: 'auto' });\n    setNewProduct({"
);
content = content.replace(
  /const handleEditCombo = \(combo: ComboProduct\) => {([\s\S]*?)setNewCombo\(\{/g,
  "const handleEditCombo = (combo: ComboProduct) => {\n    setActiveTab('combos');\n    setEditingComboId(combo.id);\n    setNewCombo({"
);

// 5. handleAddProduct
// Change `if (isCombo) {` to `if (activeTab === 'combos') {`
content = content.replace(/if \(isCombo\) \{/, "if (activeTab === 'combos') {");

// 6. Fix forms in products tab and combos tab
// Let's replace the whole {activeTab === 'products' && (...)} block.
// To do this reliably, we can search for the start and the end of the block.
// But it's risky with regex. Let's do it manually using standard JavaScript string methods.

const productsTabStart = content.indexOf("{activeTab === 'products' && (");
const ordersTabStart = content.indexOf("{activeTab === 'orders' && (");

const productsContent = content.substring(productsTabStart, ordersTabStart);

// We need to split productsContent into two: one for activeTab === 'products' (without isCombo checks, just product form)
// and one for activeTab === 'combos' (just combo form)

// This is getting complex to script perfectly. Let's instead just use the existing `isCombo` boolean but tie it to the activeTab!
// Oh! I can just do:
// const isCombo = activeTab === 'combos';
// Then I don't need to manually split the DOM structures! 
// Let's rewrite the script to do this simpler approach.
