import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'MusicPulse API — access real-time chart data, trending tracks, and artist information programmatically.',
}

export default function ApiDocsPage() {
  return (
    <div className="relative z-10">
      <div className="max-w-[900px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-10 sm:pb-20">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
          style={{ background: 'var(--blue-dim)', border: '1px solid rgba(67,97,255,0.25)', color: 'var(--blue)' }}>
          Developer Tools
        </span>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
          MusicPulse API
        </h1>
        <p className="text-[14px] sm:text-[17px] text-[var(--text2)] leading-relaxed font-medium mb-14">
          Access real-time chart data, trending tracks, and artist information programmatically. Build your own music data applications on top of the MusicPulse platform.
        </p>

        {/* Base URL */}
        <div className="mp-card p-4 sm:p-6 mb-8">
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[var(--text3)] mb-2">Base URL</div>
          <code className="text-[14px] font-mono text-[var(--green)] bg-[var(--bg3)] px-3 py-1.5 rounded-lg">
            https://api.musicpulse.com/v1
          </code>
        </div>

        {/* Endpoints */}
        <div className="space-y-6 mb-14">
          {[
            {
              method: 'GET',
              path: '/charts',
              desc: 'Retrieve chart entries filtered by platform, region, and date. Returns paginated results with song metadata, position changes, streams, and sparkline data.',
              params: [
                { name: 'platform', type: 'string', desc: 'spotify | apple | youtube | shazam | billboard' },
                { name: 'region', type: 'string', desc: 'global | nigeria | us | uk | africa | brazil | korea' },
                { name: 'limit', type: 'number', desc: 'Results per page (default: 50, max: 200)' },
                { name: 'date', type: 'string', desc: 'ISO date string (default: latest)' },
              ],
            },
            {
              method: 'GET',
              path: '/trending',
              desc: 'Get trending tracks from TikTok, Twitter, and YouTube. Includes badges (hot, rising, new, peak), surge percentages, and metric counts.',
              params: [
                { name: 'platform', type: 'string', desc: 'tiktok | twitter | youtube | spotify' },
                { name: 'limit', type: 'number', desc: 'Results per page (default: 20, max: 100)' },
              ],
            },
            {
              method: 'GET',
              path: '/artists/{slug}',
              desc: 'Get detailed artist information including monthly listeners, genres, social links, and top tracks across platforms.',
              params: [
                { name: 'slug', type: 'string', desc: 'Artist slug (e.g. "burna-boy")' },
              ],
            },
            {
              method: 'GET',
              path: '/albums/new',
              desc: 'Retrieve the latest album, EP, and single releases. Filter by type and date range.',
              params: [
                { name: 'type', type: 'string', desc: 'album | ep | single | compilation' },
                { name: 'limit', type: 'number', desc: 'Results per page (default: 20)' },
              ],
            },
          ].map(endpoint => (
            <div key={endpoint.path} className="mp-card overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg3)]">
                <span className={`text-[11px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-md ${
                  endpoint.method === 'GET' ? 'bg-[var(--green-dim)] text-[var(--green)]' : 'bg-[var(--blue-dim)] text-[var(--blue)]'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-[14px] font-mono text-[var(--text)]">{endpoint.path}</code>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-[13px] text-[var(--text2)] leading-relaxed font-medium mb-4">{endpoint.desc}</p>
                <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[var(--text3)] mb-2">Parameters</div>
                <div className="space-y-2">
                  {endpoint.params.map(param => (
                    <div key={param.name} className="flex items-start gap-3 text-[12px]">
                      <code className="font-mono text-[var(--green)] bg-[var(--bg3)] px-2 py-0.5 rounded flex-shrink-0">{param.name}</code>
                      <span className="text-[var(--text3)] font-medium">{param.type}</span>
                      <span className="text-[var(--text2)] font-medium">— {param.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Authentication */}
        <div className="mp-card p-5 sm:p-7 mb-8">
          <h2 className="text-[18px] font-bold tracking-[-0.02em] mb-3">Authentication</h2>
          <p className="text-[14px] text-[var(--text2)] leading-relaxed font-medium mb-4">
            All API requests require an API key passed via the <code className="font-mono text-[var(--green)] bg-[var(--bg3)] px-1.5 py-0.5 rounded text-[12px]">Authorization</code> header. Rate limits are 1,000 requests per hour on the free tier and 10,000 requests per hour on the pro tier.
          </p>
          <div className="bg-[var(--bg3)] rounded-lg p-4 font-mono text-[13px] text-[var(--text2)]">
            <div className="text-[var(--text3)]">{'// Example request'}</div>
            <div><span className="text-[var(--blue)]">curl</span> -H <span className="text-[var(--gold)]">"Authorization: Bearer YOUR_API_KEY"</span> \</div>
            <div className="pl-4"><span className="text-[var(--green)]">https://api.musicpulse.com/v1/charts?platform=spotify&limit=10</span></div>
          </div>
        </div>

        <div className="mp-card p-8 text-center">
          <h2 className="text-[22px] font-black tracking-[-0.03em] mb-3">Request API Access</h2>
          <p className="text-[14px] text-[var(--text2)] max-w-[440px] mx-auto leading-relaxed font-medium mb-6">
            API access is currently in private beta. Join the waitlist and we will reach out when your access is ready.
          </p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-[var(--blue)] text-white text-[14px] font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all no-underline">
            Join the Waitlist
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="8,3 12,7 8,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          </a>
        </div>
      </div>
    </div>
  )
}
