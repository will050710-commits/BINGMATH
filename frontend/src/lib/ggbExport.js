// frontend/src/lib/ggbExport.js
//
// Roadmap Q4/2026 item 2 — "Xuất tệp GeoGebra (.ggb)" on the geometry widget.
//
// The backend (backend/geogebra_export.py) turns the MathViz layer block into a
// GeoGebra worksheet; this module is the browser side: one POST, one download,
// plus a "copy the commands" action for a student who would rather type them
// into geogebra.org by hand.
//
// Two rules worth keeping:
//   * the API base comes from src/lib/apiBase.js — never a literal host
//     (scripts/check-api-base.mjs fails CI otherwise);
//   * the widget's own view state (engine choice, dragged points, ghost
//     transform preview) is NOT exported. What goes into the file is the figure
//     the lesson is about, not the viewer's current interaction.

import { resolveApiBase } from "@/lib/apiBase";

/** Layer kinds backend/geogebra_export.py can draw (SUPPORTED_KINDS there). */
export const SUPPORTED_LAYER_KINDS = ["polygon", "triangle", "circle", "line", "segment", "points"];

const DEFAULT_FILENAME = "duomath-hinh-hoc.ggb";

function hasXY(value) {
  return Boolean(value) && Number.isFinite(Number(value.x)) && Number.isFinite(Number(value.y));
}

/**
 * Local, request-free estimate so the button can hide itself when there is
 * nothing to export and can warn before the click. It cannot be exact: the
 * backend de-duplicates points that share a coordinate (one GeoGebra object per
 * point), so a figure with repeats counts higher here than in the file. Numbers
 * from the server response are authoritative and replace these after a click.
 */
export function countExportableGeometry(data) {
  const layers = Array.isArray(data?.layers) ? data.layers : [];
  let objects = 0;
  let skipped = 0;

  for (const layer of layers) {
    const kind = layer?.kind;
    if (kind === "points") {
      const items = Array.isArray(layer.data) ? layer.data : Array.isArray(layer.points) ? layer.points : [];
      const usable = items.filter(hasXY).length;
      objects += usable;
      if (usable < items.length || items.length === 0) skipped += 1;
    } else if (kind === "polygon" || kind === "triangle") {
      const vertices = Array.isArray(layer.points) ? layer.points.filter(hasXY) : [];
      if (vertices.length >= 3) objects += vertices.length + 1;   // vertices + the polygon
      else skipped += 1;
    } else if (kind === "line" || kind === "segment") {
      if (hasXY(layer.from) && hasXY(layer.to)) objects += 1;
      else skipped += 1;
    } else if (kind === "circle") {
      if (hasXY(layer.center) && Number(layer.r) > 0) objects += 2;  // centre point + circle
      else skipped += 1;
    } else {
      skipped += 1;
    }
  }
  return { objects, skipped };
}

/** Only what the exporter reads — the widget's own keys stay in the browser. */
function toVizPayload(data) {
  return {
    type: data?.type || "mathviz.v1",
    widget: data?.widget || "geometry_2d",
    title: data?.title || "",
    layers: Array.isArray(data?.layers) ? data.layers : [],
  };
}

async function readError(response) {
  try {
    const body = await response.json();
    if (body?.detail) return String(body.detail);
  } catch {
    /* not JSON — fall through to the status line */
  }
  if (response.status === 413) return "Hình quá lớn để xuất (tối đa ~500 KB).";
  if (response.status === 429) return "Bạn thao tác quá nhanh — thử lại sau một lát.";
  return `Không xuất được (mã ${response.status}).`;
}

function filenameFrom(disposition) {
  const match = /filename="?([^";]+)"?/i.exec(disposition || "");
  return match ? match[1] : DEFAULT_FILENAME;
}

async function postViz(data, query = "") {
  const response = await fetch(`${resolveApiBase()}/api/viz/geogebra${query}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ viz: toVizPayload(data) }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response;
}

/**
 * Download the .ggb. Returns the counts the server reports for the file, so the
 * UI can say what actually went in (rather than what we guessed locally).
 */
export async function downloadGgb(data) {
  const response = await postViz(data);
  const blob = await response.blob();
  const filename = filenameFrom(response.headers.get("Content-Disposition"));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return {
    filename,
    objects: Number(response.headers.get("X-DuoMath-Objects")) || null,
    skipped: Number(response.headers.get("X-DuoMath-Skipped")) || 0,
    fileId: response.headers.get("X-DuoMath-File-Id") || "",
  };
}

/** The same construction as GeoGebra input-bar text (for geogebra.org). */
export async function fetchGgbCommands(data) {
  const response = await postViz(data, "?format=commands");
  const body = await response.json();
  return {
    commands: Array.isArray(body?.commands) ? body.commands : [],
    counts: body?.counts || {},
    skipped: Array.isArray(body?.skipped) ? body.skipped : [],
    fileId: body?.id || "",
  };
}
