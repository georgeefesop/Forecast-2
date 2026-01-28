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
import { RavePulseAdapter } from './sources/rave-pulse';
import { CyprusUndergroundAdapter } from './sources/cyprus-underground';
import { NicosiaForArtAdapter } from './sources/nicosia-for-art';
import { LarnakaAdapter } from './sources/larnaka';
import { VisitPafosAdapter } from './sources/visit-pafos';
import { VisitFamagustaAdapter } from './sources/visit-famagusta';

// Export source adapters
export { AllAboutLimassolAdapter } from './sources/all-about-limassol';
export { LimassolMarinaAdapter } from './sources/limassol-marina';
export { LimassolTourismAdapter } from './sources/limassol-tourism';
export { LimassolMunicipalityAdapter } from './sources/limassol-municipality';
export { MoreAdapter } from './sources/more';
export { RavePulseAdapter } from './sources/rave-pulse';
export { CyprusUndergroundAdapter } from './sources/cyprus-underground';
export { NicosiaForArtAdapter } from './sources/nicosia-for-art';
export { LarnakaAdapter } from './sources/larnaka';

// Import adapters
import { SoldOutTicketBoxAdapter } from './sources/soldout-ticketbox';
import { RialtoInterticketAdapter } from './sources/rialto-interticket';

/**
 * Get all active source adapters
 */
import { ScrapeFrequency, SourceAdapter } from './types';

/**
 * Get all active source adapters
 */
export function getActiveAdapters(frequency?: ScrapeFrequency): SourceAdapter[] {
  const adapters: SourceAdapter[] = [
    new LimassolMunicipalityAdapter(), // Testing municipality first
    new AllAboutLimassolAdapter(),
    new LimassolMarinaAdapter(),
    new LimassolTourismAdapter(),
    new SoldOutTicketBoxAdapter(),
    new RialtoInterticketAdapter(),
    new MoreAdapter(),
    new RavePulseAdapter(),
    new CyprusUndergroundAdapter(),
    new NicosiaForArtAdapter(), // Only surviving new source
    new LarnakaAdapter(),
    new VisitPafosAdapter(),
    new VisitFamagustaAdapter(),
  ];

  if (frequency) {
    return adapters.filter(a => a.frequency === frequency);
  }

  return adapters;
}

/**
 * Helper to run ingestion with all active adapters
 */
import { runIngestion } from './orchestrator';
export async function ingestEvents() {
  const adapters = getActiveAdapters();
  return runIngestion(adapters);
}
