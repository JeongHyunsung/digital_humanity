'use client';

import Link from "next/link";

export default function EmotionHomePage() {
  return (
    <main style={{
      display: "flex",
      height: "100vh",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      fontFamily: "sans-serif"
    }}>
      <Link href="/content" style={{ flex: 1 }}>
        <div className="card content-card">
          <div className="overlay">
            <span>📊 콘텐츠별 시각화</span>
            <p>댓글과 대댓글의 감정 흐름을 콘텐츠 단위로 확인해보세요.</p>
          </div>
        </div>
      </Link>

      <Link href="/thema" style={{ flex: 1 }}>
        <div className="card thema-card">
          <div className="overlay">
            <span>🎨 테마별 시각화</span>
            <p>영상의 성격 별로 감정 전염 양상을 비교해 보세요.</p>
          </div>
        </div>
      </Link>

      <style jsx>{`
        .card {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.4s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .overlay {
          color: white;
          text-align: center;
          z-index: 2;
          transition: transform 0.4s ease;
        }

        .overlay span {
          font-size: 30px;
          font-weight: bold;
        }

        .overlay p {
          opacity: 0;
          font-size: 16px;
          margin-top: 10px;
          transition: opacity 0.4s ease, transform 0.4s ease;
          transform: translateY(20px);
        }

        .card:hover .overlay p {
          opacity: 1;
          transform: translateY(0);
        }

        .card:hover {
          transform: scale(1.02);
          z-index: 2;
        }

        .content-card {
          background: linear-gradient(to right, #1e3a8a, #3b82f6); /* Deep Blue */
        }

        .thema-card {
          background: 	linear-gradient(to left, #8e44ad, #c39bd3); /* Soft Peach */
        }

        @media (max-width: 768px) {
          main {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
