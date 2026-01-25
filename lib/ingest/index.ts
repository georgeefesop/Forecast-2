/**
 * Main ingestion entry point
 * Exports the orchestrator and source adapters
 */

export { runIngestion } from './orchestrator';
export type { SourceAdapter, CanonicalEvent, RawEventStub, RawEventDetail } from './types';

// Import source adapters for use in getActiveAdapters
import { AllAboutLimassolAdapter } from './sources/all-about-limassol';
import { LimassolMarinaAdapter } from './sources/limassol-marina';
import { LimassolTourismAdapter } from './sources/limassol-tourism';
import { LimassolMunicipalityAdapter } from './sources/limassol-municipality';
import { MoreAdapter } from './sources/more';

// Export source adapters
export { AllAboutLimassolAdapter } from './sources/all-about-limassol';
export { LimassolMarinaAdapter } from './sources/limassol-marina';
export { LimassolTourismAdapter } from './sources/limassol-tourism';
export { LimassolMunicipalityAdapter } from './sources/limassol-municipality';
export { MoreAdapter } from './sources/more';

// Import adapters
import { SoldOutTicketBoxAdapter } from './sources/soldout-ticketbox';
import { RialtoInterticketAdapter } from './sources/rialto-interticket';

/**
 * Get all active source adapters
 */
export function getActiveAdapters() {
  return [
    new LimassolMunicipalityAdapter(), // Testing municipality first
    new AllAboutLimassolAdapter(),
    new LimassolMarinaAdapter(),
    new LimassolTourismAdapter(),
    new SoldOutTicketBoxAdapter(),
    new RialtoInterticketAdapter(),
    new MoreAdapter(),
  ];
}

/**
 * Helper to run ingestion with all active adapters
 */
import { runIngestion } from './orchestrator';
export async function ingestEvents() {
  const adapters = getActiveAdapters();
  return runIngestion(adapters);
}
