"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ChevronDown, Expand, Minimize2, PanelRightClose, PanelsTopLeft } from "lucide-react";
import type { TutorWorkspaceProps } from "./types";
import { useTutorWorkspace } from "./useTutorWorkspace";
import { splitBounds } from "./workspaceGeometry";
import styles from "./TutorWorkspace.module.css";

const PANEL_SPRING = { type: "spring" as const, stiffness: 300, damping: 32, mass: 1 };

/** A single persistent canvas slot, with layout state isolated from its renderer. */
export default function TutorWorkspace({
  children,
  composer,
  canvas,
  canvasTitle = "Bảng minh họa",
  canvasAvailable,
  canvasBusy = false,
  conversationKey,
  activityKey,
  canvasRevealKey,
}: TutorWorkspaceProps) {
  const id = useId();
  const canvasId = `tutor-canvas-${id}`;
  const transcriptId = `tutor-transcript-${id}`;
  const reducedMotion = useReducedMotion();
  const {
    rootRef, transcriptRef, transcriptContentRef, composerRef, canvasToggleRef,
    mode, viewport, ratio, dragging, hasNewResponse, changeMode,
    scrollToLatest, onTranscriptScroll, onWorkspaceKeyDown, divider,
  } = useTutorWorkspace({ canvasAvailable, conversationKey, activityKey, canvasRevealKey });
  const collapsed = mode === "collapsed";
  const expanded = mode === "expanded";
  const canvasHidden = collapsed || viewport.minimalViewport || (viewport.keyboardOpen && viewport.compactPreview);
  const bounds = splitBounds(Math.max(1024, viewport.width));
  const toggleLabel = collapsed ? "Mở bảng minh họa" : expanded ? "Thu nhỏ bảng minh họa" : "Phóng lớn bảng minh họa";
  const toggleMode = () => changeMode(collapsed || expanded ? "split" : "expanded");

  return (
    <div
      ref={rootRef}
      className={`${styles.workspace} relative min-h-0 min-w-0 flex-1`}
      data-testid="tutor-workspace"
      data-layout={viewport.layout}
      data-mode={mode}
      data-keyboard={viewport.keyboardOpen ? "open" : "closed"}
      data-compact-preview={viewport.compactPreview ? "true" : "false"}
      data-minimal-viewport={viewport.minimalViewport ? "true" : "false"}
      onKeyDown={onWorkspaceKeyDown}
    >
      <div className={styles.grid}>
        <motion.section
          className={`${styles.canvasPanel} min-h-0 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#10151e]`}
          data-testid="tutor-canvas-panel"
          aria-label="Bảng minh họa toán học"
          aria-hidden={viewport.minimalViewport}
          inert={viewport.minimalViewport}
          layout={reducedMotion || dragging ? false : "position"}
          layoutId={`tutor-canvas-surface-${id}`}
          transition={reducedMotion ? { duration: 0 } : PANEL_SPRING}
        >
          <header className="flex h-12 min-h-12 items-center gap-2 border-b border-white/10 px-3">
            <PanelsTopLeft size={17} className="shrink-0 text-sky-300" aria-hidden="true" />
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100" title={canvasTitle}>
              {canvasTitle}
            </h2>
            {canvasBusy && (
              <span role="status" className={`${styles.status} shrink-0 text-xs text-slate-400`}>
                <span className={styles.statusDot} aria-hidden="true" /> Đang xử lý
              </span>
            )}
            <motion.button
              ref={canvasToggleRef}
              type="button"
              className={styles.toolButton}
              aria-label={toggleLabel}
              title={toggleLabel}
              aria-controls={canvasId}
              aria-expanded={!collapsed}
              disabled={!canvasAvailable}
              onClick={toggleMode}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32, mass: 1 }}
            >
              {collapsed ? <ChevronDown size={18} aria-hidden="true" /> : expanded ? <Minimize2 size={18} aria-hidden="true" /> : <Expand size={18} aria-hidden="true" />}
              {collapsed && <span className="text-xs">Mở hình</span>}
            </motion.button>
            <button
              type="button"
              className={styles.toolButton}
              aria-label="Đóng bảng minh họa"
              title="Đóng bảng minh họa"
              hidden={collapsed}
              onClick={() => changeMode("collapsed")}
            >
              <PanelRightClose size={18} aria-hidden="true" />
            </button>
          </header>
          {/* This node and its canvas child never move or unmount for layout changes. */}
          <div
            id={canvasId}
            data-testid="tutor-canvas-content"
            className={styles.canvasContent}
            aria-hidden={canvasHidden}
            inert={canvasHidden}
          >
            {canvas}
          </div>
        </motion.section>

        <div
          className={styles.divider}
          data-testid="tutor-divider"
          role="separator"
          aria-label="Điều chỉnh độ rộng hội thoại"
          aria-orientation="vertical"
          aria-controls={transcriptId}
          aria-valuemin={Math.round(bounds.min * 100)}
          aria-valuemax={Math.round(bounds.max * 100)}
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuetext={`Hội thoại ${Math.round(ratio * 100)} phần trăm`}
          tabIndex={viewport.layout === "desktop" && mode === "split" ? 0 : -1}
          title="Kéo hoặc dùng phím mũi tên để điều chỉnh; Enter để đặt lại"
          {...divider}
        >
          <span aria-hidden="true" />
        </div>

        <section className={`${styles.conversation} min-h-0 min-w-0`} aria-label="Hội thoại cùng gia sư">
          <div className={styles.transcriptShell} aria-hidden={expanded} inert={expanded}>
            <div
              ref={transcriptRef}
              id={transcriptId}
              className={styles.transcript}
              data-testid="tutor-transcript"
              onScroll={onTranscriptScroll}
              tabIndex={0}
              aria-label="Lịch sử hội thoại"
            >
              <div ref={transcriptContentRef} className="min-w-0">{children}</div>
            </div>
            {hasNewResponse && (
              <motion.button
                type="button"
                className={styles.newResponse}
                data-testid="tutor-new-response"
                aria-label="Xem phản hồi mới"
                onClick={scrollToLatest}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0.1 : 0.16 }}
              >
                <ArrowDown size={15} aria-hidden="true" /> Có phản hồi mới
              </motion.button>
            )}
          </div>
          <div ref={composerRef} className={styles.composer} data-testid="tutor-composer">
            {expanded && (
              <button type="button" className={styles.returnToChat} onClick={() => changeMode("split")}>
                <Minimize2 size={14} aria-hidden="true" /> Xem lại câu hỏi và hội thoại
              </button>
            )}
            {composer}
          </div>
        </section>
      </div>
    </div>
  );
}
