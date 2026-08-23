"""Offline tests for smart link discovery, language detection and district."""
from crawler.sahayak_crawl.spiders.base_spider import BaseGovSpider
from extractor.field_extractors import detect_language
from extractor.service_extractor import ServiceExtractor


def test_follows_service_links():
    follow = BaseGovSpider._should_follow
    assert follow("https://x.gov.in/services/income-certificate")
    assert follow("https://x.gov.in/apply/pension")
    assert follow("https://x.gov.in/forms/application-form.pdf")  # form PDF allowed


def test_ignores_noise_links():
    follow = BaseGovSpider._should_follow
    assert not follow("https://x.gov.in/news/latest")
    assert not follow("https://x.gov.in/careers/vacancy")
    assert not follow("https://x.gov.in/tenders/2025")
    assert not follow("https://x.gov.in/media/photo.jpg")
    assert not follow("https://x.gov.in/notification/gazette.pdf")  # non-form PDF


def test_language_detection():
    assert detect_language("This is an English government service page") == "en"
    assert detect_language("यह आय प्रमाण पत्र सेवा की जानकारी है और विवरण हिंदी में है") == "hi"
    assert detect_language("ఇది ఆదాయ ధృవీకరణ పత్రం సేవ వివరాలు తెలుగు లో ఉన్నాయి") == "te"
    assert detect_language("", default="en") == "en"


def test_district_and_language_on_record():
    html = (
        "<html><body><main><h1>Caste Certificate</h1>"
        "<table><tr><th>District</th><td>Chennai</td></tr></table>"
        "</main></body></html>"
    )
    rec = ServiceExtractor(default_state="Tamil Nadu").extract(html, "https://tn.gov.in/caste")
    assert rec.district == "Chennai"
    assert rec.state == "Tamil Nadu"
    assert rec.language == "en"
