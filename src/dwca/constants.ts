import { getKnownDwcTerms } from '../application/services/convert/profiles';
import { normalizeColumnName } from '../application/services/convert/text';

const DWC_URI_PREFIX = 'http://rs.tdwg.org/dwc/terms/';

const knownTerms = getKnownDwcTerms();

const knownTermByNormalizedName = new Map<string, string>();

for (const term of knownTerms) {
  knownTermByNormalizedName.set(normalizeColumnName(term), term);
}

export function resolveDwCTerm(columnName: string): string | undefined {
  return knownTermByNormalizedName.get(normalizeColumnName(columnName));
}

export function toDwCTermUri(term: string): string {
  return `${DWC_URI_PREFIX}${term}`;
}

export const DWC_DYNAMIC_PROPERTIES_TERM = 'dynamicProperties';
