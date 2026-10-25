/**
 * Small helpers for server handlers that answer native HTML form
 * submissions with a full HTML document (no client JavaScript involved).
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlDocument(title: string, body: string, status = 200): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body {
    font-family: "Work Sans", ui-sans-serif, system-ui, sans-serif;
    background: #fcfaf4;
    color: #1d2b22;
    margin: 0;
    padding: 3rem 1.25rem;
  }
  .sheet {
    max-width: 640px;
    margin: 0 auto;
    background: #fffef9;
    border: 1px solid #e3ddc8;
    border-radius: 10px;
    padding: 2.5rem;
  }
  h1 {
    font-family: "Instrument Serif", Georgia, serif;
    font-size: 2rem;
    margin: 0 0 0.5rem;
  }
  p.lede { color: #55655c; margin: 0 0 1.5rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
  th, td { text-align: left; padding: 0.55rem 0.6rem; border-bottom: 1px solid #eee8d4; vertical-align: top; }
  th { color: #55655c; font-weight: 600; width: 40%; }
  .badge {
    display: inline-block; background: #dcefe2; color: #1d5233;
    border: 1px solid #b7d8c2; padding: 0.25rem 0.7rem; border-radius: 999px;
    font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem;
  }
  .note {
    margin-top: 1.5rem; background: #f6f2e4; border: 1px solid #e8dfc0;
    border-radius: 8px; padding: 1rem 1.1rem; font-size: 0.9rem; color: #5c5741;
  }
  code {
    font-family: ui-monospace, Menlo, monospace; background: #f1eddd;
    padding: 0.1rem 0.35rem; border-radius: 4px; font-size: 0.85em;
    word-break: break-all;
  }
  a.back {
    display: inline-block; margin-top: 1.5rem; background: #1d5233; color: #fcfaf4;
    padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600;
  }
  ul.errors { color: #a33; }
</style>
</head>
<body>
<div class="sheet">${body}</div>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
