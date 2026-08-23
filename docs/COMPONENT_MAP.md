# Component map

Every file, and what belongs in it. Generated from the tree, so it matches.

## Frontend

Barrel files (`index.ts`) only re-export and are omitted.

| File | Purpose |
|---|---|
| `app/(app)/actions/page.tsx` | Everything still to do, across documents. |
| `app/(app)/analyzing/page.tsx` | The waiting screen with named stages. |
| `app/(app)/assistant/page.tsx` | Ask a question by typing or speaking. |
| `app/(app)/deadlines/page.tsx` | Dates, nearest first. |
| `app/(app)/documents/[id]/page.tsx` | One document, explained. |
| `app/(app)/documents/page.tsx` | Saved documents, filterable by category. |
| `app/(app)/layout.tsx` | Wraps every screen in AppShell. |
| `app/(app)/page.tsx` | Home. |
| `app/(app)/settings/page.tsx` | Language, text size, voice, auto-shrink, install, delete all. |
| `app/(app)/shrink/page.tsx` | File compression. |
| `app/(app)/upload/page.tsx` | Pick or photograph a document. |
| `app/globals.css` | Phone shell CSS: the frame, the single scroll region, focus rings. |
| `app/layout.tsx` | Root layout. Metadata, PWA manifest link, no webfont. |
| `app/providers.tsx` | Clerk (only when keyed), TanStack Query, toasts. |
| `components/actions/ActionGroup.tsx` | One document outstanding steps. |
| `components/assistant/MessageBubble.tsx` | A turn, with bullets, document cards and read-aloud. |
| `components/assistant/PromptBox.tsx` | Type or speak. |
| `components/assistant/SuggestedQuestions.tsx` | Prompts for someone unsure what to ask. |
| `components/common/DeadlineChip.tsx` | An ISO date as a colour-coded human phrase. |
| `components/common/EmptyState.tsx` | Empty list with a way out. |
| `components/common/Icon.tsx` | The prototype icon set, one component. |
| `components/common/SectionCard.tsx` | One block of the explanation. |
| `components/common/Segmented.tsx` | Segmented control. |
| `components/common/icon-paths.ts` | Icon path data. |
| `components/deadlines/DeadlineRow.tsx` | One dated document. |
| `components/document/DocumentHeader.tsx` | Title, issuer, reference number, deadline. |
| `components/document/EligibilityChecker.tsx` | Hedged comparison against printed conditions. |
| `components/document/ExplanationSections.tsx` | What, why, when, where, what if not. |
| `components/document/JargonPairs.tsx` | Officialese beside what it means. |
| `components/document/OriginalWording.tsx` | The notice verbatim. |
| `components/document/StepChecklist.tsx` | Steps or papers, ticked optimistically. |
| `components/documents/CategoryFilter.tsx` | Category chips. |
| `components/documents/DocumentCard.tsx` | A document in the list. |
| `components/home/AppFooter.tsx` | Disclaimer. |
| `components/home/FeatureList.tsx` | What the app can do. |
| `components/home/HeroActions.tsx` | Greeting and the two things people came to do. |
| `components/home/LanguageLadder.tsx` | One sentence three times, ending in the reader own language. |
| `components/home/PrivacyNote.tsx` | Where the files go, which is nowhere. |
| `components/layout/AppBar.tsx` | Title, back arrow, language button, settings. |
| `components/layout/AppShell.tsx` | Fixed viewport, one scroll region, header and tabs that never move. |
| `components/layout/LanguageSheet.tsx` | Bottom sheet for choosing a language. |
| `components/layout/Logo.tsx` | The mark. |
| `components/layout/OfflineBanner.tsx` | Shown when the connection drops. |
| `components/layout/PhoneFrame.tsx` | Edge-to-edge on a phone, phone-shaped frame on a desktop. |
| `components/layout/ScreenTransition.tsx` | Slide direction driven by the UI store. |
| `components/layout/Splash.tsx` | Launch screen. |
| `components/layout/StatusBar.tsx` | Cosmetic status bar, desktop frame only. |
| `components/layout/TabBar.tsx` | The five tabs. |
| `components/settings/InstallCard.tsx` | Add to home screen, with the iOS instruction. |
| `components/settings/OptionGrid.tsx` | Generic choice grid, typed to its option values. |
| `components/settings/SettingsSection.tsx` | A titled block of settings. |
| `components/shrink/FilePickerTiles.tsx` | Camera and multi-file pickers. |
| `components/shrink/SavingsSummary.tsx` | Total saved, and what that means on a slow link. |
| `components/shrink/ShrinkQueue.tsx` | The queue. |
| `components/shrink/ShrinkResultRow.tsx` | Before/after, hold to compare, save or share. |
| `components/shrink/SizeTargetPicker.tsx` | The portal limit, not a quality slider. |
| `components/ui/badge.tsx` | Status and urgency pills. |
| `components/ui/button.tsx` | shadcn button, sized for nervous thumbs (52px+). |
| `components/ui/card.tsx` | Card primitives. |
| `components/ui/input.tsx` | Text input (16px, so iOS does not zoom). |
| `components/ui/progress.tsx` | Checklist progress bar. |
| `components/ui/select.tsx` | Native select, styled. |
| `components/ui/sheet.tsx` | Radix dialog as a bottom sheet, animated with Framer Motion. |
| `components/ui/skeleton.tsx` | Loading placeholder. |
| `components/ui/textarea.tsx` | Multiline input. |
| `components/upload/SampleDocumentList.tsx` | Demo notices. |
| `components/upload/UploadTiles.tsx` | Camera, PDF and image pickers. |
| `hooks/useAssistant.ts` | Ask, and check eligibility. |
| `hooks/useAuthToken.ts` | Clerk token, or nulls when Clerk is off. |
| `hooks/useCompressor.ts` | The shrink queue: object URLs, sequencing, re-runs. |
| `hooks/useDocumentUpload.ts` | Auto-shrink then upload, used by every picker. |
| `hooks/useDocuments.ts` | Document queries and the optimistic checklist toggle. |
| `hooks/useInstallPrompt.ts` | Add to home screen. |
| `hooks/useOnlineStatus.ts` | Online/offline. |
| `hooks/useSettings.ts` | Sync server settings with the local store. |
| `hooks/useSpeech.ts` | Text to speech. |
| `hooks/useTranslation.ts` | The only way components read copy. |
| `lib/api-client.ts` | One place that knows how to talk to FastAPI. |
| `lib/constants.ts` | Size targets, quality floor, query keys. |
| `lib/data/eligibility-options.ts` | States, income bands, kinds of work. |
| `lib/data/sample-documents.ts` | The five demo notices. |
| `lib/i18n/assistant-strings.ts` | Assistant phrases and suggested questions. |
| `lib/i18n/categories.ts` | Category names. |
| `lib/i18n/languages.ts` | Languages and text sizes. |
| `lib/i18n/strings.ts` | Every interface string, in three languages. |
| `lib/utils.ts` | cn(). |
| `middleware.ts` | Clerk middleware, a pass-through until keys exist. |
| `services/ai-models.service.ts` | Model catalogue. |
| `services/assistant.service.ts` | Assistant endpoints. |
| `services/documents.service.ts` | Document endpoints. |
| `services/files.service.ts` | Upload endpoints. |
| `services/settings.service.ts` | Settings endpoints. |
| `store/useChatStore.ts` | The chat thread for this session. |
| `store/useSettingsStore.ts` | Preferences, persisted. |
| `store/useUiStore.ts` | Transition direction, sheets, offline. |
| `store/useWorkspaceStore.ts` | Open document and chosen model. |
| `tailwind.config.ts` | The palette and type scale, carried over unchanged. |
| `types/api.ts` | Wire types. |
| `types/assistant.ts` | Answers, messages, eligibility. |
| `types/compression.ts` | Shrink results. |
| `types/document.ts` | SahayakDocument and friends. |
| `types/i18n.ts` | Localized, L(), pick(). |
| `utils/compression/gzip.ts` | CompressionStream for non-images. |
| `utils/compression/image.ts` | Resolution ladder and quality search. |
| `utils/compression/index.ts` | shrinkFile(), the single entry point. |
| `utils/format.ts` | Bytes, dates, urgency, haptics. |

## Backend

`__init__.py` files only re-export and are omitted.

| File | Purpose |
|---|---|
| `app/api/deps.py` | Shared dependencies, re-exported. |
| `app/auth/clerk.py` | JWKS verification, cached; mirrors the user into our table. |
| `app/config.py` | Settings from the environment, with auth/storage feature flags. |
| `app/database/base.py` | Declarative base, uuid and timestamp mixins. |
| `app/database/session.py` | Async engine and the get_db dependency. |
| `app/main.py` | App, routers, CORS, model-catalogue sync at startup. |
| `app/models/ai_model.py` | Selectable model, reconciled with configured keys. |
| `app/models/chat.py` | Chat. |
| `app/models/document.py` | Document. Trilingual fields as JSONB, checklist inline. |
| `app/models/file.py` | File, with the pre-compression size. |
| `app/models/message.py` | Message. |
| `app/models/project.py` | Project: a folder of related paperwork. |
| `app/models/session.py` | Signed-in devices. |
| `app/models/setting.py` | Per-user preferences. |
| `app/models/user.py` | User. |
| `app/routers/ai_models.py` | The catalogue. |
| `app/routers/assistant.py` | Ask and eligibility, with provider fallback. |
| `app/routers/chats.py` | Chats and messages. |
| `app/routers/documents.py` | List, get, analyze, delete, checklists, reminders. |
| `app/routers/files.py` | Upload, list, delete. |
| `app/routers/health.py` | Liveness plus which integrations are wired. |
| `app/routers/projects.py` | Projects. |
| `app/routers/settings.py` | Get and patch preferences. |
| `app/routers/users.py` | /users/me. |
| `app/schemas/ai_model.py` | Model catalogue. |
| `app/schemas/assistant.py` | Ask and eligibility. bullets is `list` on the wire. |
| `app/schemas/chat.py` | Chats and messages. |
| `app/schemas/common.py` | Localized, ORM base, pagination. |
| `app/schemas/document.py` | Document wire contract; camelCase on purpose. |
| `app/schemas/file.py` | Uploads. |
| `app/schemas/project.py` | Projects. |
| `app/schemas/setting.py` | Preferences. |
| `app/schemas/user.py` | User. |
| `app/services/ai/anthropic_provider.py` | Claude. |
| `app/services/ai/base.py` | The provider interface. |
| `app/services/ai/factory.py` | Choose a provider, fall back to rule-based. |
| `app/services/ai/gemini_provider.py` | Gemini. |
| `app/services/ai/openai_provider.py` | OpenAI. |
| `app/services/ai/openrouter_provider.py` | OpenRouter. |
| `app/services/ai/prompts.py` | Prompts, written to be reviewed as writing. |
| `app/services/ai/rule_based.py` | The offline engine. No key, no network, no hallucination. |
| `app/services/document_service.py` | Row to API mapping, seeding, checklists. |
| `app/services/eligibility.py` | The hedged verdict logic. |
| `app/services/storage/supabase.py` | Storage over REST, private buckets, signed URLs. |
| `app/utils/logging.py` | Logging setup. |
| `tests/test_eligibility.py` | Verdicts, including that unknowns stay hedged. |
| `tests/test_rule_based.py` | Intent detection and grounded answers. |

## Where new code goes

| If you are adding... | Put it in |
|---|---|
| A screen | `frontend/app/(app)/<route>/page.tsx`, thin, composing feature components |
| A piece of a screen | `frontend/components/<feature>/` |
| Something reused across features | `frontend/components/common/` |
| A styled primitive | `frontend/components/ui/` |
| Anything calling the API | a hook in `frontend/hooks/`, over a `services/` function |
| A user-facing string | `frontend/lib/i18n/strings.ts`, all three languages |
| An endpoint | a router in `backend/app/routers/`, logic in `backend/app/services/` |
| A table | `backend/app/models/`, then `alembic revision --autogenerate` |
| An AI provider | implement `AIProvider`, register it in `factory.py` |

## Two rules that keep this tidy

**Screens compose, they do not implement.** A `page.tsx` should read as a list
of components. If it grows logic, that logic wants to be a hook.

**No bare strings in components.** Every word the user sees comes from
`useTranslation`. A string typed straight into JSX is invisible to the
language switcher, which means it is invisible to two thirds of the audience.
