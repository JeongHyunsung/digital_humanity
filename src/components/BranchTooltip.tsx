import React from "react";
import { Link, Frame, Event } from "../types";

// 한쪽 방향만 이벤트 반환
function getLatestEvent(
  from: { id: string | number } | string,
  to: { id: string | number } | string,
  frames: Frame[]
): Event | null {
  // 타입가드로 id 추출 (string이면 그대로, Node면 .id)
  const fromId = typeof from === "string" || typeof from === "number" ? from : from.id;
  const toId = typeof to === "string" || typeof to === "number" ? to : to.id;

  for (let i = frames.length - 1; i >= 0; i--) {
    const event = frames[i].events.find(
      e => e.source === fromId && e.target === toId
    );
    if (event) return event;
  }
  return null;
}


type Props = {
  link: Link;
  frames: Frame[];
  position?: { x: number; y: number };
};

const BranchTooltip = ({ link, frames, position }: Props) => {
  // 양방향 모두 event 찾기
  const eventForward = getLatestEvent(link.source, link.target, frames); // source→target
  const eventReverse = getLatestEvent(link.target, link.source, frames); // target→source

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: (position?.x ?? 80) - 35,
    top: (position?.y ?? 80) - 5,
    background: "rgba(255,255,255,0.98)",
    color: "#222",
    padding: "16px 20px 14px 20px",
    borderRadius: 13,
    boxShadow: "0 2px 18px #bbb",
    minWidth: 380,
    maxWidth: 600,
    zIndex: 9999,
    fontSize: "16px",
    pointerEvents: "none",
    transition: "opacity 0.16s",
    border: "1.5px solid #e4e6eb",
    wordBreak: "break-word",
    userSelect: "text"
  };

  // 양쪽 모두 예시 없을 때
  if (!eventForward && !eventReverse) {
    return (
      <div style={{ ...tooltipStyle, color: "#888" }}>
        <b>이 브랜치(양방향)에 해당하는 예시가 없습니다.</b>
      </div>
    );
  }

  // 이벤트 카드 UI 컴포넌트
  function EventCard({ event, direction }: { event: Event | null; direction: "forward" | "reverse" }) {
    if (!event) {
      return (
        <div style={{
          opacity: 0.65,
          color: "#aaa",
          textAlign: "center",
          padding: 10
        }}>
          <div style={{ fontWeight: 700, marginBottom: 7, fontSize: 17, letterSpacing: 0.5 }}>
            {direction === "forward"
              ? `${link.source} → ${link.target}`
              : `${link.target} → ${link.source}`
            }
          </div>
          <div>예시 없음</div>
        </div>
      );
    }
    return (
      <div>
        <div style={{ fontWeight: 700, marginBottom: 7, fontSize: 17, letterSpacing: 0.5 }}>
          {event.source} <span style={{ color: "#bbb" }}>→</span> {event.target}
        </div>
        <div style={{
          margin: "8px 0 8px 0",
          background: "#f6f7fb",
          padding: "10px 13px",
          borderRadius: 8,
          fontSize: "15px",
          lineHeight: 1.65,
          color: "#262626"
        }}>
          <div>
            <span style={{ color: "#5996d6" }}>댓글</span>: {event.comment || <i style={{ color: "#bbb" }}>없음</i>}
          </div>
          <div style={{ marginTop: 3 }}>
            <span style={{ color: "#e85d48" }}>대댓글</span>: {event.reply || <i style={{ color: "#bbb" }}>없음</i>}
          </div>
        </div>
        <div style={{
          fontSize: "13px",
          color: "#999",
          marginBottom: 3,
          marginLeft: 1
        }}>
          댓글 시각: <b>{event.comment_time}</b> / 대댓글 시각: <b>{event.reply_time}</b>
        </div>
        <div style={{
          fontSize: "12px",
          color: "#bbb",
          marginLeft: 1
        }}>
          (가장 최근 예시)
        </div>
      </div>
    );
  }

  // 양쪽 컬럼을 Flex로 반반 배치
  return (
    <div style={tooltipStyle}>
      <div style={{ display: "flex", flexDirection: "row", gap: 26 }}>
        {/* Forward (왼쪽) */}
        <div style={{ flex: 1, borderRight: "1px solid #ececec", paddingRight: 10, minWidth: 160 }}>
          <EventCard event={eventForward} direction="forward" />
        </div>
        {/* Reverse (오른쪽) */}
        <div style={{ flex: 1, paddingLeft: 10, minWidth: 160 }}>
          <EventCard event={eventReverse} direction="reverse" />
        </div>
      </div>
      {/* 꼬리(삼각형) */}
      <div style={{
        position: "absolute",
        left: 28,
        top: -13,
        width: 0, height: 0,
        borderLeft: "13px solid transparent",
        borderRight: "13px solid transparent",
        borderBottom: "13px solid rgba(255,255,255,0.98)",
        filter: "drop-shadow(0px -2px 6px #ccc)"
      }} />
    </div>
  );
};

export default BranchTooltip;
