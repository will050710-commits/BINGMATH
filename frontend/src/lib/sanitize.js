// frontend/src/lib/sanitize.js
//
// Phase 1 security hardening (audit finding P2-14).
//
// The lesson sidebar used to drop author-provided HTML straight into the page
// with dangerouslySetInnerHTML. DOMPurify is the usual answer, but this project
// cannot currently install it (npm fails resolving the tree's git dependency
// closure-net), so this helper sanitises with the browser's own HTML parser and
// a strict allowlist instead: scripts, iframes, event handlers (on*) and
// javascript:/data: URLs are removed. Swap the implementation for DOMPurify
// once the dependency can be added — the API stays the same.
const ALLOWED_TAGS = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "CODE", "DIV", "EM", "H1", "H2", "H3", "H4",
  "H5", "H6", "HR", "I", "IMG", "LI", "OL", "P", "PRE", "SMALL", "SPAN",
  "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "U", "UL",
]);

// Tags whose *content* must disappear as well.
const DROP_TAGS = new Set([
  "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "FORM",
  "INPUT", "BUTTON", "SVG", "MATH", "VIDEO", "AUDIO", "SOURCE",
]);

const ALLOWED_ATTRS = new Set(["href", "title", "alt", "src", "target", "rel", "style", "class"]);
const SAFE_URL = /^(https?:|mailto:|#|\/)/i;

export function sanitizeHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined" || typeof document === "undefined") return "";

  const template = document.createElement("template");
  template.innerHTML = String(html);

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const unwrap = [];
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (DROP_TAGS.has(el.tagName)) {
      el.remove();
      continue;
    }
    if (!ALLOWED_TAGS.has(el.tagName)) {
      unwrap.push(el);
      continue;
    }
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || !ALLOWED_ATTRS.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if ((name === "href" || name === "src") && !SAFE_URL.test(attr.value.trim())) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === "A") {
      el.setAttribute("rel", "noopener noreferrer");
      if (!el.getAttribute("target")) el.setAttribute("target", "_blank");
    }
  }
  // Unknown-but-harmless tags (section, article, ...) keep their text.
  for (const el of unwrap) {
    el.replaceWith(...el.childNodes);
  }
  return template.innerHTML;
}

/** Sanitise a source-attribution string and link the "Khan Academy" brand. */
export function creditHtml(text) {
  if (!text) return "";
  const linked = String(text).replace(
    /Khan Academy/g,
    '<a href="https://www.youtube.com/@khanacademy" target="_blank" rel="noopener noreferrer" style="color:#22d3ee;text-decoration:underline;font-weight:600;">Khan Academy</a>'
  );
  return sanitizeHtml(linked);
}
