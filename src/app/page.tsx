'use client';

import Link from "next/link";

export default function EmotionHomePage() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 32 }}>
        🧠 감정 전파 그래프 시각화
      </h1>
      <div style={{ display: "flex", gap: 30 }}>
        <Link href="/content">
          <button style={{
            fontSize: 20, padding: "18px 44px", borderRadius: 14,
            background: "#488bfc", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer"
          }}>
            콘텐츠별 시각화
          </button>
        </Link>
        <Link href="/thema">
          <button style={{
            fontSize: 20, padding: "18px 44px", borderRadius: 14,
            background: "#ffbc42", color: "#333", fontWeight: 700, border: "none", cursor: "pointer"
          }}>
            테마별 시각화
          </button>
        </Link>
      </div>
    </main>
  );
}
