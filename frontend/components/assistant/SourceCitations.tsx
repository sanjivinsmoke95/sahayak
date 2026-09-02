'use client';

import type { AssistantCitation } from '@/types';

/** Compact provenance links for facts retrieved from official government data. */
export function SourceCitations({ citations }: { citations?: AssistantCitation[] }) {
  const official = (citations ?? []).filter((citation) => citation.source_type === 'official_service');
  if (!official.length) return null;

  return (
    <section className="mt-3 border-t border-navy-100 pt-2 text-sm" aria-label="Official sources">
      <p className="font-semibold text-navy-700">Official sources</p>
      <ul className="mt-1 space-y-1">
        {official.map((citation, index) => {
          const url = citation.official_application_url || citation.source_url;
          return (
            <li key={`${citation.service_name}-${index}`}>
              {url ? (
                <a className="font-medium text-navy-600 underline" href={url} target="_blank" rel="noreferrer">
                  {citation.service_name}
                </a>
              ) : (
                <span className="text-muted">{citation.service_name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
