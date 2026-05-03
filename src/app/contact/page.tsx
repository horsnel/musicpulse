import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the MusicPulse team — feedback, partnerships, advertising, and API access inquiries.',
}

export default function ContactPage() {
  return (
    <div className="relative z-10">
      <div className="max-w-[900px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-10 sm:pb-20">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
          style={{ background: 'var(--green-dim)', border: '1px solid rgba(29,185,84,0.25)', color: 'var(--green)' }}>
          Get In Touch
        </span>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.04em] leading-[1.05] mb-4">
          Contact Us
        </h1>
        <p className="text-[14px] sm:text-[17px] text-[var(--text2)] leading-relaxed font-medium mb-14">
          Have a question, feedback, or partnership idea? We would love to hear from you. Fill out the form below and we will get back to you within 24 hours.
        </p>

        {/* Contact form */}
        <div className="mp-card p-8 mb-6 sm:mb-10">
          <div className="grid md:grid-cols-2 gap-3 sm:gap-5 mb-5">
            <div>
              <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text3)] mb-2 block">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] text-[14px] font-medium px-4 py-3 rounded-xl outline-none focus:border-[var(--green)] transition-colors placeholder:text-[var(--text3)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text3)] mb-2 block">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] text-[14px] font-medium px-4 py-3 rounded-xl outline-none focus:border-[var(--green)] transition-colors placeholder:text-[var(--text3)]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text3)] mb-2 block">Topic</label>
            <select className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] text-[14px] font-medium px-4 py-3 rounded-xl outline-none focus:border-[var(--green)] transition-colors appearance-none cursor-pointer">
              <option value="">Select a topic</option>
              <option value="feedback">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="advertising">Advertising Inquiry</option>
              <option value="api">API Access Request</option>
              <option value="partnership">Partnership Proposal</option>
              <option value="press">Press & Media</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--text3)] mb-2 block">Message</label>
            <textarea
              rows={5}
              placeholder="Tell us what's on your mind..."
              className="w-full bg-[var(--bg3)] border border-[var(--border2)] text-[var(--text)] text-[14px] font-medium px-4 py-3 rounded-xl outline-none focus:border-[var(--green)] transition-colors placeholder:text-[var(--text3)] resize-none"
            />
          </div>

          <button className="flex items-center gap-2 bg-[var(--green)] text-black text-[14px] font-bold px-7 py-3.5 rounded-xl hover:bg-[#1ed760] transition-all cursor-pointer border-none">
            Send Message
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="8,3 12,7 8,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
          </button>
        </div>

        {/* Quick links */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'API Access',
              desc: 'Want to build on MusicPulse data? Request API access and join the developer waitlist.',
              href: '/api-docs',
              color: 'var(--blue)',
            },
            {
              title: 'Advertising',
              desc: 'Reach millions of music fans with sponsored placements and newsletter features.',
              href: '/advertise',
              color: 'var(--gold)',
            },
            {
              title: 'How It Works',
              desc: 'Curious about our data pipeline? Learn how we collect and deliver chart data.',
              href: '/how-it-works',
              color: 'var(--green)',
            },
          ].map(link => (
            <a key={link.title} href={link.href} className="mp-card p-4 sm:p-6 group no-underline hover:border-[var(--border2)] transition-all">
              <h3 className="text-[15px] font-bold tracking-[-0.02em] mb-2 group-hover:text-[var(--green)] transition-colors" style={{ color: link.color }}>
                {link.title}
              </h3>
              <p className="text-[13px] text-[var(--text3)] leading-relaxed font-medium">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
