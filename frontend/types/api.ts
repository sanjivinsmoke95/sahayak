/** Envelope returned by every FastAPI list endpoint. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  detail: string;
  code?: string;
}

export interface UploadedFile {
  id: string;
  documentId: string | null;
  name: string;
  mimeType: string;
  sizeBytes: number;
  /** Size before client-side compression, when it was compressed. */
  originalSizeBytes: number | null;
  storagePath: string;
  url: string | null;
  createdAt: string;
}

export interface UserSettings {
  language: 'en' | 'hi' | 'te';
  textSize: 'standard' | 'large' | 'xlarge';
  readAloud: boolean;
  autoShrink: boolean;
  displayName: string;
}
