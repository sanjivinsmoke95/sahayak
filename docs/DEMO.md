# Sahayak — Demo guide

A compelling end-to-end walkthrough of the government-process companion. All
example data below is **fictional** — do not use real Aadhaar/PAN numbers.

The five bundled sample notices (pension, scheme, income, scholarship,
property) load automatically into every fresh account, so the reading and
explanation flow works immediately with no setup.

To demonstrate the **document-intelligence** features (validity, consistency,
readiness, rejection, forms), upload a few documents. Create them as PDFs or
photos containing the fictional text below, then upload through the app.

## Golden path

1. **Upload an Income Certificate.** Sahayak identifies the type, issuer,
   issue date, and personal fields (name/DOB masked where sensitive).

2. Open the document → **"Find services you can use"** (Discover). It surfaces
   the services the certificate supports, ranked by how many papers you have.

3. Open a service → **"Check my readiness"**. It shows, per requirement,
   Satisfied / Missing / Expired / Please-confirm — grounded in your documents.

4. **"Go to my action plan"** → upload the missing documents directly into each
   slot; the checkmark flips only on a real match.

5. **"Start this application"** → a persisted timeline (Preparing → Submitted →
   …). Update the status; see "What happens next" (no invented timing).

6. Upload a second ID with a slightly different name → the document detail shows
   a **possible name mismatch** ("verify the specific requirement").

7. Upload a **rejection notice** → Sahayak quotes the stated reason, suggests
   next steps, and surfaces the appeal contact.

8. Upload an **application form** → the Form Assistant suggests values from your
   documents (with sources); download a draft. Nothing is auto-submitted.

9. Add a **family profile** (Profiles) and assign a document to them — documents
   stay separated per person.

## Fictional scenario documents

**Scenario A — Income Certificate (ready to apply / near expiry)**
```
GOVERNMENT OF INDIA — DEPARTMENT OF REVENUE
INCOME CERTIFICATE
Certificate No.: DEMO/2026/00001
Date of issue: 12 Aug 2026    Valid until: 11 Sep 2026
Name: RAHUL DEMO
Father's Name: SATENDRA DEMO
Date of Birth: 30/01/1997
Annual income from all sources: = 2,40,000/- (Rupees Two Lakh Forty Thousand)
Issued by the Tahsildar. Valid for official purposes only.
```
Shows validity **Expiring soon** and readiness for income-linked services.

**Scenario B — Name mismatch (upload with A)**
```
INCOME TAX DEPARTMENT — GOVT OF INDIA
Permanent Account Number Card
Name: RAHUL K DEMO
Father's Name: SATENDRA DEMO
Date of Birth: 30/01/1997
DEMOP1234K
```
Uploaded alongside A, triggers a **possible name mismatch** (RAHUL DEMO vs
RAHUL K DEMO).

**Scenario C — Rejection notice**
```
SCHOLARSHIP DEPARTMENT
APPLICATION REJECTED
Your application has been rejected.
Reason: the submitted Income Certificate has expired and does not satisfy the
validity requirement.
For queries or appeal, contact 9000000000 or appeals@example.gov.in
Verify at https://verify.example.gov.in
```
The Rejection Explainer quotes the reason and appeal route.

**Scenario D — Application form**
```
SCHOLARSHIP APPLICATION FORM — Please fill the following.
Name: ______   Father's Name: ______   Date of Birth: ______
Annual Income: ______   Aadhaar Number: ______   Mobile: ______
Signature of applicant: ______
```
The Form Assistant fills values from A/B and lets you download a draft.

## Notes

- Nothing here is an official decision. Sahayak surfaces *signals* and
  *suggestions*, quotes documents rather than inventing facts, and always tells
  the reader to confirm with the office.
- The Mee Seva map needs a Google Maps browser key with `http://localhost:3000/*`
  allowlisted (see the root `.env.example`).
