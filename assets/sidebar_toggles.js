(function () {
  const LEFT_CLASS = "hdl-sidebar-left-collapsed";
  const RIGHT_CLASS = "hdl-sidebar-right-collapsed";
  const RIGHT_LOCKED_CLASS = "hdl-sidebar-right-locked";
  const LEFT_SELECTOR = ".hdl-sidebar-toggle-left";
  const RIGHT_SELECTOR = ".hdl-sidebar-toggle-right";
  const TOGGLE_SELECTOR = `${LEFT_SELECTOR}, ${RIGHT_SELECTOR}`;
  const PAGE_OUTLINE_NAV_SELECTOR = [
    "article.article > .lg\\:col-margin-right > nav",
    "article.article > .lg\\:col-margin-right nav.myst-outline",
  ].join(", ");
  const PAGE_OUTLINE_HEADING_SELECTOR = [
    "article.article h2[id]",
    "article.article h3[id]",
    "article.article h4[id]",
  ].join(", ");
  const MARGIN_ASIDE_SELECTOR = "article.article .myst-jp-nb-block aside.myst-aside";
  const MARGIN_ASIDE_CONTAINER_SELECTOR = ".hdl-margin-asides";
  const MARGIN_ASIDE_ANCHOR_CLASS = "hdl-margin-aside-anchor";
  const RIGHT_MARGIN_CONTENT_SELECTOR = [
    "article.article > aside",
    "article.article > .col-page-right",
    "article.article > .col-margin-right",
    ".hdl-margin-asides > aside.myst-aside",
  ].join(", ");
  let marginAsideId = 0;
  let marginAsideUpdateScheduled = false;
  const COLAB_ICON = [
    '<svg class="myst-fm-colab-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">',
    '<path d="M14.8 4.9c1.4-.9 3.2-1 4.7-.2 2.9 1.5 3.9 5 2.3 7.8l-1.1 2c-1.6 2.8-5.2 3.8-8 2.3-.7-.4-1.3-.9-1.8-1.5l2.1-1.2c.3.3.6.5.9.7 1.8 1 4.1.3 5.1-1.5l1.1-2c1-1.8.3-4-1.5-5-1-.6-2.2-.6-3.2 0l-.6-1.4ZM9.2 19.1c-1.4.9-3.2 1-4.7.2-2.9-1.5-3.9-5-2.3-7.8l1.1-2c1.6-2.8 5.2-3.8 8-2.3.7.4 1.3.9 1.8 1.5L11 9.9c-.3-.3-.6-.5-.9-.7-1.8-1-4.1-.3-5.1 1.5l-1.1 2c-1 1.8-.3 4 1.5 5 1 .6 2.2.6 3.2 0l.6 1.4Zm7.2-10.6 1.9 1.1-10.7 6-1.9-1.1 10.7-6Z"></path>',
    "</svg>",
  ].join("");
  const PYTHON_KEYWORDS = new Set([
    "False",
    "None",
    "True",
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "nonlocal",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield",
  ]);
  const PYTHON_BUILTINS = new Set([
    "Any",
    "Float",
    "Protocol",
    "abs",
    "all",
    "any",
    "bool",
    "dict",
    "enumerate",
    "float",
    "int",
    "len",
    "list",
    "max",
    "min",
    "np",
    "plt",
    "print",
    "range",
    "set",
    "str",
    "sum",
    "tuple",
    "zip",
  ]);

  function setButtonState(selector, pressed, disabled = false) {
    document.querySelectorAll(selector).forEach((button) => {
      button.setAttribute("role", "button");
      button.setAttribute("aria-pressed", String(pressed));
      button.removeAttribute("target");
      button.removeAttribute("rel");

      if (disabled) {
        button.setAttribute("aria-disabled", "true");
        button.setAttribute("tabindex", "-1");
        button.setAttribute("title", "Right sidebar stays open because this page has margin content");
        button.classList.add("hdl-sidebar-toggle-disabled");
      } else {
        button.removeAttribute("aria-disabled");
        button.removeAttribute("tabindex");
        button.classList.remove("hdl-sidebar-toggle-disabled");
        if (button.matches(RIGHT_SELECTOR)) {
          button.setAttribute("title", "Toggle On this page");
        }
      }
    });
  }

  function hasRightMarginContent() {
    return document.querySelector(RIGHT_MARGIN_CONTENT_SELECTOR) !== null;
  }

  function syncRightSidebarLock() {
    const locked = hasRightMarginContent();
    document.body.classList.toggle(RIGHT_LOCKED_CLASS, locked);
    if (locked) {
      document.body.classList.remove(RIGHT_CLASS);
    }
    return locked;
  }

  function syncButtonState() {
    const rightLocked = syncRightSidebarLock();
    setButtonState(LEFT_SELECTOR, document.body.classList.contains(LEFT_CLASS));
    setButtonState(RIGHT_SELECTOR, document.body.classList.contains(RIGHT_CLASS), rightLocked);
  }

  function colabUrlFromEditUrl(editUrl) {
    const match = editUrl.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/edit\/([^/]+)\/(.+\.ipynb)$/);
    if (!match) return null;
    const [, repo, branch, notebookPath] = match;
    return `https://colab.research.google.com/github/${repo}/blob/${branch}/${notebookPath}`;
  }

  function ensureColabLink() {
    const badges = document.querySelector(".myst-fm-block-badges");
    if (!badges) return false;

    const editLink = document.querySelector(".myst-fm-edit-link");
    const colabUrl = editLink ? colabUrlFromEditUrl(editLink.href) : null;
    const existing = badges.querySelector(".myst-fm-colab-link");

    if (!colabUrl) {
      if (existing) existing.remove();
      return false;
    }

    if (existing) {
      existing.href = colabUrl;
      return true;
    }

    const link = document.createElement("a");
    link.href = colabUrl;
    link.title = "Open in Google Colab";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "myst-fm-colab-link text-inherit hover:text-inherit";
    link.setAttribute("aria-label", "Open this notebook in Google Colab");
    link.innerHTML = COLAB_ICON;
    badges.prepend(link);
    return true;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function codeSpan(className, text) {
    return `<span class="${className}">${escapeHtml(text)}</span>`;
  }

  function matchPythonString(source, start) {
    const match = source.slice(start).match(/^(?:[rRuUbBfF]{0,3})("""|'''|"|')/);
    if (!match) return null;

    const opener = match[0];
    const quote = match[1];
    const close = quote;
    const isTriple = quote.length === 3;
    let cursor = start + opener.length;
    while (cursor < source.length) {
      if (source.startsWith(close, cursor)) {
        return source.slice(start, cursor + close.length);
      }
      if (!isTriple && source[cursor] === "\n") {
        return source.slice(start, cursor);
      }
      if (source[cursor] === "\\" && !/^[rR]/.test(opener)) {
        cursor += 2;
      } else {
        cursor += 1;
      }
    }
    return source.slice(start);
  }

  function highlightPythonSource(source) {
    let html = "";
    let index = 0;

    while (index < source.length) {
      const char = source[index];

      if (/\s/.test(char)) {
        html += escapeHtml(char);
        index += 1;
        continue;
      }

      if (char === "#") {
        const end = source.indexOf("\n", index);
        const token = end === -1 ? source.slice(index) : source.slice(index, end);
        html += codeSpan("hdl-code-comment", token);
        index += token.length;
        continue;
      }

      if (char === "@") {
        const match = source.slice(index).match(/^@[A-Za-z_][A-Za-z0-9_.]*/);
        if (match) {
          html += codeSpan("hdl-code-decorator", match[0]);
          index += match[0].length;
          continue;
        }
      }

      const stringToken = matchPythonString(source, index);
      if (stringToken) {
        html += codeSpan("hdl-code-string", stringToken);
        index += stringToken.length;
        continue;
      }

      const numberMatch = source
        .slice(index)
        .match(/^(?:0[xX][0-9A-Fa-f_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.\d[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?j?)/);
      if (numberMatch) {
        html += codeSpan("hdl-code-number", numberMatch[0]);
        index += numberMatch[0].length;
        continue;
      }

      const nameMatch = source.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      if (nameMatch) {
        const token = nameMatch[0];
        const rest = source.slice(index + token.length);
        if (PYTHON_KEYWORDS.has(token)) {
          html += codeSpan("hdl-code-keyword", token);
        } else if (PYTHON_BUILTINS.has(token)) {
          html += codeSpan("hdl-code-builtin", token);
        } else if (/^\s*\(/.test(rest)) {
          html += codeSpan("hdl-code-function", token);
        } else {
          html += escapeHtml(token);
        }
        index += token.length;
        continue;
      }

      if (/^[+\-*/%=!<>|&^~:.,;()[\]{}]+/.test(source.slice(index))) {
        const operator = source.slice(index).match(/^[+\-*/%=!<>|&^~:.,;()[\]{}]+/)[0];
        html += codeSpan("hdl-code-operator", operator);
        index += operator.length;
        continue;
      }

      html += escapeHtml(char);
      index += 1;
    }

    return html;
  }

  function highlightCodeBlocks() {
    let changed = false;
    document.querySelectorAll("pre code.language-python").forEach((code) => {
      if (code.dataset.hdlHighlighted === "true") return;
      if (code.querySelector("span")) return;
      code.innerHTML = highlightPythonSource(code.textContent || "");
      code.dataset.hdlHighlighted = "true";
      changed = true;
    });
    return changed;
  }

  function headingLabel(heading) {
    const label = heading.querySelector(".heading-text")?.textContent || heading.textContent || "";
    return label.replace("¶", "").trim();
  }

  function headingDepth(heading) {
    const match = heading.tagName.match(/^H([2-4])$/);
    return match ? Number(match[1]) : 2;
  }

  function shouldIncludeOutlineHeading(heading) {
    if (heading.closest(".myst-bibliography")) return false;
    if (heading.closest("[hidden]")) return false;
    return headingLabel(heading).length > 0;
  }

  function createPageOutlineLink(heading) {
    const depth = headingDepth(heading);
    const item = document.createElement("li");
    item.className = "hdl-page-outline-item";

    const link = document.createElement("a");
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.className = `hdl-page-outline-link hdl-page-outline-depth-${depth}`;
    link.textContent = headingLabel(heading);
    item.appendChild(link);
    return item;
  }

  function asideKey(aside) {
    return (aside.textContent || "").replace(/\s+/g, " ").trim();
  }

  function nextMarginAsideId() {
    marginAsideId += 1;
    return `hdl-margin-aside-${marginAsideId}`;
  }

  function ensureAsideAnchor(aside) {
    const existingId = aside.dataset.hdlMarginAnchor;
    if (existingId && document.getElementById(existingId)) return existingId;

    const id = nextMarginAsideId();
    const anchor = document.createElement("span");
    anchor.id = id;
    anchor.className = MARGIN_ASIDE_ANCHOR_CLASS;
    anchor.setAttribute("aria-hidden", "true");
    aside.before(anchor);
    aside.dataset.hdlMarginAnchor = id;
    return id;
  }

  function activeMarginAsides(container) {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    const topLimit = Math.max(72, viewportHeight * 0.16);
    const bottomLimit = Math.min(viewportHeight * 0.74, topLimit + 420);
    return Array.from(container.querySelectorAll("aside.myst-aside")).filter((aside) => {
      const anchor = document.getElementById(aside.dataset.hdlMarginAnchor || "");
      if (!anchor) return false;
      const rect = anchor.getBoundingClientRect();
      return rect.top >= topLimit && rect.top <= bottomLimit;
    });
  }

  function updateMarginAsideVisibility(nav) {
    const container = nav.querySelector(MARGIN_ASIDE_CONTAINER_SELECTOR);
    if (!container) return false;

    const activeAsides = new Set(activeMarginAsides(container));
    const hasActiveAsides = activeAsides.size > 0;
    Array.from(container.querySelectorAll("aside.myst-aside")).forEach((aside) => {
      aside.toggleAttribute("hidden", !activeAsides.has(aside));
    });
    container.toggleAttribute("hidden", !hasActiveAsides);
    nav.classList.toggle("hdl-margin-active", hasActiveAsides);
    return hasActiveAsides;
  }

  function scheduleMarginAsideVisibilityUpdate() {
    if (marginAsideUpdateScheduled) return;
    marginAsideUpdateScheduled = true;
    window.requestAnimationFrame(() => {
      marginAsideUpdateScheduled = false;
      const nav = document.querySelector(PAGE_OUTLINE_NAV_SELECTOR);
      if (nav) updateMarginAsideVisibility(nav);
    });
  }

  function ensureMarginAsides(nav) {
    const sourceAsides = Array.from(document.querySelectorAll(MARGIN_ASIDE_SELECTOR)).filter(
      (aside) => !aside.closest(".hdl-margin-asides"),
    );
    if (!sourceAsides.length) {
      updateMarginAsideVisibility(nav);
      return false;
    }

    let container = nav.querySelector(".hdl-margin-asides");
    if (!container) {
      container = document.createElement("div");
      container.className = "hdl-margin-asides";
      nav.prepend(container);
    }

    const existingKeys = new Set(
      Array.from(container.querySelectorAll("aside.myst-aside")).map(asideKey),
    );
    sourceAsides.forEach((aside) => {
      const key = asideKey(aside);
      if (existingKeys.has(key)) {
        aside.remove();
        return;
      }
      ensureAsideAnchor(aside);
      aside.classList.add("hdl-margin-aside");
      aside.removeAttribute("style");
      aside.setAttribute("hidden", "");
      container.appendChild(aside);
      existingKeys.add(key);
    });
    updateMarginAsideVisibility(nav);
    return true;
  }

  function ensurePageOutline() {
    const nav = document.querySelector(PAGE_OUTLINE_NAV_SELECTOR);
    if (!nav) return false;
    nav.classList.add("hdl-outline-enhanced");
    const asideChanged = ensureMarginAsides(nav);
    if (nav.dataset.hdlPageOutline === "true") return asideChanged;

    const headings = Array.from(document.querySelectorAll(PAGE_OUTLINE_HEADING_SELECTOR)).filter(
      shouldIncludeOutlineHeading,
    );
    if (!headings.length) return asideChanged;

    const outline = document.createElement("div");
    outline.className = "hdl-page-outline";

    const title = document.createElement("div");
    title.className = "hdl-page-outline-title";
    title.textContent = "On this page";
    outline.appendChild(title);

    const list = document.createElement("ol");
    list.className = "hdl-page-outline-list";
    headings.forEach((heading) => list.appendChild(createPageOutlineLink(heading)));
    outline.appendChild(list);

    nav.appendChild(outline);
    nav.dataset.hdlPageOutline = "true";
    updateMarginAsideVisibility(nav);
    return true;
  }

  function getPageReferenceData() {
    const loaderData = window.__remixContext?.state?.loaderData;
    const page = loaderData?.["routes/$"]?.page;
    const citeData = page?.references?.cite?.data;
    return citeData && typeof citeData === "object" ? citeData : {};
  }

  function getProjectData() {
    return window.__remixContext?.state?.loaderData?.["routes/$"]?.project || {};
  }

  function slugFromFile(file) {
    if (!file || typeof file !== "string") return "";
    return file
      .split("/")
      .pop()
      .replace(/\.(ipynb|md)$/i, "")
      .replace(/_/g, "-");
  }

  function currentPageSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] || "";
    const pages = getProjectData().pages;
    if (Array.isArray(pages) && pages.some((page) => page?.slug === lastPart)) {
      return lastPart;
    }
    return "index";
  }

  function siteBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const slug = currentPageSlug();
    if (slug !== "index" && parts[parts.length - 1] === slug) {
      parts.pop();
    }
    return parts.length ? `/${parts.join("/")}` : "";
  }

  function pageHref(slug) {
    return `${siteBasePath()}/${slug}`;
  }

  function projectPagesBySlug() {
    const pages = getProjectData().pages;
    const bySlug = new Map();
    if (!Array.isArray(pages)) return bySlug;

    pages.forEach((page) => {
      if (page?.slug) bySlug.set(page.slug, page);
    });
    return bySlug;
  }

  function setTocFolderOpen(folder, button, panel, open) {
    folder.setAttribute("data-state", open ? "open" : "closed");
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("data-state", open ? "open" : "closed");
    panel.setAttribute("data-state", open ? "open" : "closed");
    panel.toggleAttribute("hidden", !open);
  }

  function tocFolderTitle(folder) {
    const titleElement = folder.querySelector(".myst-toc-item [title]");
    return titleElement?.getAttribute("title") || titleElement?.textContent?.trim() || "";
  }

  function createTocLink(page, slug) {
    const link = document.createElement("a");
    link.href = pageHref(slug);
    link.title = page?.title || slug;
    link.textContent = page?.title || slug;
    link.className = [
      "block",
      "break-words",
      "focus:outline",
      "outline-blue-200",
      "outline-2",
      "rounded",
      "myst-toc-item",
      "p-2",
      "my-1",
      "rounded-lg",
      "hover:bg-slate-300/30",
    ].join(" ");
    if (slug === currentPageSlug()) {
      link.setAttribute("aria-current", "page");
      link.classList.add("font-bold");
    }
    return link;
  }

  function ensurePrimaryTocFolders() {
    const project = getProjectData();
    const toc = Array.isArray(project.toc) ? project.toc : [];
    if (!toc.length) return false;

    const pagesBySlug = projectPagesBySlug();
    let changed = false;

    document.querySelectorAll(".myst-toc > div[data-state]").forEach((folder) => {
      const button = folder.querySelector("button[aria-controls]");
      if (!button) return;

      const panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;

      const group = toc.find((item) => item?.title === tocFolderTitle(folder));
      const children = Array.isArray(group?.children) ? group.children : [];
      if (!children.length) return;

      if (!panel.querySelector("a[href]")) {
        children.forEach((child) => {
          const slug = slugFromFile(child.file);
          if (!slug) return;
          panel.appendChild(createTocLink(pagesBySlug.get(slug), slug));
        });
        changed = true;
      }

      const shouldStartOpen = children.some((child) => slugFromFile(child.file) === currentPageSlug());
      if (shouldStartOpen && button.dataset.hdlTocInitialized !== "true") {
        setTocFolderOpen(folder, button, panel, true);
        changed = true;
      }

      if (button.dataset.hdlTocInitialized === "true") return;
      button.dataset.hdlTocInitialized = "true";
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          setTocFolderOpen(folder, button, panel, button.getAttribute("data-state") !== "open");
        },
        true,
      );

      const title = folder.querySelector(".myst-toc-item [title]");
      title?.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();
          setTocFolderOpen(folder, button, panel, button.getAttribute("data-state") !== "open");
        },
        true,
      );
      changed = true;
    });

    return changed;
  }

  function addCitationUrl(urlMap, url, label) {
    if (!url || typeof url !== "string") return;
    urlMap.set(url, label);
    try {
      urlMap.set(new URL(url, window.location.href).href, label);
    } catch {
      // Ignore malformed citation URLs.
    }
  }

  function buildCitationContext() {
    const references = getPageReferenceData();
    const urlMap = new Map();
    Object.entries(references).forEach(([label, reference]) => {
      if (!reference || typeof reference !== "object") return;
      addCitationUrl(urlMap, reference.url, label);

      if (typeof reference.html === "string") {
        const template = document.createElement("template");
        template.innerHTML = reference.html;
        template.content.querySelectorAll("a[href]").forEach((link) => {
          addCitationUrl(urlMap, link.getAttribute("href"), label);
        });
      }
    });
    return { references, urlMap };
  }

  function labelFromCitationLink(link, urlMap) {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("#cite-")) return href.slice("#cite-".length);
    return urlMap.get(href) || urlMap.get(link.href) || null;
  }

  function localizeCitations() {
    const { references, urlMap } = buildCitationContext();
    let changed = false;

    document.querySelectorAll("cite a").forEach((link) => {
      const label = labelFromCitationLink(link, urlMap);
      const enumerator = label ? references[label]?.enumerator : null;
      if (!label || !enumerator || !document.getElementById(`cite-${label}`)) return;

      const href = `#cite-${label}`;
      const text = `[${enumerator}]`;
      if (link.getAttribute("href") !== href) {
        link.setAttribute("href", href);
        changed = true;
      }
      if (link.textContent !== text) {
        link.textContent = text;
        changed = true;
      }
      if (link.hasAttribute("target")) {
        link.removeAttribute("target");
        changed = true;
      }
      if (link.hasAttribute("rel")) {
        link.removeAttribute("rel");
        changed = true;
      }
    });

    return changed;
  }

  function hideNoCssDialog() {
    const dialog = document.querySelector("#myst-no-css");
    if (!dialog) return;
    dialog.removeAttribute("open");
    dialog.setAttribute("aria-hidden", "true");
    dialog.style.setProperty("display", "none", "important");
    dialog.style.setProperty("visibility", "hidden", "important");
  }

  function startPageEnhancementSync() {
    let attempts = 0;
    const retry = () => {
      hideNoCssDialog();
      const ready = ensureColabLink();
      localizeCitations();
      ensurePageOutline();
      ensurePrimaryTocFolders();
      highlightCodeBlocks();
      syncButtonState();
      attempts += 1;
      if (!ready && attempts < 20) {
        window.setTimeout(retry, 250);
      }
    };

    retry();
    const observer = new MutationObserver(() => {
      hideNoCssDialog();
      ensureColabLink();
      localizeCitations();
      ensurePageOutline();
      ensurePrimaryTocFolders();
      highlightCodeBlocks();
      syncButtonState();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function schedulePageEnhancementSync() {
    window.setTimeout(startPageEnhancementSync, 1000);
  }

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest(TOGGLE_SELECTOR);
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();

      if (button.matches(LEFT_SELECTOR)) {
        document.body.classList.toggle(LEFT_CLASS);
      }
      if (button.matches(RIGHT_SELECTOR)) {
        if (document.body.classList.contains(RIGHT_LOCKED_CLASS)) {
          syncButtonState();
          return;
        }
        document.body.classList.toggle(RIGHT_CLASS);
      }
      syncButtonState();
    },
    true,
  );
  window.addEventListener("scroll", scheduleMarginAsideVisibilityUpdate, { passive: true });
  window.addEventListener("resize", scheduleMarginAsideVisibilityUpdate);

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        syncButtonState();
        schedulePageEnhancementSync();
      },
      { once: true },
    );
  } else {
    syncButtonState();
    schedulePageEnhancementSync();
  }
})();
