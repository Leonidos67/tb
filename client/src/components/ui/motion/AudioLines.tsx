"use client";

import { motion, useAnimation } from "motion/react";
import type { Variants } from "motion/react";
import { useEffect } from "react";

interface AudioLinesProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
  isAnimating?: boolean;
}

const lineVariants: Variants = {
  normal: {
    scaleY: 0.5,
    opacity: 0.5,
  },
  animate: {
    scaleY: [0.5, 1, 0.5],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const AudioLines = ({
  width = 20,
  height = 20,
  strokeWidth = 2,
  stroke = "currentColor",
  isAnimating = false,
  ...props
}: AudioLinesProps) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(isAnimating ? "animate" : "normal");
  }, [controls, isAnimating]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g
        variants={lineVariants}
        animate={controls}
        initial="normal"
        style={{ originY: 0.5 }}
      >
        <motion.path d="M2 10v3" />
        <motion.path d="M6 6v11" />
        <motion.path d="M10 3v18" />
        <motion.path d="M14 8v7" />
        <motion.path d="M18 5v13" />
        <motion.path d="M22 10v3" />
      </motion.g>
    </svg>
  );
};

export { AudioLines };


