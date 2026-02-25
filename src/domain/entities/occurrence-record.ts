export interface OccurrenceRecord {
  id: string;
  basisOfRecord?: string;
  scientificName?: string;
  eventDate?: string;
  rawData: Record<string, unknown>;
}
