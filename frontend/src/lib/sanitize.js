// frontend/src/lib/sanitize.js
//
// Phase 1 security hardening (audit finding P2-14).
//
// Phase 2: DOMPurify now performs the sanitising (it could not be installed
// before the lockfile fix). The parser-based allowlist further down is kept as
// a fallback so callers never render raw HTML.
import DOMPurify from "dompurify";

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

  // Phase 2: DOMPurify first …
  try {
    if (DOMPurify && typeof DOMPurify.sanitize === "function") {
      return DOMPurify.sanitize(String(html), {
        ALLOWED_TAGS: [...ALLOWED_TAGS],
        ALLOWED_ATTR: ["href", "title", "alt", "src", "target", "rel", "style", "class"],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["style", "form", "input", "button", "iframe", "object", "embed", "link", "meta"],
        ADD_ATTR: ["target"],
      });
    }
  } catch (err) {
    console.warn("[sanitize] DOMPurify failed, using the parser fallback:", err?.message || err);
  }

  // … and the parser allowlist below as the safety net.

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
