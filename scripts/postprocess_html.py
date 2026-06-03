"""Post-process MyST HTML output for local and GitHub Pages previews."""

from __future__ import annotations

import hashlib
import json
import os
import re
from html import escape
from pathlib import Path
from shutil import copyfile


BUILD_DIR = Path("_build/html")
SCRIPT_SOURCE = Path("assets/sidebar_toggles.js")
SCRIPT_TARGET = BUILD_DIR / "sidebar_toggles.js"
SIDEBAR_SCRIPT_RE = re.compile(
    r'<script src="[^"]*sidebar_toggles\.js(?:\?v=[^"]*)?" defer></script>'
)
NO_CSS_GUARD_STYLE_RE = re.compile(
    r'<style id="hdl-no-css-dialog-guard">.*?</style>',
    re.DOTALL,
)
NO_CSS_DIALOG_RE = re.compile(
    r'<dialog id="myst-no-css"[^>]*>.*?</dialog>',
    re.DOTALL,
)
MODULE_PRELOAD_RE = re.compile(r'<link rel="modulepreload" href="[^"]+"/>')
REMIX_CLIENT_SCRIPT_RE = re.compile(
    r'<script type="module" async="">.*?</script>',
    re.DOTALL,
)
COLAB_LINK_RE = re.compile(
    r'<a href="https://colab\.research\.google\.com/github/[^"]+" '
    r'title="Open in Google Colab" target="_blank" rel="noopener noreferrer" '
    r'class="myst-fm-colab-link text-inherit hover:text-inherit" '
    r'aria-label="Open this notebook in Google Colab">.*?</a>',
    re.DOTALL,
)
REMIX_CONTEXT_RE = re.compile(
    r"window\.__remixContext\s*=\s*(\{.*?\});</script>",
    re.DOTALL,
)
CITE_ELEMENT_RE = re.compile(
    r"<cite\b(?P<attrs>[^>]*)>(?P<body>.*?)</cite>",
    re.DOTALL,
)
ANCHOR_RE = re.compile(r"<a\b(?P<attrs>[^>]*)>(?P<body>.*?)</a>", re.DOTALL)
SPAN_RE = re.compile(r"<span\b(?P<attrs>[^>]*)>(?P<body>.*?)</span>", re.DOTALL)
HREF_ATTR_RE = re.compile(r'\s+href="[^"]*"')
TARGET_ATTR_RE = re.compile(r'\s+target="[^"]*"')
REL_ATTR_RE = re.compile(r'\s+rel="[^"]*"')
CITE_TARGET_RE = re.compile(r'\bid="(cite-[^"]+)"')
NO_CSS_GUARD_STYLE = (
    '<style id="hdl-no-css-dialog-guard">'
    "#myst-no-css{display:none!important;visibility:hidden!important;}"
    "</style>"
)


def normalized_base_url() -> str:
    base_url = os.environ.get("BASE_URL", "").strip()
    if not base_url or base_url == "/":
        return ""
    return "/" + base_url.strip("/")


def normalize_local_preview_paths(html: str) -> str:
    if normalized_base_url():
        return html

    repo_name = Path.cwd().name
    html = re.sub(rf'(?<=[("\'=:\s])/{re.escape(repo_name)}/', "/", html)
    html = re.sub(rf'(?<=[("\'=:\s])/{re.escape(repo_name)}(?=["\')\s,}}])', "", html)
    html = re.sub(rf'(?<=[("\'=:\s])\\/{re.escape(repo_name)}\\/', "\\/", html)
    html = re.sub(rf'(?<=[("\'=:\s])\\/{re.escape(repo_name)}(?=["\')\s,}}])', "", html)
    html = html.replace(f"%2F{repo_name}%2F", "%2F")
    return html.replace("//build/", "/build/")


def normalize_local_preview_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    normalized = normalize_local_preview_paths(text)
    if normalized != text:
        path.write_text(normalized, encoding="utf-8")


def disable_local_remix_client(html: str) -> str:
    if normalized_base_url():
        return html
    html = MODULE_PRELOAD_RE.sub("", html)
    return REMIX_CLIENT_SCRIPT_RE.sub("", html)


def collect_cite_labels(node: object, labels: list[str]) -> None:
    if isinstance(node, dict):
        if node.get("type") == "cite" and isinstance(node.get("label"), str):
            labels.append(node["label"])
        for value in node.values():
            collect_cite_labels(value, labels)
    elif isinstance(node, list):
        for value in node:
            collect_cite_labels(value, labels)


def citation_context_from_html(html: str) -> tuple[list[str], dict[str, str]]:
    match = REMIX_CONTEXT_RE.search(html)
    if match is None:
        return [], {}

    try:
        page = json.loads(match.group(1))["state"]["loaderData"]["routes/$"]["page"]
    except (KeyError, TypeError, json.JSONDecodeError):
        return [], {}

    labels: list[str] = []
    collect_cite_labels(page.get("mdast"), labels)
    cite_data = page.get("references", {}).get("cite", {}).get("data", {})
    if not isinstance(cite_data, dict):
        return labels, {}

    enumerators: dict[str, str] = {}
    for label, reference in cite_data.items():
        if not isinstance(label, str) or not isinstance(reference, dict):
            continue
        enumerator = reference.get("enumerator")
        if isinstance(enumerator, str) and enumerator:
            enumerators[label] = enumerator

    return labels, enumerators


def cite_target_ids(html: str) -> set[str]:
    return set(CITE_TARGET_RE.findall(html))


def localize_anchor(anchor_html: str, target: str, text: str | None = None) -> str:
    match = ANCHOR_RE.fullmatch(anchor_html)
    if match is None:
        return anchor_html

    attrs = match.group("attrs")
    attrs = HREF_ATTR_RE.sub("", attrs)
    attrs = TARGET_ATTR_RE.sub("", attrs)
    attrs = REL_ATTR_RE.sub("", attrs)
    body = text if text is not None else match.group("body")
    return f'<a href="{target}"{attrs}>{body}</a>'


def linkify_citation_body(body: str, target: str, text: str | None = None) -> str:
    anchor_match = ANCHOR_RE.search(body)
    if anchor_match is not None:
        return (
            body[: anchor_match.start()]
            + localize_anchor(anchor_match.group(0), target, text)
            + body[anchor_match.end() :]
        )

    span_match = SPAN_RE.search(body)
    if span_match is not None:
        attrs = span_match.group("attrs")
        link_body = text if text is not None else span_match.group("body")
        link = f'<a href="{target}"{attrs}>{link_body}</a>'
        return body[: span_match.start()] + link + body[span_match.end() :]

    link_body = text if text is not None else body
    return f'<a href="{target}" class="hover-link">{link_body}</a>'


def rewrite_citation_links(html: str) -> str:
    label_order, enumerators = citation_context_from_html(html)
    labels = iter(label_order)
    target_ids = cite_target_ids(html)

    def replace(match: re.Match[str]) -> str:
        label = next(labels, None)
        if label is None:
            return match.group(0)

        target_id = f"cite-{label}"
        if target_id not in target_ids:
            return match.group(0)

        citation_text = None
        if label in enumerators:
            citation_text = f"[{escape(enumerators[label])}]"
        body = linkify_citation_body(match.group("body"), f"#{target_id}", citation_text)
        return f'<cite{match.group("attrs")}>{body}</cite>'

    return CITE_ELEMENT_RE.sub(replace, html)


def inject_script(html_path: Path, script_src: str) -> None:
    html = html_path.read_text(encoding="utf-8")

    html = normalize_local_preview_paths(html)
    html = disable_local_remix_client(html)
    tag = f'<script src="{script_src}" defer></script>'
    html = NO_CSS_DIALOG_RE.sub("", html)
    html = NO_CSS_GUARD_STYLE_RE.sub("", html)
    html = SIDEBAR_SCRIPT_RE.sub("", html)
    if "</head>" in html:
        html = html.replace("</head>", f"{NO_CSS_GUARD_STYLE}{tag}</head>", 1)
    elif "</body>" in html:
        html = html.replace("</body>", f"{NO_CSS_GUARD_STYLE}{tag}</body>", 1)
    else:
        html = f"{html}{NO_CSS_GUARD_STYLE}{tag}"
    html_path.write_text(html, encoding="utf-8")


def main() -> None:
    if not BUILD_DIR.exists():
        raise SystemExit(f"Build directory does not exist: {BUILD_DIR}")
    if not SCRIPT_SOURCE.exists():
        raise SystemExit(f"Sidebar script does not exist: {SCRIPT_SOURCE}")

    copyfile(SCRIPT_SOURCE, SCRIPT_TARGET)
    script_hash = hashlib.sha256(SCRIPT_SOURCE.read_bytes()).hexdigest()[:12]
    script_src = f"{normalized_base_url()}/sidebar_toggles.js?v={script_hash}"
    html_paths = sorted(BUILD_DIR.rglob("index.html"))
    if not html_paths:
        raise SystemExit(f"No HTML pages found in build directory: {BUILD_DIR}")

    for html_path in html_paths:
        inject_script(html_path, script_src)

    for path in BUILD_DIR.rglob("*"):
        if path.suffix not in {".css", ".html", ".js", ".json"}:
            continue
        normalize_local_preview_file(path)


if __name__ == "__main__":
    main()
