import type { ReactNode } from "react";

export type TutorLayout = "desktop" | "tablet" | "mobile";
export type TutorWorkspaceMode = "split" | "expanded" | "collapsed";

/** Slots keep lesson, composer and renderer state owned by their existing hosts. */
export interface TutorWorkspaceProps {
  children: ReactNode;
  composer: ReactNode;
  canvas: ReactNode;
  canvasTitle?: string;
  canvasAvailable: boolean;
  canvasBusy?: boolean;
  conversationKey?: string | null;
  /** Changes for transcript activity, not for each composer keystroke. */
  activityKey: string | number;
  /** An explicit scene selection reveals a collapsed board without remounting it. */
  canvasRevealKey?: string | number | null;
}

export interface TutorWorkspaceOptions {
  canvasAvailable: boolean;
  conversationKey?: string | null;
  activityKey: string | number;
  canvasRevealKey?: string | number | null;
}

export interface TutorViewport {
  width: number;
  layout: TutorLayout;
  keyboardOpen: boolean;
  compactPreview: boolean;
  minimalViewport: boolean;
}
