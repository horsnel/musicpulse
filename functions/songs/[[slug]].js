// Cloudflare Pages Function: serves song detail pages for any slug
// Works around Next.js static export not generating HTML for every possible slug.
// The client-side JS (SongDetailClient) reads the URL and fetches data from the API.

export async function onRequest(context) {
  const url = new URL(context.request.url)

  // Check if the static file exists in the asset manifest
  // If it does, let the default handler serve it
  const slug = url.pathname.replace('/songs/', '').replace(/\/$/, '')
  const staticPath = `/songs/${slug}.html`

  // Try to get the static asset
  const asset = await context.env.ASSETS.fetch(new Request(new URL(staticPath, url.origin)))
  if (asset.ok) {
    return asset
  }

  // If no static file exists, serve a template HTML that the client-side JS will hydrate
  // We use the pre-rendered apt-rose-bruno-mars page as a template
  const templatePath = '/songs/apt-rose-bruno-mars.html'
  const template = await context.env.ASSETS.fetch(new Request(new URL(templatePath, url.origin)))

  if (template.ok) {
    // Return the template HTML - the client JS will detect the actual slug from the URL
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
