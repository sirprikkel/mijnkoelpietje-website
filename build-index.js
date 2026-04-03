const fs = require('fs');
const dirs = ['content/verhalen', 'content/kunstwerken', 'content/nieuws', 'content/sponsoren', 'content/activiteiten'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const ids = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').map(f => f.replace('.json', ''));
  fs.writeFileSync(`${dir}/index.json`, JSON.stringify(ids));
  console.log(`${dir}/index.json → ${ids.length} items: ${ids.join(', ')}`);
});
