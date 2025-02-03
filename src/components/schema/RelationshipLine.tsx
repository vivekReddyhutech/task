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

const RelationshipLine: React.FC<RelationshipLineProps> = ({
  startX = 0,
  startY = 0,
  endX = 200,
  endY = 100,
  isHighlighted = false,
  isDashed = false,
}) => {
  // Calculate the path for the curved line
  const path = `M ${startX} ${startY} C ${startX + (endX - startX) / 2} ${startY}, ${startX + (endX - startX) / 2} ${endY}, ${endX} ${endY}`;

  return (
    <motion.svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        backgroundColor: "transparent",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.path
        d={path}
        fill="none"
        strokeWidth={2}
        stroke={isHighlighted ? "#3b82f6" : "#64748b"}
        strokeDasharray={isDashed ? "5,5" : "none"}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      {/* Arrow head */}
      <motion.circle
        cx={endX}
        cy={endY}
        r={4}
        fill={isHighlighted ? "#3b82f6" : "#64748b"}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      />
    </motion.svg>
  );
};

export default RelationshipLine;
