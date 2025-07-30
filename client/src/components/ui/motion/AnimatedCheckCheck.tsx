"use client";

import * as React from "react";
import { motion, useAnimation } from "motion/react";
import type { Variants } from "motion/react";

interface AnimatedCheckCheckProps {
  className?: string;
  isAnimating?: boolean;
}

const checkVariants: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const AnimatedCheckCheck = ({ className, isAnimating = false }: AnimatedCheckCheckProps) => {
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
        <motion.path
          d="M18 6 7 17l-5-5"
          variants={checkVariants}
          animate={controls}
          initial="normal"
          custom={0}
        />
        <motion.path
          d="m22 10-7.5 7.5L13 16"
          variants={checkVariants}
          animate={controls}
          initial="normal"
          custom={1}
        />
      </svg>
    </div>
  );
};

export { AnimatedCheckCheck }; 