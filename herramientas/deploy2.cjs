// node deploy2.cjs <slug> <carpeta con index.ts>   (verify_jwt desactivado: la llaman triggers y el navegador)
const fs = require('fs'), path = require('path');
const TOK = process.env.SB_TOKEN, REF = 'oshhdrnkegmhnasgwbpg';
(async () => {
  const [slug, dir] = [process.argv[2], path.resolve(process.argv[3])];
  const fd = new FormData();
  fd.append('metadata', JSON.stringify({ name: slug, entrypoint_path: 'index.ts', verify_jwt: false }));
  fd.append('file', new Blob([fs.readFileSync(path.join(dir, 'index.ts'), 'utf8')], { type: 'application/typescript' }), 'index.ts');
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/functions/deploy?slug=${slug}`, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK }, body: fd });
  const t = await r.text(); console.log('deploy', slug, r.status, t.slice(0, 260));
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
