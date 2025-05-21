// components/GraphInfoPanel.tsx
import React from "react";
import { Frame } from "../types";

type Props = {
  frames: Frame[];
  frameIndex: number;
};

const GraphInfoPanel = ({ frames, frameIndex }: Props) => (
  <div style={{
    position: "absolute", top: 20, left: 20, color: "#333",
    fontSize: "18px", background: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: "8px"
  }}>
    ⏳ Frame Time: {frames[frameIndex]?.timestamp ?? "Loading..."}
  </div>
);

export default GraphInfoPanel;
