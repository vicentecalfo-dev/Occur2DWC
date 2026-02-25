export type ConvertProfileName = 'minimal-occurrence' | 'occurrence' | 'cncflora-occurrence';

export type InputDelimiterOption = 'auto' | 'comma' | 'tab' | 'semicolon';

export type OutputDelimiterOption = 'tab' | 'comma';

export type ConvertEncoding = 'utf8' | 'latin1';

export type IdStrategy = 'preserve' | 'uuid' | 'hash';

export type ExtrasMode = 'keep' | 'drop' | 'dynamicProperties';

export interface ConvertValidationError {
  row: number;
  code:
    | 'required_field_missing'
    | 'invalid_decimal_latitude'
    | 'invalid_decimal_longitude'
    | 'column_mismatch';
  message: string;
  field?: string;
}

export interface ConvertReport {
  summary: {
    inputRows: number;
    outputRows: number;
    invalidRows: number;
    errorCount: number;
    profile: ConvertProfileName;
    strict: boolean;
    idStrategy: IdStrategy;
    extrasMode: ExtrasMode;
    inputDelimiter: '\t' | ',' | ';';
    outputDelimiter: '\t' | ',';
  };
  errors: ConvertValidationError[];
}
