"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
// Type-only import includes MathLive's Window augmentation without loading its JS.
import type {} from "mathlive";
import type { TutorViewport, TutorWorkspaceMode, TutorWorkspaceOptions } from "./types";
import {
  clampChatRatio,
  DEFAULT_CHAT_RATIO,
  layoutForWidth,
  readStoredRatio,
  SPLIT_STORAGE_KEY,
  splitBounds,
} from "./workspaceGeometry";

/** Layout state is intentionally separate from scene parameters and composer state. */
export function useTutorWorkspace({
  canvasAvailable,
  conversationKey,
  activityKey,
  canvasRevealKey,
}: TutorWorkspaceOptions) {
  const rootRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const transcriptContentRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const canvasToggleRef = useRef<HTMLButtonElement>(null);
  const [requestedMode, setRequestedMode] = useState<TutorWorkspaceMode>("split");
  const [viewport, setViewport] = useState<TutorViewport>({
    width: 0, layout: "mobile", keyboardOpen: false, compactPreview: false, minimalViewport: false,
  });
  const [ratio, setRatio] = useState(DEFAULT_CHAT_RATIO);
  const [dragging, setDragging] = useState(false);
  const [hasNewResponse, setHasNewResponse] = useState(false);
  const widthRef = useRef(0);
  const committedRatio = useRef(DEFAULT_CHAT_RATIO);
  const workingRatio = useRef(DEFAULT_CHAT_RATIO);
  const nearBottom = useRef(true);
  const pointerRef = useRef<{ id: number; target: HTMLDivElement; clientX: number; startX: number; startRatio: number } | null>(null);
  const dragFrame = useRef<number | null>(null);
  const focusFrame = useRef<number | null>(null);
  const mode = canvasAvailable ? requestedMode : "collapsed";

  const applyRatio = useCallback((next: number) => {
    const width = widthRef.current;
    if (width < 1024) return next;
    const clamped = clampChatRatio(next, width);
    const pixels = splitBounds(width).available * clamped;
    rootRef.current?.style.setProperty("--tutor-chat-width", `${pixels.toFixed(2)}px`);
    workingRatio.current = clamped;
    return clamped;
  }, []);

  const commitRatio = useCallback((next: number) => {
    const clamped = applyRatio(next);
    committedRatio.current = clamped;
    setRatio(clamped);
    // Storage is a preference, never a requirement for manipulating the layout.
    try { localStorage.setItem(SPLIT_STORAGE_KEY, String(clamped)); } catch { /* private mode */ }
  }, [applyRatio]);

  const stopDrag = useCallback((commit: boolean) => {
    const pointer = pointerRef.current;
    if (!pointer) return;
    if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current);
    dragFrame.current = null;
    // Flush the final pointer coordinate even if pointerup precedes the next frame.
    if (commit && rootRef.current) {
      commitRatio(pointer.startRatio + (pointer.clientX - pointer.startX) / splitBounds(widthRef.current).available);
    } else {
      applyRatio(committedRatio.current);
    }
    pointerRef.current = null;
    if (pointer.target.hasPointerCapture(pointer.id)) pointer.target.releasePointerCapture(pointer.id);
    delete rootRef.current?.dataset.dragging;
    setDragging(false);
  }, [applyRatio, commitRatio]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame: number | null = null;
    let baselineHeight = window.innerHeight;
    let baselineWidth = window.innerWidth;
    let disposed = false;

    try {
      committedRatio.current = readStoredRatio(localStorage.getItem(SPLIT_STORAGE_KEY));
    } catch { /* Use the default split when storage is blocked. */ }

    const measure = () => {
      frame = null;
      if (disposed) return;
      const bounds = root.getBoundingClientRect();
      const width = root.clientWidth;
      widthRef.current = width;
      const layout = layoutForWidth(width);
      const visual = window.visualViewport;
      const editing = Boolean(composerRef.current?.contains(document.activeElement));
      // Browser pinch zoom belongs to the browser, not to the keyboard layout.
      const normalScale = !visual || Math.abs(visual.scale - 1) < 0.02;
      if (normalScale && (!editing || window.innerWidth !== baselineWidth)) {
        baselineHeight = window.innerHeight;
        baselineWidth = window.innerWidth;
      }
      const visibleHeight = visual?.height ?? window.innerHeight;
      const mathKeyboard = window.mathVirtualKeyboard;
      const keyboardRect = mathKeyboard?.visible ? mathKeyboard.boundingRect : null;
      const mathKeyboardOpen = Boolean(keyboardRect && keyboardRect.height > 0);
      const nativeKeyboardOpen = layout !== "desktop" && Math.max(baselineHeight, window.innerHeight) - visibleHeight > 120;
      const keyboardOpen = normalScale && (mathKeyboardOpen || (editing && nativeKeyboardOpen));
      const visibleBottom = Math.min(
        visibleHeight + (visual?.offsetTop ?? 0),
        mathKeyboardOpen && keyboardRect ? keyboardRect.top : Infinity,
      );
      const remainingHeight = Math.max(0, visibleBottom - bounds.top - 4);
      if (keyboardOpen) root.style.setProperty("--tutor-available-height", `${remainingHeight}px`);
      else root.style.removeProperty("--tutor-available-height");
      const compactPreview = keyboardOpen && remainingHeight < 380;
      const minimalViewport = keyboardOpen && remainingHeight < 200;

      if (!pointerRef.current) applyRatio(committedRatio.current);
      setRatio(workingRatio.current);
      setViewport(previous => previous.width === width && previous.layout === layout &&
        previous.keyboardOpen === keyboardOpen && previous.compactPreview === compactPreview && previous.minimalViewport === minimalViewport
        ? previous : { width, layout, keyboardOpen, compactPreview, minimalViewport });
    };
    const scheduleMeasure = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    const onOrientationChange = () => {
      baselineHeight = window.innerHeight;
      scheduleMeasure();
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(root);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("orientationchange", onOrientationChange);
    window.visualViewport?.addEventListener("resize", scheduleMeasure);
    window.visualViewport?.addEventListener("scroll", scheduleMeasure);
    window.addEventListener("bingmath:math-keyboard-resize", scheduleMeasure);
    root.addEventListener("focusin", scheduleMeasure);
    root.addEventListener("focusout", scheduleMeasure);
    scheduleMeasure();
    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", onOrientationChange);
      window.visualViewport?.removeEventListener("resize", scheduleMeasure);
      window.visualViewport?.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("bingmath:math-keyboard-resize", scheduleMeasure);
      root.removeEventListener("focusin", scheduleMeasure);
      root.removeEventListener("focusout", scheduleMeasure);
    };
  }, [applyRatio]);

  useEffect(() => {
    const cancel = () => stopDrag(false);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current);
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    };
  }, [stopDrag]);

  const scrollToLatest = useCallback(() => {
    const scroller = transcriptRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    nearBottom.current = true;
    setHasNewResponse(false);
  }, []);

  const onTranscriptScroll = useCallback(() => {
    const scroller = transcriptRef.current;
    if (!scroller) return;
    nearBottom.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 96;
    if (nearBottom.current) setHasNewResponse(false);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (nearBottom.current) scrollToLatest();
      else setHasNewResponse(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [activityKey, scrollToLatest]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setRequestedMode("split");
      scrollToLatest();
    });
    return () => cancelAnimationFrame(frame);
  }, [conversationKey, scrollToLatest]);

  useEffect(() => {
    if (canvasRevealKey === undefined || canvasRevealKey === null) return;
    const frame = requestAnimationFrame(() => setRequestedMode(current => current === "collapsed" ? "split" : current));
    return () => cancelAnimationFrame(frame);
  }, [canvasRevealKey]);

  useEffect(() => {
    const viewportElement = transcriptRef.current;
    const content = transcriptContentRef.current;
    if (!viewportElement || !content) return;
    let frame: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        if (nearBottom.current) viewportElement.scrollTop = viewportElement.scrollHeight;
      });
    });
    observer.observe(viewportElement);
    observer.observe(content);
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const changeMode = useCallback((next: TutorWorkspaceMode) => {
    stopDrag(false);
    setRequestedMode(next);
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null;
      canvasToggleRef.current?.focus({ preventScroll: true });
    });
  }, [stopDrag]);

  const onDividerPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || widthRef.current < 1024 || mode !== "split") return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = { id: event.pointerId, target: event.currentTarget, clientX: event.clientX, startX: event.clientX, startRatio: workingRatio.current };
    rootRef.current?.setAttribute("data-dragging", "true");
    setDragging(true);
  }, [mode]);

  const onDividerPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!pointerRef.current || event.pointerId !== pointerRef.current.id) return;
    pointerRef.current.clientX = event.clientX;
    if (dragFrame.current !== null) return;
    dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = null;
      if (!pointerRef.current || !rootRef.current) return;
      const pointer = pointerRef.current;
      applyRatio(pointer.startRatio + (pointer.clientX - pointer.startX) / splitBounds(widthRef.current).available);
    });
  }, [applyRatio]);

  const onDividerPointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current?.id !== event.pointerId) return;
    pointerRef.current.clientX = event.clientX;
    stopDrag(true);
  }, [stopDrag]);

  const onDividerKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const bounds = splitBounds(widthRef.current);
    const values: Record<string, number> = {
      ArrowLeft: workingRatio.current - 0.02,
      ArrowRight: workingRatio.current + 0.02,
      Home: bounds.min,
      End: bounds.max,
      Enter: DEFAULT_CHAT_RATIO,
    };
    if (event.key in values) {
      event.preventDefault();
      commitRatio(values[event.key]);
    }
  }, [commitRatio]);

  const onWorkspaceKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.key !== "Escape") return;
    if (pointerRef.current) {
      event.preventDefault();
      stopDrag(false);
    } else if (mode === "expanded") {
      event.preventDefault();
      changeMode("split");
    }
  }, [changeMode, mode, stopDrag]);

  return {
    rootRef, transcriptRef, transcriptContentRef, composerRef, canvasToggleRef,
    mode, viewport, ratio, dragging, hasNewResponse,
    changeMode, scrollToLatest, onTranscriptScroll, onWorkspaceKeyDown,
    divider: {
      onPointerDown: onDividerPointerDown,
      onPointerMove: onDividerPointerMove,
      onPointerUp: onDividerPointerUp,
      onPointerCancel: () => stopDrag(false),
      onLostPointerCapture: () => stopDrag(false),
      onKeyDown: onDividerKeyDown,
      onDoubleClick: () => commitRatio(DEFAULT_CHAT_RATIO),
    },
  };
}
