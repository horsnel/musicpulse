import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MusicPulse terms of service — the rules and guidelines for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="relative z-10">
      <div className="max-w-[800px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-10 sm:pb-20">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.04em] leading-[1.05] mb-3">
          Terms of Service
        </h1>
        <p className="text-[14px] text-[var(--text3)] font-medium mb-12">Last updated: May 2025</p>

        <div className="space-y-10 text-[15px] text-[var(--text2)] leading-[1.8] font-medium">
          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using MusicPulse, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the site. These terms apply to all visitors, users, and others who access or use the platform. We reserve the right to modify these terms at any time, and your continued use of the site after any changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">2. Use of Service</h2>
            <p>MusicPulse provides aggregated music chart data, trending information, and artist insights for personal, non-commercial use. You may browse, share links, and reference our data for personal purposes. You agree not to use the service for any illegal or unauthorized purpose, not to attempt to gain unauthorized access to any portion of the service, and not to use automated tools to scrape or extract data at scale without prior written permission from us.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">3. Data Accuracy</h2>
            <p>While we strive to provide accurate and up-to-date information, MusicPulse does not guarantee the accuracy, completeness, or reliability of any chart data or trending information displayed on the platform. All data is sourced from third-party public APIs and may be subject to delays, errors, or inconsistencies. Users should verify critical information independently before relying on it for any important decisions.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">4. Intellectual Property</h2>
            <p>The MusicPulse name, logo, website design, and original content are the intellectual property of MusicPulse. Chart data and artist information are sourced from publicly available third-party platforms and remain the property of their respective owners. MusicPulse is not affiliated with, endorsed by, or connected to Spotify, Apple Music, YouTube, TikTok, Billboard, or any other music platform referenced on this site.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">5. Limitation of Liability</h2>
            <p>MusicPulse is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the service's reliability, availability, or fitness for any particular purpose. In no event shall MusicPulse be liable for any direct, indirect, incidental, or consequential damages arising from your use of the service. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">6. Newsletter Subscriptions</h2>
            <p>By subscribing to the MusicPulse Weekly Charts Digest, you consent to receive periodic emails containing chart summaries and music recommendations. You may unsubscribe at any time via the link provided in each email. We will not use your email for any purpose other than delivering the newsletter, and we will never share your email with third parties.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
