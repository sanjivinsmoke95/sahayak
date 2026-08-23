export interface SchemeSummary {
  id: string;
  name: string;
  category: string;
  level: string;
  benefit: string;
  source: string;
  status: string;
}

export interface SchemeSearchResult {
  total: number;
  results: SchemeSummary[];
}

export interface Scheme {
  id: string;
  name: string;
  summary: string;
  benefit: string;
  category: string;
  categories: string[];
  level: string;
  requiredDocuments: string[];
  requirementTags: string[];
  tags: string[];
  officialUrl: string | null;
  source: string;
  sourceType: string;
  status: string;
}

export interface SchemeMatch {
  id: string;
  name: string;
  category: string;
  level: string;
  benefit: string;
  satisfied: number;
  total: number;
  matchedTags: string[];
  missingTags: string[];
  officialUrl: string | null;
  source: string;
  status: string;
}

export interface SchemeMatchResult {
  results: SchemeMatch[];
}
