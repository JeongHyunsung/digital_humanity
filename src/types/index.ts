export interface Node {
  id: string | number;
  label?: string;
  group?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  [others: string]: any;
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
