"use client";

import dynamic from "next/dynamic";
import { Component, memo, type ErrorInfo, type ReactNode } from "react";
import type { TutorScene } from "./scene.types";

// Both the dispatcher and its individual engines remain code-split. An empty
// conversation does not mount this import; MathLive has its own composer split.
const MathVizRenderer = dynamic(() => import("@/components/DuoMCB/mathviz/MathVizRenderer"), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-slate-300" role="status">Đang tải bảng minh họa…</p>,
});

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; attempt: number }> {
  state = { failed: false, attempt: 0 };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[TutorWorkspace] renderer failed", error.message, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="m-4 rounded-xl border border-amber-400/30 p-4 text-sm text-amber-100" role="alert">
          <p>Chưa hiển thị được hình này. Nội dung hội thoại và bản nháp vẫn được giữ.</p>
          <button type="button" className="mt-3 min-h-11 rounded-lg border border-amber-300/40 px-3 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => this.setState(({ attempt }) => ({ failed: false, attempt: attempt + 1 }))}>
            Thử dựng lại
          </button>
        </div>
      );
    }
    return <div key={this.state.attempt}>{this.props.children}</div>;
  }
}

const SUPPORTED_WIDGETS = new Set([
  "function_plot", "unit_circle_wave", "geometry_2d", "geometry_3d",
  "inequality_region", "venn_sets", "sequence_series", "complex_plane", "distribution",
]);

/**
 * Exactly one active scene. Layout modes never change this node's key or parent.
 * Selecting another scene intentionally starts that scene's renderer; restoring
 * arbitrary historical engine state is outside Phase A's persistence contract.
 */
export const MathCanvasHost = memo(function MathCanvasHost({ scene }: { scene: TutorScene | null }) {
  if (!scene) return null;
  if (!SUPPORTED_WIDGETS.has(scene.data.widget)) {
    return <p className="p-4 text-sm text-amber-200" role="status">Loại hình này chưa được hỗ trợ. Em vẫn có thể tiếp tục trao đổi trong hội thoại.</p>;
  }
  return (
    <div data-testid="math-canvas-renderer" data-scene-id={scene.id} className="min-w-0">
      <CanvasErrorBoundary key={`${scene.id}:${scene.source}`}>
        <MathVizRenderer data={scene.data} />
      </CanvasErrorBoundary>
    </div>
  );
}, (previous, next) => previous.scene?.id === next.scene?.id && previous.scene?.source === next.scene?.source);
