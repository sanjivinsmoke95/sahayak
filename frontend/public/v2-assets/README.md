# Sahayak UI Asset Pack

Source: the Sahayak mobile UI reference supplied by the user.

Use these as editable vector assets in the app:
- logo-mark.svg — primary Sahayak hands/person mark
- logo-full.svg — mark + Sahayak wordmark + tagline
- logo-mark-white.svg — dark-background variant
- india-ribbon.svg — orange/white/green decorative ribbon
- illustration-upload.svg — upload document illustration
- illustration-processing.svg — document processing illustration
- illustration-certificate.svg — certificate/document illustration
- illustration-success.svg — success/completion illustration
- illustration-voice.svg — voice assistant illustration
- avatar-default.svg — neutral profile avatar
- icon-*.svg — core UI icons
- design-tokens.json — color, typography, radius and spacing tokens

Implementation notes:
1. Prefer SVGs directly in the UI; do not rasterize them unless required.
2. Keep the logo mark separate from the wordmark so it can be used in navigation bars and app icons.
3. Use the navy as the primary action color, green for successful/verified states, and orange only for warnings, deadlines, highlights and the Indian visual accent.
4. Do not use gradients unless specifically required by a screen. The reference is primarily flat, high-contrast UI.
5. Use Inter (or the closest platform equivalent) consistently.
6. Preserve generous whitespace and rounded cards. Avoid excessive shadows.
