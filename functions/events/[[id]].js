// Cloudflare Pages Function: serves event detail pages for any slug
// The client-side JS (EventSlugResolver) reads the URL and fetches data from the API.

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const slug = url.pathname.replace('/events/', '').replace(/\/$/, '')

  // Try the exact static file first
  const staticPath = `/events/${slug}.html`
  const asset = await context.env.ASSETS.fetch(new Request(new URL(staticPath, url.origin)))
  if (asset.ok) {
    return asset
  }

  // If no static file exists, serve the template HTML
  const templatePath = '/events/_template.html'
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

  return new Response('Not Found', { status: 404 })
}
