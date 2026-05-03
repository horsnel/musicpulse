import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'MusicPulse privacy policy — how we handle your data and protect your privacy.',
}

export default function PrivacyPage() {
  return (
    <div className="relative z-10">
      <div className="max-w-[800px] mx-auto px-4 sm:px-7 pt-12 sm:pt-20 pb-10 sm:pb-20">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.04em] leading-[1.05] mb-3">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-[var(--text3)] font-medium mb-12">Last updated: May 2025</p>

        <div className="space-y-10 text-[15px] text-[var(--text2)] leading-[1.8] font-medium">
          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">1. Information We Collect</h2>
            <p>MusicPulse collects minimal personal data. When you subscribe to our newsletter, we store your email address solely for the purpose of sending weekly chart digests. We do not collect browsing history, location data, or any other personally identifiable information beyond what you voluntarily provide. Our chart and trending data is sourced entirely from public APIs and does not require any user accounts or login credentials.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">2. How We Use Your Data</h2>
            <p>Your email address is used exclusively to deliver the MusicPulse Weekly Charts Digest. We never sell, rent, or share your personal information with third parties for marketing purposes. Aggregate, anonymized usage statistics may be collected to improve the site experience, but these cannot be traced back to individual users. We may use cookies to remember your preferences such as selected regions or chart platforms.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">3. Data Sources</h2>
            <p>All music chart data displayed on MusicPulse is sourced from publicly available APIs and RSS feeds, including Spotify Charts, Apple Music RSS, YouTube Data API, and TikTok Creative Center. We are not affiliated with any of these platforms. Data is fetched, normalized, and presented in an aggregated format. We make reasonable efforts to ensure accuracy but cannot guarantee the completeness or timeliness of third-party data.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">4. Cookies</h2>
            <p>We use essential cookies to ensure the site functions properly, such as remembering your region and platform preferences. We do not use tracking cookies or third-party advertising cookies. You may disable cookies in your browser settings at any time, though some features may not work as expected without them. No personal data is stored in our cookies.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em] mb-3">5. Your Rights</h2>
            <p>You may unsubscribe from the newsletter at any time by clicking the link in any email. You can request deletion of your email from our records by contacting us. We will promptly honor all such requests. If you have any questions about this privacy policy or how your data is handled, please reach out through the information provided on our About page.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
