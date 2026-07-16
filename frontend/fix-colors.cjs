const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      content = content.replace(/text-white\/[0-9]+/g, 'text-slate-500');
      content = content.replace(/border-white\/[0-9]+/g, 'border-slate-200');
      content = content.replace(/bg-white\/[0-9]+/g, 'bg-slate-50');
      content = content.replace(/\btext-white\b/g, 'text-slate-900');
      
      // Fix buttons
      content = content.replace(/btn-primary([^"'>]*?)text-slate-900/g, 'btn-primary$1text-white');
      content = content.replace(/bg-(blue|indigo|green|red|amber)-[56]00([^"'>]*?)text-slate-900/g, 'bg-$1-$2$3text-white');
      
      fs.writeFileSync(p, content);
      console.log(`Processed ${p}`);
    }
  }
}

walk('src/pages');
walk('src/components');
