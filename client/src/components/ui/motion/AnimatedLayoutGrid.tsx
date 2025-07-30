"use client";

import * as React from "react";
import { motion, useAnimation } from "motion/react";
import type { Variants } from "motion/react";

const boxVariants: Variants = {
  normal: () => ({
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  }),
  animate: (i: number) => {
    // Calculate new positions for clockwise rotation
    const positions = [
      { x: 11, y: 0 }, // Top left moves right
      { x: 0, y: 11 }, // Top right moves down
      { x: -11, y: 0 }, // Bottom right moves left
      { x: 0, y: -11 }, // Bottom left moves up
    ];
    return {
      ...positions[i],
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    };
  },
};

interface AnimatedLayoutGridProps {
  className?: string;
  isAnimating?: boolean;
}

const AnimatedLayoutGrid = ({ className, isAnimating = false }: AnimatedLayoutGridProps) => {
  const controls = useAnimation();

  React.useEffect(() => {
    if (isAnimating) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isAnimating, controls]);

  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <motion.rect
          width="7"
          height="7"
          x="3"
          y="3"
          rx="1"
          variants={boxVariants}
          animate={controls}
          initial="normal"
          custom={0}
        />
        <motion.rect
          width="7"
          height="7"
          x="14"
          y="3"
          rx="1"
          variants={boxVariants}
          animate={controls}
          initial="normal"
          custom={1}
        />
        <motion.rect
          width="7"
          height="7"
          x="14"
          y="14"
          rx="1"
          variants={boxVariants}
          animate={controls}
          initial="normal"
          custom={2}
        />
        <motion.rect
          width="7"
          height="7"
          x="3"
          y="14"
          rx="1"
          variants={boxVariants}
          animate={controls}
          initial="normal"
          custom={3}
        />
      </svg>
    </div>
  );
};

export { AnimatedLayoutGrid }; 