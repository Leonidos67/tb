"use client";

import * as React from "react";
import { motion, useAnimation } from "motion/react";
import type { Variants } from "motion/react";

const bookmarkVariants: Variants = {
  normal: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  animate: {
    y: -4,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
      mass: 1,
    },
  },
};

interface AnimatedBookMarkedProps {
  className?: string;
  isAnimating?: boolean;
}

const AnimatedBookMarked = ({ className, isAnimating = false }: AnimatedBookMarkedProps) => {
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
        {/* Bouncing bookmark */}
        <motion.path
          d="M10 2v8l3-3 3 3V2"
          variants={bookmarkVariants}
          animate={controls}
          initial="normal"
        />
        {/* Static book part */}
        <motion.path
          d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
          animate={controls}
          initial="normal"
        />
      </svg>
    </div>
  );
};

export { AnimatedBookMarked };
