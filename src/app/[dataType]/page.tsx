"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useGraphAnimation } from "../../hooks/useGraphAnimation";
import { getNodeColor, getNodeDegree } from "../../utils/graphUtils";
import BranchTooltip from "../../components/BranchTooltip";
import { Node, GraphData, Link, Frame } from "../../types";
import type { ForceGraphMethods } from "react-force-graph-2d";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function Page() {
  const params = useParams();
  const dataType = params.dataType as string || "content";

  const [fileList, setFileList] = useState<string[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(600);
  const [normalizeOn, setNormalizeOn] = useState<boolean>(true);
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  type FGNode = { id?: string | number; x?: number; y?: number; [key: string]: unknown };
  const fgRef = useRef<ForceGraphMethods<FGNode, Link> | undefined>(undefined);

  const [chargeStrength, setChargeStrength] = useState(-600);
  const [linkStrengthBase, setLinkStrengthBase] = useState(0.007);

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
      fgRef.current.d3Force("charge")?.strength(chargeStrength);
      fgRef.current.d3Force("collide")?.radius((node: FGNode) => {
        const degree = getNodeDegree(
          typeof node.id === "string" ? node.id : String(node.id ?? ""),
          allLinksRef.current
        );
        return Math.max(28, Math.pow(degree, 1.2) * 18);
      });
      fgRef.current.d3Force("link")?.strength((link: Link)=> {
        const src = typeof link.source === "object" ? link.source.id : link.source;
        const tgt = typeof link.target === "object" ? link.target.id : link.target;
        const w1 = normalizeOn ? (emotionWeights[src as string] ?? 1.0) : 1.0;
        const w2 = normalizeOn ? (emotionWeights[tgt as string] ?? 1.0) : 1.0;
        return linkStrengthBase * w1 * w2;
      });
    }
  }, [graphData.nodes.length, graphData.links.length, normalizeOn, linkStrengthBase, chargeStrength]);

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
    <div className="w-full h-screen bg-gray-50 relative overflow-hidden text-gray-800">
      {/* 상단 컨트롤 패널 */}
      <div className="absolute top-4 left-4 right-4 z-50 bg-white px-6 py-4 rounded-2xl shadow-md flex flex-wrap items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="file-selector" className="font-medium text-sm text-gray-700">
            {dataType === "content" ? "콘텐츠" : "테마"}:
          </label>
          <select
            id="file-selector"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={fileList.length === 0}
          >
            {fileList.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setNormalizeOn(p => !p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              normalizeOn
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Normalize: {normalizeOn ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isPlaying
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isPlaying ? "⏸ 정지" : "▶ 재생"}
          </button>
          <button
            onClick={() => setSettingsOpen(o => !o)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition border border-gray-200"
          >
            {settingsOpen ? "✕ 설정 닫기" : "⚙ 설정 열기"}
          </button>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="text-sm font-medium text-gray-700">
            프레임:{" "}
            {totalFrames > 0 && currentIdx !== undefined
              ? `${totalFrames - currentIdx - 1}/${totalFrames}`
              : `0/${totalFrames}`}
          </span>
          {currentTimestamp !== undefined && (
            <span className="text-xs text-gray-500">
              {currentTimestamp}일 전
            </span>
          )}
        </div>
      </div>

      {/* 설정창 */}
      {settingsOpen && (
        <div className="absolute top-20 left-4 right-4 z-40 bg-white px-8 py-6 rounded-2xl shadow-md flex flex-wrap gap-8 justify-between items-start w-full sm:w-[calc(100%-2rem)] max-w-3xl mx-auto">
          <div className="flex flex-col items-start w-1/3">
            <label className="text-sm text-gray-700 mb-2">
              속도: <span className="font-semibold">{(intervalMs / 1000).toFixed(2)}초/프레임</span>
            </label>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={intervalMs}
              onChange={e => setIntervalMs(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="flex flex-col space-y-4 w-1/3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                밀어내는 힘: <span className="font-medium">{chargeStrength}</span>
              </label>
              <input
                type="range"
                min={-2000}
                max={0}
                step={50}
                value={chargeStrength}
                onChange={e => setChargeStrength(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                당기는 힘: <span className="font-medium">{linkStrengthBase.toFixed(3)}</span>
              </label>
              <input
                type="range"
                min={0.001}
                max={0.05}
                step={0.001}
                value={linkStrengthBase}
                onChange={e => setLinkStrengthBase(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ForceGraph2D 및 툴팁 */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={1.8}
        linkColor={link => link.isCurrent ? "rgba(0, 112, 244, 0.7)" : "rgba(100,100,100,0.2)"}
        linkWidth={link => {
          const l = link as Link;
          const src = typeof l.source === "object" ? l.source.id : l.source;
          const tgt = typeof l.target === "object" ? l.target.id : l.target;
          const sNode = nodes.find(n => n.id === src);
          const tNode = nodes.find(n => n.id === tgt);
          const se = (sNode?.id || "") as string;
          const te = (tNode?.id || "") as string;
          const w1 = normalizeOn ? (emotionWeights[se] ?? 1.0) : 1.0;
          const w2 = normalizeOn ? (emotionWeights[te] ?? 1.0) : 1.0;
          const weight = Math.sqrt(w1 * w2);
          const base = l.isCurrent ? 10 : Math.max(3, Math.min(18, Math.log2((l.count ?? 1) + 1) * 4));
          return base * weight;
        }}
        linkDirectionalParticles={link => Math.ceil(Math.log2((link.count ?? 1) + 1))}
        linkDirectionalParticleSpeed={link => {
          const l = link as Link;
          const src = typeof l.source === "object" ? l.source.id : l.source;
          const tgt = typeof l.target === "object" ? l.target.id : l.target;
          const sNode = nodes.find(n => n.id === src);
          const tNode = nodes.find(n => n.id === tgt);
          const se = (sNode?.id || "") as string;
          const te = (tNode?.id || "") as string;
          const w1 = normalizeOn ? (emotionWeights[se] ?? 1.0) : 1.0;
          const w2 = normalizeOn ? (emotionWeights[te] ?? 1.0) : 1.0;
          const weight = w1 * w2;
          return 0.0006 * weight * Math.sqrt(l.count ?? 0);
        }}
        linkDirectionalParticleWidth={() => 5}
        linkDirectionalParticleColor={() => "rgba(0, 112, 244, 0.9)"}
        linkDirectionalArrowLength={link => link.isCurrent ? 24 : Math.max(6, Math.log2((link.count ?? 1) + 1) * 5)}
        linkDirectionalArrowRelPos={0.99}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const idStr = typeof node.id === "string" ? node.id : String(node.id ?? "");
          const color = getNodeColor({ ...node, id: idStr }, allLinksRef.current);
          const degree = getNodeDegree(idStr, allLinksRef.current);
          const emotion = (node.id || "") as string;
          const weight = normalizeOn ? (emotionWeights[emotion] ?? 1.0) : 1.0;
          const radius = Math.max(12, Math.pow(degree * weight, 0.8) * 7);

          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.font = `${18 / globalScale}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#1f2937";
          ctx.fillText(idStr, node.x ?? 0, node.y ?? 0);
        }}
        cooldownTicks={400}
        onLinkHover={(l, e) => {
          setHoveredLink(l as Link | null);
          if (e) setMousePos({ x: e.clientX, y: e.clientY });
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
