/**
 * Custom error class that scrapers can throw to signal an intentional skip
 * (e.g. missing API key, missing config). The orchestrator records this as
 * `skipped: true` rather than `rejected`, so the UI can distinguish
 * "couldn't run" from "ran but failed".
 *
 * Lives in its own file to avoid circular imports between
 * scrapers/index.ts and individual scraper modules.
 */
export class ScraperSkippedError extends Error {
  constructor(public readonly reason: string) {
    super(reason)
    this.name = 'ScraperSkippedError'
  }
}
