import json
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

CITIES = [
    ("zuerich", "Zürich", "zuerich"),
    ("genf", "Genf", "genf"),
    ("basel", "Basel", "basel"),
    ("bern", "Bern", "bern"),
    ("lausanne", "Lausanne", "lausanne"),
    ("winterthur", "Winterthur", "winterthur"),
    ("st-gallen", "St. Gallen", "st-gallen"),
    ("lugano", "Lugano", "lugano"),
    ("fribourg", "Freiburg (Fribourg)", "fribourg"),
    ("thun", "Thun", "thun"),
    ("koeniz", "Köniz", "köniz"),
    ("biel-bienne", "Biel/Bienne", "biel/bienne"),
    ("schaffhausen", "Schaffhausen", "schaffhausen"),
    ("la-chaux-de-fonds", "La Chaux-de-Fonds", "la-chaux-de-fonds"),
    ("luzern", "Luzern", "luzern"),
    ("chur", "Chur", "chur"),
    ("zug", "Zug", "zug"),
    ("aarau", "Aarau", "aarau"),
]

SLUG_ALIASES = {
    "zuerich": "zuerich", "genf": "genf", "basel": "basel", "bern": "bern",
    "lausanne": "lausanne", "winterthur": "winterthur", "st-gallen": "st-gallen",
    "st.gallen": "st-gallen", "lugano": "lugano", "fribourg": "fribourg",
    "thun": "thun", "köniz": "koeniz", "koeniz": "koeniz",
    "biel/bienne": "biel-bienne", "schaffhausen": "schaffhausen",
    "la-chaux-de-fonds": "la-chaux-de-fonds", "la chaux-de-fonds": "la-chaux-de-fonds",
    "luzern": "luzern", "chur": "chur", "zug": "zug", "aarau": "aarau",
}

ALLOWED_TAGS = {"a", "br", "div", "em", "h2", "h3", "h4", "hr", "img", "li", "p", "small", "strong", "ul"}
ALLOWED_ATTRIBUTES = {
    "a": {"class", "href"},
    "div": {"class"},
    "img": {"alt", "class", "loading", "src"},
    "ul": {"class"},
}
ACTIVE_TAGS = {"base", "embed", "form", "iframe", "link", "math", "meta", "noscript", "object", "script", "style", "svg", "template"}
TRUSTED_IMAGE_HOSTS = {"ab50.ch", "cdn3.icony-hosting.de", "static2.icony-hosting.de", "static-cms.icony-hosting.de"}


def safe_href(value: str) -> bool:
    value = value.strip()
    if not value or any(ord(char) < 32 for char in value):
        return False
    if value.startswith(("/", "#")) and not value.startswith("//"):
        return True
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def safe_image_src(value: str) -> bool:
    value = value.strip()
    if not safe_href(value) or value.startswith(("/", "#")):
        return False
    parsed = urlparse(value)
    return parsed.scheme == "https" and parsed.hostname in TRUSTED_IMAGE_HOSTS


def sanitize_fragment(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for element in list(soup.find_all(True)):
        if element.parent is None:
            continue
        if element.name in ACTIVE_TAGS:
            element.decompose()
            continue
        if element.name not in ALLOWED_TAGS:
            element.unwrap()
            continue

        allowed = ALLOWED_ATTRIBUTES.get(element.name, set())
        for attribute in list(element.attrs):
            if attribute not in allowed:
                del element.attrs[attribute]

        if element.name == "a" and element.has_attr("href") and not safe_href(str(element["href"])):
            del element.attrs["href"]
        if element.name == "img":
            if not element.has_attr("src") or not safe_image_src(str(element["src"])):
                element.decompose()
                continue
            element["loading"] = "lazy"

    for heading in soup.select("h2,h3,h4"):
        if not heading.find("img") and not heading.get_text(" ", strip=True).replace("\xa0", "").strip():
            heading.decompose()
    for paragraph in soup.select("p"):
        if not paragraph.find(["img", "a"]) and not paragraph.get_text(" ", strip=True).replace("\xa0", "").strip():
            paragraph.decompose()
    return str(soup)


def normalize_links(root) -> str:
    for tag in root.select("script,style,form,iframe,noscript,.grid-view"):
        tag.decompose()
    for anchor in root.select("a[href]"):
        href = anchor.get("href", "").strip()
        if href.startswith("https://ab50.ch/singles/"):
            raw = href.split("/singles/", 1)[1].strip("/")
            target = SLUG_ALIASES.get(raw)
            if target:
                anchor["href"] = f"/partnersuche/{target}"
        elif href.startswith("https://ab50.ch/schweiz") or href == "https://ab50.ch/singles/":
            anchor["href"] = "/partnersuche"
        elif "registration" in href or href.rstrip("/") == "https://ab50.ch":
            anchor["href"] = "https://ab50.ch/?AID=location"
    return sanitize_fragment(str(root))


def get(url: str) -> BeautifulSoup:
    response = requests.get(url, headers={"User-Agent": "ab50 Next.js migration inventory"}, timeout=30)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def build_inventory() -> dict:
    hub_url = "https://ab50.ch/schweiz/"
    hub = get(hub_url)
    h1 = hub.find("h1")
    panel = h1.find_parent("div", class_=lambda value: value and "panel" in value)
    hero = panel.find("img")
    hero_data = {
        "url": hero.get("src"),
        "alt": hero.get("alt") or "Partnersuche ab 50 in der Schweiz",
        "sourcePageUrl": hub_url,
        "rightsStatus": "Legacy first-party CMS asset; reuse rights not independently verified",
    }
    (hero.find_parent(["picture", "figure"]) or hero).decompose()
    h1.decompose()
    meta = hub.select_one("meta[name=description]")
    result = {
        "market": "ch",
        "overview": {
            "title": "Partnersuche ab 50 in der Schweiz",
            "description": meta.get("content", "").strip(),
            "sourceUrl": hub_url,
            "heroImage": hero_data,
            "contentHtml": normalize_links(panel),
        },
        "cities": [],
    }

    for slug, name, source_slug in CITIES:
        url = f"https://ab50.ch/singles/{source_slug}/"
        soup = get(url)
        h1 = soup.find("h1")
        if not h1:
            raise RuntimeError(f"No H1: {url}")
        panel = h1.find_parent("div", class_=lambda value: value and "panel" in value)
        content = panel.select_one(".text-content")
        if not content:
            raise RuntimeError(f"No editorial content: {url}")
        hero = content.find("img")
        if not hero:
            raise RuntimeError(f"No hero: {url}")
        hero_data = {
            "url": hero.get("src"),
            "alt": hero.get("alt") or f"Singles ab 50 in {name}",
            "sourcePageUrl": url,
            "rightsStatus": "Legacy first-party CMS asset; reuse rights not independently verified",
        }
        (hero.find_parent(["picture", "figure"]) or hero).decompose()
        description = (soup.select_one("meta[name=description]") or {}).get("content", "").strip()
        result["cities"].append({
            "slug": slug,
            "sourceSlug": source_slug,
            "name": name,
            "title": h1.get_text(" ", strip=True),
            "description": description,
            "sourceUrl": url,
            "heroImage": hero_data,
            "contentHtml": normalize_links(content),
        })
    return result


def main() -> None:
    result = build_inventory()
    output_path = Path(__file__).resolve().parents[1] / "data" / "ch-partnersuche.json"
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(result['cities'])} Swiss cities at {output_path}")


if __name__ == "__main__":
    main()
