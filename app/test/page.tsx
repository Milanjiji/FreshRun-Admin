"use client";

import { useState } from "react";

export default function TestPage() {
  const [isHovered, setIsHovered] = useState(false);
  const containerStyle: React.CSSProperties = {
    perspective: 800,
    margin: "0 auto",
  };
  const innerStyle: React.CSSProperties = {
    transformStyle: "preserve-3d",
    transition: "transform 0.5s ease",
    transform: isHovered ? "rotateY(25deg)" : "rotateY(0deg)",
  };
  return (
    <div style={containerStyle}>
      <div
        style={innerStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-64 h-96 bg-surface rounded-xl p-8 shadow-xl flex flex-col items-center justify-center text-center cursor-pointer"
      >
        <h1 className="text-3xl font-bold text-primary">🚀</h1>
        <p className="mt-2 text-lg text-primary">
          3‑D Card Interaction
        </p>
      </div>
    </div>
  );
}