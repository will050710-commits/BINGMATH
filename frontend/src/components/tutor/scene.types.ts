/** The existing mathviz.v1 envelope remains owned by the renderer contract. */
export interface MathVizData {
  type: "mathviz.v1";
  widget: string;
  title?: string;
  [property: string]: unknown;
}

export interface TutorMessage {
  id: string | number;
  role: string;
  content?: string;
  type?: string;
  [property: string]: unknown;
}

export interface TutorScene {
  id: string;
  messageId: TutorMessage["id"];
  title: string;
  /** Original immutable reply, also used for memoization across new turns. */
  source: string;
  data: MathVizData;
}

export interface ParsedTutorMessage extends TutorMessage {
  cleanContent: string;
  scene: TutorScene | null;
}
