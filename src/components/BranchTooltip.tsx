import React from "react";
import { Link, Frame, Event } from "../types";


function getLatestEvent(link: Link, frames: Frame[]): Event | null {
  // Link의 source/target이 string이므로 바로 비교!
  for (let i = frames.length - 1; i >= 0; i--) {
    const event = frames[i].events.find(
      e => e.source === link.source && e.target === link.target
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
  const event = getLatestEvent(link, frames);

  // 삼각형 꼬리(툴팁) 스타일 추가
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: (position?.x ?? 80) - 35,  // x좌표 + 오프셋
    top: (position?.y ?? 80) - 5,   // y좌표 + 오프셋
    background: "rgba(255,255,255,0.98)",
    color: "#222",
    padding: "16px 20px 14px 20px",
    borderRadius: 13,
    boxShadow: "0 2px 18px #bbb",
    minWidth: 280,
    maxWidth: 440,
    zIndex: 9999,
    fontSize: "16px",
    pointerEvents: "none",
    transition: "opacity 0.16s",
    border: "1.5px solid #e4e6eb",
    wordBreak: "break-word",
    userSelect: "text"
  };

  if (!event) return (
    <div style={{ ...tooltipStyle, color: "#888" }}>
      <b>이 브랜치에 해당하는 예시가 없습니다.</b>
    </div>
  );

  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: "17px", letterSpacing: 0.5 }}>
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
        <div><span style={{ color: "#5996d6" }}>댓글</span>: {event.comment || <i style={{ color: "#bbb" }}>없음</i>}</div>
        <div style={{ marginTop: 3 }}><span style={{ color: "#e85d48" }}>대댓글</span>: {event.reply || <i style={{ color: "#bbb" }}>없음</i>}</div>
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
