export interface RejectionAppeal {
  phones: string[];
  emails: string[];
  urls: string[];
}

export interface RejectionAnalysis {
  isRejection: boolean;
  reasonStated: boolean;
  reason: string | null;
  relatedDocuments: string[];
  suggestedActions: string[];
  appeal: RejectionAppeal;
  confidence: number;
}

export interface VerificationSignal {
  type: string;
  detected: boolean;
  value: string | null;
}

export interface VerificationResult {
  signals: VerificationSignal[];
}

export interface FormFieldSuggestion {
  key: string;
  sensitive: boolean;
  suggestedValue: string | null;
  source: string | null;
  confidence: number;
}

export interface FormAnalysis {
  isForm: boolean;
  fields: FormFieldSuggestion[];
}
