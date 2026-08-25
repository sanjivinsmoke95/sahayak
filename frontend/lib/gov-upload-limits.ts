/**
 * File-size limits Indian government portals impose on uploaded documents.
 *
 * Sourced from public government-portal guidance (Aug 2026):
 * - Telangana MeeSeva: scanned certificates accepted as PDF/JPG; several
 *   services cap uploads at 3 MB.
 *   https://igrstelangana.co.in/meeseva-telangana-2026-login-registration-application-status-complete-ts-meeseva-telangana-gov-in/
 * - Government exam portals (SSC / IBPS / RRB / State PSC): passport photos
 *   ~20–50 KB JPG (some up to 200 KB).
 *   https://www.readytosubmit.in/blog/government-exam-photo-requirements-guide
 * - Indian e-Visa / general document uploads: supplementary PDFs under ~300 KB;
 *   most portals accept 100–500 KB document scans.
 *   https://travelwiseguide.com/how-to-prepare-documents-indian-evisa-2026/
 *   https://mb2kb.com/blog/image-size-requirements-indian-government-websites
 *
 * We compress image uploads to DOCUMENT_TARGET (500 KB): comfortably under
 * MeeSeva's 3 MB ceiling and within the range the common portals accept, while
 * keeping a scanned certificate legible.
 */
export const GOV_UPLOAD_LIMITS = {
  /** Passport-style photograph (strictest portals). */
  photoBytes: 50 * 1024,
  /** A scanned document image (JPG/PNG) accepted by most portals. */
  documentImageBytes: 500 * 1024,
  /** A document PDF; many portals cap here, MeeSeva allows more. */
  documentPdfBytes: 500 * 1024,
  /** Hard ceiling seen on MeeSeva for certain services. */
  meeSevaMaxBytes: 3 * 1024 * 1024,
} as const;

/** The default target every uploaded document image is compressed toward. */
export const GOV_DOCUMENT_TARGET_BYTES = GOV_UPLOAD_LIMITS.documentImageBytes;

export const GOV_TARGET_LABEL = '500 KB';
