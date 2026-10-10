// Ejecuta una consulta SQL contra el proyecto con el token de gestión: node q.cjs "<sql>"
const TOK = process.env.SB_TOKEN;
(async () => {
  const r = await fetch('https://api.supabase.com/v1/projects/oshhdrnkegmhnasgwbpg/database/query', {
    method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: process.argv[2] })
  });
  const t = await r.text(); console.log(r.status, t);
})();
