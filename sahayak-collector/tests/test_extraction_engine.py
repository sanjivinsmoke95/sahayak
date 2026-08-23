"""
Extraction engine tests across varied Indian government page layouts.

Covers: heading+table (eDistrict/Vikaspedia style), accordion+card+dl+JSON-LD
(myScheme style), microdata, malformed HTML, boilerplate stripping, edge cases
(missing sections, duplicates, tables-as-text), quality scoring and the rich
output contract. No network — deterministic sample HTML only.
"""
from extractor.service_extractor import ServiceExtractor


def _rich(html, url="https://x.gov.in/s", **kw):
    return ServiceExtractor(**kw).extract_rich(html, url)


# --------------------------------------------------------------------------
# Layout 1: heading + list + 2-col table (eDistrict / Vikaspedia style)
# --------------------------------------------------------------------------
EDISTRICT = """
<html><head><title>Income Certificate</title></head><body>
<nav class="navbar">Home About Contact</nav>
<main>
<h1>Income Certificate</h1>
<p>An Income Certificate certifies the annual income of a family.</p>
<h2>Eligibility</h2><ul><li>Permanent resident of the state</li><li>Applicant must be 18 to 60 years</li></ul>
<h2>Documents Required</h2><ul><li>Aadhaar Card</li><li>Ration Card</li><li>Income proof</li></ul>
<h2>How to Apply</h2><ol><li>Step 1: Register on the portal</li><li>Step 2: Submit the form</li></ol>
<table><tr><th>Fee</th><td>Rs. 15</td></tr><tr><th>Processing Time</th><td>7 working days</td></tr>
<tr><th>Validity</th><td>6 months</td></tr><tr><th>District</th><td>Chennai</td></tr></table>
<h2>Contact</h2><p>Helpline 1800-180-1551, email edistrict@tn.gov.in</p>
<a href="/forms/income-application-form.pdf">Application Form</a>
</main><footer>© 2025 All rights reserved. We use cookies.</footer></body></html>
"""


def test_edistrict_full_extraction():
    r = _rich(EDISTRICT, default_state="Tamil Nadu")
    assert r.service_name == "Income Certificate"
    assert r.fees == "Rs. 15" and r.fees_normalized == "₹15"
    assert r.processing_time == "7 working days"
    assert r.validity == "6 months"
    assert r.district == "Chennai"
    assert "Aadhaar Card" in r.required_documents
    assert r.application_steps == ["Register on the portal", "Submit the form"]
    assert r.age_requirements == "18 to 60 years"
    assert r.forms and r.forms[0].url.endswith("income-application-form.pdf")
    assert any("18001801551" in "".join(ch for ch in ph if ch.isdigit()) for ph in r.contact.phone)
    assert "edistrict@tn.gov.in" in r.contact.email
    assert r.quality_score > 0.6


def test_boilerplate_removed():
    r = _rich(EDISTRICT, default_state="Tamil Nadu")
    joined = (r.long_description or "") + " ".join(r.eligibility + r.required_documents)
    assert "cookies" not in joined.lower()
    assert "all rights reserved" not in joined.lower()


# --------------------------------------------------------------------------
# Layout 2: accordion + card + <details> + <dl> + JSON-LD (myScheme style)
# --------------------------------------------------------------------------
MYSCHEME = """
<html><head>
<script type="application/ld+json">
{"@type":"GovernmentService","name":"PM Kisan Samman Nidhi","description":"Income support of Rs 6000 per year to eligible farmer families."}
</script>
<script type="application/ld+json">
{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Who is eligible?","acceptedAnswer":{"@type":"Answer","text":"All landholding farmer families."}}]}
</script>
<meta name="description" content="PM Kisan scheme details and how to apply.">
</head><body>
<div class="accordion-item"><button class="accordion-button">Eligibility</button>
<div class="accordion-body"><ul><li>Small and marginal farmer families</li><li>Landholding up to 2 hectares</li></ul></div></div>
<div class="card"><div class="card-header">Documents Required</div>
<div class="card-body"><ul><li>Aadhaar</li><li>Bank account details</li><li>Land records</li></ul></div></div>
<div class="accordion-item"><div class="accordion-header">Application Process</div>
<div class="accordion-body"><ol><li>Visit PM Kisan portal</li><li>Register as new farmer</li></ol></div></div>
<details><summary>Benefits</summary><p>Rs 6000 per year in three equal installments.</p></details>
<dl><dt>Fees</dt><dd>No fee</dd><dt>Processing Time</dt><dd>30 days</dd></dl>
</body></html>
"""


def test_myscheme_accordion_jsonld():
    r = _rich(MYSCHEME, url="https://myscheme.gov.in/schemes/pm-kisan")
    assert r.service_name == "PM Kisan Samman Nidhi"
    assert "Income support" in (r.long_description or "")
    assert "Small and marginal farmer families" in r.eligibility
    assert "Land records" in r.required_documents
    assert r.application_steps == ["Visit PM Kisan portal", "Register as new farmer"]
    assert r.benefits and "6000" in r.benefits[0]
    assert r.fees == "No fee" and r.fees_normalized == "Free"
    assert r.processing_time == "30 days"
    # FAQ taken from schema.org FAQPage
    assert r.faq and r.faq[0].question == "Who is eligible?"


# --------------------------------------------------------------------------
# Edge cases & robustness
# --------------------------------------------------------------------------
def test_missing_sections_are_null_not_invented():
    html = "<html><body><main><h1>Caste Certificate</h1></main></body></html>"
    r = _rich(html)
    assert r.service_name == "Caste Certificate"
    assert r.eligibility == [] and r.required_documents == []
    assert r.fees is None and r.processing_time is None
    assert r.quality_score < 0.5   # sparse page -> low quality


def test_non_service_page_returns_none():
    assert _rich("<html><body><p>hello</p></body></html>") is None


def test_malformed_html_does_not_crash():
    bad = "<html><body><h1>Ration Card<h2>Documents<ul><li>Aadhaar<li>Photo</ul><table><tr><td>Fee<td>Rs 20"
    r = _rich(bad)
    assert r is not None and r.service_name.startswith("Ration Card")
    assert "Aadhaar" in " ".join(r.required_documents)


def test_duplicate_documents_deduped():
    html = """<html><body><main><h1>Birth Certificate</h1>
    <h2>Documents Required</h2><ul><li>Aadhaar</li><li>Aadhaar</li><li>Hospital record</li></ul>
    </main></body></html>"""
    r = _rich(html)
    assert r.required_documents == ["Aadhaar", "Hospital record"]


def test_tables_as_text_label_value():
    # "Label: value" paragraphs should feed key/value extraction.
    html = """<html><body><main><h1>Driving Licence</h1>
    <p>Fee: Rs. 200</p><p>Processing Time: 30 days</p><p>Validity: 20 years</p>
    </main></body></html>"""
    r = _rich(html)
    assert r.fees == "Rs. 200"
    assert r.processing_time == "30 days"
    assert r.validity == "20 years"


def test_microdata_and_breadcrumbs_department():
    html = """<html><body>
    <nav aria-label="breadcrumb"><a>Home</a><a>Ministry of Finance</a><a>Income Tax</a></nav>
    <main><h1>PAN Card Application</h1>
    <h2>Documents Required</h2><ul><li>Aadhaar</li><li>Photo</li></ul></main></body></html>"""
    r = _rich(html, url="https://incometax.gov.in/pan")
    assert r.service_name == "PAN Card Application"
    # department inferred from breadcrumb trail (second-last crumb)
    assert r.department == "Ministry of Finance"


def test_rich_output_shape_has_quality_score():
    r = _rich(EDISTRICT, default_state="Tamil Nadu")
    data = r.model_dump()
    for key in ("service_name", "eligibility", "required_documents", "application_steps",
                "fees", "processing_time", "benefits", "faq", "forms", "contact", "quality_score"):
        assert key in data
    assert 0.0 <= data["quality_score"] <= 1.0
    assert "completeness" in r.quality_metrics


def test_service_record_backward_compatible():
    rec = ServiceExtractor(default_state="Tamil Nadu").extract(EDISTRICT, "https://x.gov.in/s")
    assert rec.service_name == "Income Certificate"
    assert rec.fees == "Rs. 15"                       # verbatim, unchanged
    assert rec.content_hash and len(rec.content_hash) == 64
    assert "Aadhaar Card" in rec.required_documents
