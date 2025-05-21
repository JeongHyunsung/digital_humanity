export interface Node {
  id: string;
  label?: string;
  group?: string;
}
export interface Link {
  source: string;
  target: string;
  value?: number;
  isCurrent?: boolean;
  count?: number;
}
export interface Event {
  timestamp: number;
  source: string;
  target: string;
  time_diff_days: number;
  comment: string;
  reply: string;
  comment_time: string;
  reply_time: string;
}
export interface Frame {
  timestamp: number;
  events: Event[];
}
export interface GraphData {
  nodes: Node[];
  frames: Frame[];
}
