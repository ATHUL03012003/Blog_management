import bleach

ALLOWED_TAGS = [
    "h2",
    "h3",
    "p",
    "strong",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
    "br",
]

ALLOWED_ATTRIBUTES = {
    "a": ["href", "title", "target", "rel"],
    "img": ["src", "alt", "title", "width", "height"],
}

ALLOWED_PROTOCOLS = ["http", "https", "mailto"]


def sanitize_post_html(html: str) -> str:
    if not html:
        return ""
    cleaned = bleach.clean(
        html,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
    )
    return cleaned
