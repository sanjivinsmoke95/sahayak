"""
HTML structure parser — generic, site-agnostic understanding of a page.

Turns raw HTML into structured primitives the extractor reasons over:
  * metadata: <title>, meta description/keywords, Open Graph
  * JSON-LD (schema.org) and microdata (itemprop)
  * breadcrumbs (for department/category context)
  * a rich SECTION MAP whose labels come from headings, <details>/<summary>
    accordions, Bootstrap accordions/cards/panels, and definition lists — so the
    same code handles many layouts WITHOUT per-site selectors
  * tables, key/value pairs (tables + <dl> + "Label: value" lines)
  * bullet/ordered/nested lists
  * downloadable forms (PDF/DOC/XLS), embedded docs, and "apply" action links

Boilerplate (nav, header, footer, aside, cookie/ad/social/login/breadcrumb
containers) is removed before content extraction. Pure & deterministic.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from urllib.parse import urljoin

from bs4 import BeautifulSoup, Tag

from extractor.text_cleaning import collapse_ws

_HEADING_TAGS = ("h1", "h2", "h3", "h4", "h5", "h6")
_DOC_EXT = re.compile(r"\.(pdf|docx?|xlsx?|odt|rtf)(\?|#|$)", re.IGNORECASE)
_FORM_HINT = re.compile(r"(form|application|apply|register|proforma|annexure)", re.I)
_APPLY_HINT = re.compile(r"(apply|registration|register|online\s*service|e-?service|login|avail)", re.I)
_LABEL_VALUE = re.compile(r"^\s*([A-Z][A-Za-z /&()]{2,40})\s*[:\-–]\s+(.{2,})$")

# EXACT class/id tokens marking a container as boilerplate. Matched against
# individual class tokens (never substrings) so content widgets like
# "accordion-header" / "card-body" / "downloads" are never mistaken for noise.
_NOISE_TOKENS = frozenset({
    "navbar", "navigation", "mainmenu", "main-menu", "megamenu", "submenu",
    "topnav", "top-nav", "breadcrumb", "breadcrumbs", "cookie", "cookies",
    "cookie-banner", "cookie-consent", "gdpr", "consent", "advertisement",
    "advert", "ads", "adbox", "social", "social-share", "socialmedia", "share",
    "sharebar", "login", "signin", "sign-in", "sidebar", "skip-link",
    "backtotop", "back-to-top", "related-articles", "related-posts", "sitemap",
})


def _clean(text: str) -> str:
    return collapse_ws(text)


def _noise_parts(tag: Tag) -> set[str]:
    parts: set[str] = set()
    for cls in tag.get("class", []) or []:
        parts.add(cls.lower())
    ident = (tag.get("id", "") or "").lower()
    if ident:
        parts.add(ident)
        parts.update(re.split(r"[^a-z0-9]+", ident))
    return {p for p in parts if p}


def _has_noise_token(tag: Tag) -> bool:
    if (tag.get("role", "") or "").lower() in ("navigation", "search"):
        return True
    return bool(_noise_parts(tag) & _NOISE_TOKENS)


@dataclass
class Section:
    heading: str
    level: int
    text: str = ""
    list_items: list[str] = field(default_factory=list)


@dataclass
class ParsedPage:
    url: str
    title: str
    main_text: str
    sections: list[Section]
    tables: list[list[dict]]
    kv_pairs: dict[str, str]
    lists: list[list[str]]
    form_links: list[dict]
    raw_text: str
    internal_links: list[str] = field(default_factory=list)
    # ---- richer, additive fields (backward compatible) ----
    meta: dict = field(default_factory=dict)
    jsonld: list = field(default_factory=list)
    microdata: dict = field(default_factory=dict)
    breadcrumbs: list[str] = field(default_factory=list)
    apply_links: list[str] = field(default_factory=list)
    download_links: list[dict] = field(default_factory=list)
    embedded_docs: list[str] = field(default_factory=list)


class HtmlParser:
    """Parse a single HTML document into :class:`ParsedPage`."""

    def __init__(self, html: str, url: str):
        self.soup = BeautifulSoup(html or "", "lxml")
        self.url = url
        # Capture data that lives in <script>/nav BEFORE we strip them.
        self._jsonld = self._extract_jsonld()
        self._breadcrumbs = self._extract_breadcrumbs()
        self._meta = self._extract_meta()
        self._strip_noise()

    # ---- pre-strip captures --------------------------------------------
    def _extract_jsonld(self) -> list:
        blocks = []
        for tag in self.soup.find_all("script", attrs={"type": "application/ld+json"}):
            try:
                data = json.loads(tag.string or tag.get_text() or "")
            except (ValueError, TypeError):
                continue
            blocks.extend(data if isinstance(data, list) else [data])
        return blocks

    def _extract_breadcrumbs(self) -> list[str]:
        for sel in (
            self.soup.find(attrs={"aria-label": re.compile("breadcrumb", re.I)}),
            self.soup.find(class_=re.compile("breadcrumb", re.I)),
        ):
            if sel:
                crumbs = [_clean(a.get_text()) for a in sel.find_all(["a", "li", "span"])]
                crumbs = [c for c in crumbs if c and c not in ("/", ">", "»")]
                if crumbs:
                    return crumbs
        return []

    def _extract_meta(self) -> dict:
        meta: dict = {}
        for m in self.soup.find_all("meta"):
            name = (m.get("name") or m.get("property") or "").lower()
            content = _clean(m.get("content", ""))
            if not content:
                continue
            if name in ("description", "og:description"):
                meta.setdefault("description", content)
            elif name in ("keywords",):
                meta["keywords"] = content
            elif name in ("og:title", "twitter:title"):
                meta.setdefault("og_title", content)
        return meta

    def _strip_noise(self) -> None:
        for tag in self.soup(["script", "style", "noscript", "svg", "template"]):
            tag.decompose()
        # Strip nav/footer/aside tags. <header> is kept because page titles
        # (h1) are often inside it; class-token noise handles div-based headers.
        for tag in self.soup(["nav", "footer", "aside"]):
            tag.decompose()
        # Class/id/role-marked boilerplate containers.
        for tag in list(self.soup.find_all(True)):
            if isinstance(tag, Tag) and _has_noise_token(tag):
                tag.decompose()

    # ---- public API ----------------------------------------------------
    def parse(self) -> ParsedPage:
        forms, downloads, embeds = self._resource_links()
        return ParsedPage(
            url=self.url,
            title=self._title(),
            main_text=self._main_text(),
            sections=self._sections(),
            tables=self._tables(),
            kv_pairs=self._kv_pairs(),
            lists=self._lists(),
            form_links=forms,
            raw_text=_clean(self.soup.get_text(" ")),
            internal_links=self._internal_links(),
            meta=self._meta,
            jsonld=self._jsonld,
            microdata=self._microdata(),
            breadcrumbs=self._breadcrumbs,
            apply_links=self._apply_links(),
            download_links=downloads,
            embedded_docs=embeds,
        )

    def _title(self) -> str:
        if self.soup.title and self.soup.title.string:
            return _clean(self.soup.title.string)
        h1 = self.soup.find("h1")
        if h1:
            return _clean(h1.get_text())
        return self._meta.get("og_title", "")

    def _main_text(self) -> str:
        main = self.soup.find(["main", "article"]) or self.soup.find(attrs={"role": "main"})
        node = main or self.soup.body or self.soup
        paragraphs = [_clean(p.get_text(" ")) for p in node.find_all("p")]
        return "\n".join(p for p in paragraphs if p)

    # ---- list handling (nested-aware) ----------------------------------
    @staticmethod
    def _list_items(list_tag: Tag) -> list[str]:
        """Flatten a list: each top-level <li> becomes one item; nested <li> are
        added separately so nested lists are not lost or duplicated."""
        items: list[str] = []
        for li in list_tag.find_all("li", recursive=False):
            nested = li.find_all(["ul", "ol"], recursive=False)
            for n in nested:
                n.extract()
            own = _clean(li.get_text(" "))
            if own:
                items.append(own)
            for n in nested:
                items.extend(HtmlParser._list_items(n))
        return items

    def _lists(self) -> list[list[str]]:
        out = []
        for lst in self.soup.find_all(["ul", "ol"]):
            if lst.find_parent(["ul", "ol"]):
                continue  # only top-level lists (nested handled above)
            items = self._list_items(lst)
            if items:
                out.append(items)
        return out

    # ---- SECTION MAP (headings + accordions + cards + dl) ---------------
    def _sections(self) -> list[Section]:
        sections: list[Section] = []
        sections.extend(self._heading_sections())
        sections.extend(self._widget_sections())
        sections.extend(self._dl_sections())
        return sections

    def _heading_sections(self) -> list[Section]:
        sections: list[Section] = []
        for h in self.soup.find_all(_HEADING_TAGS):
            level = int(h.name[1])
            sec = Section(heading=_clean(h.get_text()), level=level)
            for sib in h.find_all_next():
                if not isinstance(sib, Tag):
                    continue
                if sib.name in _HEADING_TAGS and int(sib.name[1]) <= level:
                    break
                if sib.name in ("ul", "ol") and not sib.find_parent(["ul", "ol"]):
                    sec.list_items.extend(self._list_items(sib))
                elif sib.name == "p":
                    txt = _clean(sib.get_text(" "))
                    if txt:
                        sec.text = f"{sec.text} {txt}".strip()
            sections.append(sec)
        return sections

    def _widget_sections(self) -> list[Section]:
        """<details>/<summary>, Bootstrap accordions, cards and panels."""
        sections: list[Section] = []

        # Native disclosure widgets.
        for det in self.soup.find_all("details"):
            summary = det.find("summary")
            if not summary:
                continue
            label = _clean(summary.get_text())
            body = det.__copy__()
            if body.find("summary"):
                body.find("summary").extract()
            sections.append(self._section_from(label, body))

        # Bootstrap-style accordions / cards / panels: header child + body child.
        header_cls = re.compile(r"(accordion-header|accordion-button|card-header|panel-heading|card-title|panel-title)", re.I)
        body_cls = re.compile(r"(accordion-body|card-body|panel-body|collapse)", re.I)
        for item in self.soup.find_all(class_=re.compile(r"(accordion-item|card|panel)", re.I)):
            header = item.find(class_=header_cls) or item.find(_HEADING_TAGS)
            body = item.find(class_=body_cls)
            if header and body:
                sections.append(self._section_from(_clean(header.get_text()), body))
        return sections

    def _dl_sections(self) -> list[Section]:
        sections: list[Section] = []
        for dl in self.soup.find_all("dl"):
            for dt in dl.find_all("dt"):
                dd = dt.find_next_sibling("dd")
                if dd is None:
                    continue
                sections.append(self._section_from(_clean(dt.get_text()), dd))
        return sections

    def _section_from(self, label: str, body: Tag) -> Section:
        sec = Section(heading=label, level=3)
        for lst in body.find_all(["ul", "ol"]):
            if not lst.find_parent(["ul", "ol"]):
                sec.list_items.extend(self._list_items(lst))
        paras = [_clean(p.get_text(" ")) for p in body.find_all("p")]
        text = " ".join(p for p in paras if p)
        if not text and not sec.list_items:
            text = _clean(body.get_text(" "))
        sec.text = text
        return sec

    # ---- tables & key/value ---------------------------------------------
    def _tables(self) -> list[list[dict]]:
        tables: list[list[dict]] = []
        for table in self.soup.find_all("table"):
            rows = table.find_all("tr")
            if not rows:
                continue
            headers = [_clean(c.get_text(" ")) for c in rows[0].find_all(["th", "td"])]
            body = []
            for row in rows[1:]:
                cells = [_clean(c.get_text(" ")) for c in row.find_all(["th", "td"])]
                if not any(cells):
                    continue
                if headers and len(headers) == len(cells):
                    body.append(dict(zip(headers, cells)))
                else:
                    body.append({f"col_{i}": c for i, c in enumerate(cells)})
            if body:
                tables.append(body)
        return tables

    def _kv_pairs(self) -> dict[str, str]:
        pairs: dict[str, str] = {}
        # 2-column tables.
        for table in self.soup.find_all("table"):
            for row in table.find_all("tr"):
                cells = row.find_all(["th", "td"])
                if len(cells) == 2:
                    k, v = _clean(cells[0].get_text(" ")), _clean(cells[1].get_text(" "))
                    if k and v:
                        pairs.setdefault(k, v)
        # <dl> pairs.
        for dl in self.soup.find_all("dl"):
            for dt in dl.find_all("dt"):
                dd = dt.find_next_sibling("dd")
                if dd:
                    k, v = _clean(dt.get_text(" ")), _clean(dd.get_text(" "))
                    if k and v:
                        pairs.setdefault(k, v)
        # "Label: value" inside paragraphs / list items (tables-as-text fallback).
        for node in self.soup.find_all(["p", "li"]):
            m = _LABEL_VALUE.match(_clean(node.get_text(" ")))
            if m:
                pairs.setdefault(_clean(m.group(1)), _clean(m.group(2)))
        return pairs

    def _microdata(self) -> dict:
        data: dict = {}
        for el in self.soup.find_all(attrs={"itemprop": True}):
            prop = el.get("itemprop")
            val = el.get("content") or _clean(el.get_text(" "))
            if prop and val:
                data.setdefault(prop, val)
        return data

    # ---- resource links -------------------------------------------------
    def _resource_links(self):
        forms, downloads, embeds = [], [], []
        seen = set()
        for a in self.soup.find_all("a", href=True):
            href = a["href"].strip()
            absolute = urljoin(self.url, href)
            text = _clean(a.get_text(" "))
            is_doc = bool(_DOC_EXT.search(href))
            has_download = a.has_attr("download") or "download" in text.lower()
            if is_doc and absolute not in seen:
                seen.add(absolute)
                item = {"title": text or None, "url": absolute}
                # A form-looking document goes to forms; other docs to downloads.
                (forms if _FORM_HINT.search(href + " " + text) else downloads).append(item)
            elif has_download and absolute not in seen:
                seen.add(absolute)
                downloads.append({"title": text or None, "url": absolute})
        for tag in self.soup.find_all(["iframe", "embed", "object"]):
            src = tag.get("src") or tag.get("data")
            if src and _DOC_EXT.search(src):
                embeds.append(urljoin(self.url, src))
        return forms, downloads, embeds

    def _apply_links(self) -> list[str]:
        out, seen = [], set()
        for el in self.soup.find_all(["a", "button"]):
            href = el.get("href")
            text = _clean(el.get_text(" "))
            if href and _APPLY_HINT.search((href + " " + text)):
                absolute = urljoin(self.url, href.strip())
                if absolute.startswith("http") and absolute not in seen:
                    seen.add(absolute)
                    out.append(absolute)
        return out

    def _internal_links(self) -> list[str]:
        out, seen = [], set()
        for a in self.soup.find_all("a", href=True):
            absolute = urljoin(self.url, a["href"].strip())
            if absolute.startswith("http") and absolute not in seen:
                seen.add(absolute)
                out.append(absolute)
        return out
