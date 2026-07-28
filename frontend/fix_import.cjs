const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}
const files = walk('src');
files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import("@/integrations/supabase/client.server")')) {
    content = content.replace(/const\s+\{\s*supabaseAdmin\s*\}\s*=\s*await\s+import\(\"@\/integrations\/supabase\/client\.server\"\);/g, 'const supabaseAdmin = {} as any;');
    fs.writeFileSync(file, content);
  }
});
