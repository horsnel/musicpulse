// Cloudflare Pages Function: serves blog article pages for any slug
// Works around Next.js static export not generating HTML for every possible slug.
// The client-side JS detects the actual slug from the URL and fetches data from the API.

export async function onRequest(context) {
  const url = new URL(context.request.url)

  // Check if the static file exists in the asset manifest
  const slug = url.pathname.replace('/blog/', '').replace(/\/$/, '')
  const staticPath = `/blog/${slug}.html`

  // Try to get the static asset
  const asset = await context.env.ASSETS.fetch(new Request(new URL(staticPath, url.origin)))
  if (asset.ok) {
    return asset
  }

  // If no static file exists, serve a template HTML that the client-side JS will hydrate
  const templatePath = '/blog/template-article.html'
  const template = await context.env.ASSETS.fetch(new Request(new URL(templatePath, url.origin)))

  if (template.ok) {
    return new Response(template.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }

  // Fallback: return 404
  return new Response('Not Found', { status: 404 })
}
