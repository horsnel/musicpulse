// Cloudflare Pages Function: serves artist detail pages for any slug
// Works around Next.js static export not generating HTML for every possible slug.
// The client-side JS (ArtistSlugResolver) reads the URL and fetches data from the API.

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const slug = url.pathname.replace('/artists/', '').replace(/\/$/, '')

  // Try the exact static file first
  const staticPath = `/artists/${slug}.html`
  const asset = await context.env.ASSETS.fetch(new Request(new URL(staticPath, url.origin)))
  if (asset.ok) {
    return asset
  }

  // If no static file exists, serve the template HTML that the client-side JS will hydrate
  const templatePath = '/artists/_template.html'
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
