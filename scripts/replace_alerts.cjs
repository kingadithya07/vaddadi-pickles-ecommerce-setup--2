const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(srcDir, filePath => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    if (content.includes('alert(')) {
      if (!content.includes('toast')) {
        const importStatement = "import toast from 'react-hot-toast';\n";
        // Insert after last import
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
          const endOfImport = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
        } else {
          content = importStatement + content;
        }
      }

      // Very basic regex replacements (careful with templates!)
      content = content.replace(/alert\((['"`])(.*?[sS]uccess.*?)\1\)/g, 'toast.success($1$2$1)');
      content = content.replace(/alert\(/g, 'toast.error(');

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
      }
    }
  }
});
