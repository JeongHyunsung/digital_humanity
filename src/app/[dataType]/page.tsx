"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation"; // <- 요게 핵심!
import { useGraphAnimation } from "../../hooks/useGraphAnimation";
import { getNodeColor, getNodeDegree } from "../../utils/graphUtils";
import BranchTooltip from "../../components/BranchTooltip";
import { Node, GraphData, Link, Frame } from "../../types";
import type { ForceGraphMethods } from "react-force-graph-2d";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function Page() {
  const params = useParams(); // <-- /content, /thema
  // /content → params.dataType === "content"
  // /thema → params.dataType === "thema"
  const dataType = params.dataType as string || "content"; // 디폴트 fallback

  const [fileList, setFileList] = useState<string[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(600);
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  type FGNode = { id?: string | number; x?: number; y?: number; [key: string]: unknown };
  const fgRef = useRef<ForceGraphMethods<FGNode, Link> | undefined>(undefined);

  const { graphData, allLinksRef, frameIndexRef } = useGraphAnimation(
    frames, nodes, intervalMs, isPlaying
  );

  const emotionWeights: { [emotion: string]: number } = {
    "슬픔": 0.28,
    "놀람": 0.39,
    "기대": 0.53,
    "기쁨": 0.56,
    "분노": 1.17,
    "공포": 2.05,
    "신뢰": 2.12,
    "혐오": 9.26,
  };

  useEffect(() => {
    fetch("/data/index.json")
      .then(res => res.json())
      .then(json => {
        if (json && Array.isArray(json[dataType])) {
          setFileList(json[dataType]);
          setFilename(json[dataType][0] || "");
        }
      });
  }, [dataType]);

  useEffect(() => {
    if (!filename) return;
    fetch(`/data/${dataType}/${filename}.json`)
      .then(res => res.json())
      .then((json: GraphData) => {
        setNodes(json.nodes);
        setFrames(json.frames);
      });
  }, [filename, dataType]);

  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      fgRef.current.centerAt(0, 0, 1000);
    }
  }, [nodes.length]);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("center", null);
      fgRef.current.d3Force("charge")?.strength(-500);
      fgRef.current.d3Force("collide")?.radius((node: FGNode) => {
        const degree = getNodeDegree(
          typeof node.id === "string" ? node.id : String(node.id ?? ""),
          allLinksRef.current
        );
        return Math.max(28, Math.pow(degree, 1.2) * 18);
      });
      fgRef.current.d3Force("link")?.strength(0.008);
    }
  }, [graphData.nodes.length, graphData.links.length]);

  useEffect(() => {
    if (!hoveredLink) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hoveredLink]);

  let currentIdx: number | undefined = undefined;
  if (
    typeof frameIndexRef.current === "number" &&
    frameIndexRef.current >= 0 &&
    frameIndexRef.current < frames.length
  ) {
    currentIdx = frameIndexRef.current;
  }

  const totalFrames = frames.length;
  const currentTimestamp =
    currentIdx !== undefined && frames[currentIdx] !== undefined
      ? frames[currentIdx].timestamp
      : undefined;

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      backgroundColor: "#ddd",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* 파일 선택 드롭다운 */}
      <div style={{
        position: "absolute",
        top: 14,
        left: 36,
        zIndex: 2000,
        background: "#fff",
        padding: "8px 18px",
        borderRadius: 10,
        boxShadow: "0 2px 8px #bbb",
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        <label htmlFor="file-selector" style={{ fontWeight: 600, fontSize: 16 }}>
          {dataType === "content" ? "콘텐츠" : "테마"} 데이터셋:
        </label>
        <select
          id="file-selector"
          value={filename}
          onChange={e => setFilename(e.target.value)}
          style={{
            padding: "5px 15px",
            fontSize: 16,
            borderRadius: 7,
            border: "1.5px solid #bbb"
          }}
          disabled={fileList.length === 0}
        >
          {fileList.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        {fileList.length === 0 && (
          <span style={{ color: "#e74c3c", marginLeft: 8, fontWeight: 600 }}>파일 없음</span>
        )}
      </div>
      {/* 이하 동일 */}
      <div style={{
        position: "absolute",
        top: 80,
        left: 34,
        zIndex: 1001,
        display: "flex",
        alignItems: "center",
        gap: 18,
        background: "rgba(250,250,250,0.97)",
        padding: "13px 24px",
        borderRadius: 15,
        boxShadow: "0 2px 12px #ccc",
        pointerEvents: "auto"
      }}>
        <button
          onClick={() => setIsPlaying(p => !p)}
          style={{
            fontSize: 19,
            padding: "9px 30px",
            borderRadius: 13,
            border: "1.5px solid #bbb",
            background: isPlaying ? "#ff6b6b" : "#488bfc",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {isPlaying ? "정지" : "재생"}
        </button>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <label style={{ fontSize: 14, color: "#333", marginBottom: 2 }}>
            속도: {(intervalMs / 1000).toFixed(2)}초/프레임
          </label>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={intervalMs}
            onChange={e => setIntervalMs(Number(e.target.value))}
            style={{ width: 130 }}
          />
        </div>
        <div style={{
          marginLeft: 24, fontSize: 17, color: "#444", minWidth: 120, textAlign: "right",
          display: "flex", flexDirection: "column", alignItems: "flex-end"
        }}>
          <span>
            <b>프레임</b> {totalFrames > 0 && currentIdx !== undefined ? (totalFrames - currentIdx - 1) : 0}/{totalFrames}
          </span>
          {currentTimestamp !== undefined &&
            <span style={{ fontSize: 15, color: "#888" }}>
              <b>{currentTimestamp}일 전</b>
            </span>
          }
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={1.8}
        linkColor={link => link.isCurrent ? "#0076FF" : "rgba(90,90,90,0.2)"}
        linkWidth={link => {
          const l = link as Link;
          return l.isCurrent
            ? 9
            : Math.max(2, Math.min(16, Math.log2((l.count ?? 1) + 1) * 4));
        }}
        linkDirectionalArrowLength={link => {
          const l = link as Link;
          return l.isCurrent ? 22 : Math.max(5, Math.log2((l.count ?? 1) + 1) * 6);
        }}
        linkDirectionalArrowRelPos={0.99}
        linkDirectionalParticles={link => {
          const l = link as Link;
          return l.isCurrent ? 8 : Math.ceil(Math.log2((l.count ?? 1) + 1));
        }}
        linkDirectionalParticleSpeed={link => {
          const l = link as Link;
          return l.isCurrent ? 0.035 : Math.max(0.01, 0.015 / (Math.log2((l.count ?? 1) + 1) + 0.6));
        }}
        nodeCanvasObject={(
          node: { id?: string | number; x?: number; y?: number; [key: string]: unknown },
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const idStr = typeof node.id === "string" ? node.id : String(node.id ?? "");
          const color = getNodeColor({ ...node, id: idStr }, allLinksRef.current);
          const degree = getNodeDegree(idStr, allLinksRef.current);

          const emotion = (node.id || "") as string;
          const weight = emotionWeights[emotion] ?? 1.0;

          const radius = Math.max(12, Math.pow(degree * weight, 0.8) * 6.5);

          console.log(`[NODE] id: ${idStr}, emotion: ${emotion}, degree: ${degree}, weight: ${weight}, radius: ${radius.toFixed(2)}`);

          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.shadowColor = "#bbb";
          ctx.shadowBlur = 7;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.font = `${18 / globalScale}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#222";
          ctx.fillText(idStr, node.x ?? 0, node.y ?? 0);
        }}
        cooldownTicks={400}
        onLinkHover={(l, event) => {
          setHoveredLink(l as Link | null);
          if (event) setMousePos({ x: event.clientX, y: event.clientY });
          if (!l) setMousePos(null);
        }}
        onNodeHover={() => setHoveredLink(null)}
        onBackgroundClick={() => setHoveredLink(null)}
      />
      {hoveredLink && mousePos && (
        <BranchTooltip link={hoveredLink} frames={frames} position={mousePos} />
      )}
    </div>
  );
}
