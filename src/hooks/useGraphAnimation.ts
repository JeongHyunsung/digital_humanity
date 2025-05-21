import { useEffect, useRef, useState } from 'react';
import { Node, Link, Frame } from '../types';

export function useGraphAnimation(frames: Frame[], nodes: Node[], intervalMs: number, isPlaying: boolean) {
  // nodes/frames가 바뀔 때만 전체 갱신
  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes, links: [] });
  const frameIndexRef = useRef(0);
  const allLinksRef = useRef<{ [key: string]: Link }>({});

  // nodes/frames가 바뀔 때만 nodes 갱신 (force-graph가 내부 좌표를 유지할 수 있도록)
  useEffect(() => {
    setGraphData({ nodes, links: [] });
    frameIndexRef.current = 0;
    allLinksRef.current = {};
  }, [nodes, frames]);

  // 프레임 애니메이션 (links만 변경)
  useEffect(() => {
    if (!isPlaying) return;
    if (frames.length === 0) return;

    const interval = setInterval(() => {
      if (frameIndexRef.current === 0) {
        allLinksRef.current = {};
      }

      const i = frameIndexRef.current;
      const frame = frames[i];

      frame.events.forEach(e => {
        const key = `${e.source}|${e.target}`;
        if (!allLinksRef.current[key]) {
          allLinksRef.current[key] = {
            source: e.source,
            target: e.target,
            value: e.time_diff_days,
            isCurrent: false,
            count: 0
          };
        }
        allLinksRef.current[key].count! += 1;
      });

      const currentKeys = frame.events.map(e => `${e.source}|${e.target}`);
      const links = Object.entries(allLinksRef.current).map(([key, link]) => {
        if (currentKeys.includes(key)) {
          return { ...link, isCurrent: true };
        }
        return { ...link, isCurrent: false };
      });

      // nodes는 절대 새로 만들지 말고(=위 useEffect에서만 변경됨), links만 갱신
      setGraphData(prev => ({
        nodes: prev.nodes,
        links
      }));

      frameIndexRef.current = (i - 1 + frames.length) % frames.length;
    }, intervalMs);

    return () => clearInterval(interval);
  }, [frames, intervalMs, isPlaying]); // <-- nodes는 여기 deps에서 빼도 됨

  return { graphData, allLinksRef, frameIndexRef };
}
