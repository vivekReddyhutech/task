import React from "react";
import { motion } from "framer-motion";

interface RelationshipLineProps {
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  isHighlighted?: boolean;
  isDashed?: boolean;
}

const RelationshipLine = ({
  startX = 0,
  startY = 0,
  endX = 200,
  endY = 100,
  isHighlighted = false,
  isDashed = false,
}) => {
  const path = `M ${startX} ${startY} L ${endX} ${endY}`;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <path
        d={path}
        fill="none"
        strokeWidth={2}
        stroke={isHighlighted ? "#3b82f6" : "#64748b"}
        strokeDasharray={isDashed ? "5,5" : "none"}
      />
      {/* Arrow head */}
      <circle
        cx={endX}
        cy={endY}
        r={4}
        fill={isHighlighted ? "#3b82f6" : "#64748b"}
      />
    </svg>
  );
};

export default RelationshipLine;
