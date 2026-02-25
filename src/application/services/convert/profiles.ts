import type { ConvertProfileName } from './types';

export interface ConvertProfileDefinition {
  name: ConvertProfileName;
  outputColumns: readonly string[];
  requiredColumns: readonly string[];
}

const minimalOccurrenceProfile: ConvertProfileDefinition = {
  name: 'minimal-occurrence',
  outputColumns: ['occurrenceID', 'scientificName', 'decimalLatitude', 'decimalLongitude'],
  requiredColumns: ['occurrenceID', 'scientificName', 'decimalLatitude', 'decimalLongitude'],
};

const occurrenceProfile: ConvertProfileDefinition = {
  name: 'occurrence',
  outputColumns: [
    'occurrenceID',
    'scientificName',
    'scientificNameWithoutAuthorship',
    'family',
    'genus',
    'country',
    'stateProvince',
    'municipality',
    'locality',
    'eventDate',
    'day',
    'month',
    'year',
    'collectionCode',
    'catalogNumber',
    'recordedBy',
    'recordNumber',
    'decimalLatitude',
    'decimalLongitude',
    'identifiedBy',
    'dateIdentified',
    'occurrenceRemarks',
  ],
  requiredColumns: ['occurrenceID', 'scientificName', 'decimalLatitude', 'decimalLongitude'],
};

const cncfloraOccurrenceProfile: ConvertProfileDefinition = {
  name: 'cncflora-occurrence',
  outputColumns: [
    ...occurrenceProfile.outputColumns,
    'basisOfRecord',
    'institutionCode',
    'ownerInstitutionCode',
  ],
  requiredColumns: occurrenceProfile.requiredColumns,
};

export const PROFILE_REGISTRY: Record<ConvertProfileName, ConvertProfileDefinition> = {
  'minimal-occurrence': minimalOccurrenceProfile,
  occurrence: occurrenceProfile,
  'cncflora-occurrence': cncfloraOccurrenceProfile,
};

export function getConvertProfile(profileName: ConvertProfileName): ConvertProfileDefinition {
  return PROFILE_REGISTRY[profileName];
}

export function getKnownDwcTerms(): string[] {
  const terms = new Set<string>();

  for (const profile of Object.values(PROFILE_REGISTRY)) {
    for (const column of profile.outputColumns) {
      terms.add(column);
    }
  }

  terms.add('dynamicProperties');

  return [...terms];
}
