"use client";

import * as React from "react";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const mergingVariants: Variants = {
  normal: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  animate: {
    x: -8,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

const mainSwatchVariants: Variants = {
  normal: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  animate: {
    x: 4,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

interface AnimatedSwatchBookProps {
  className?: string;
  isAnimating?: boolean;
}

const AnimatedSwatchBook = ({ className, isAnimating = false }: AnimatedSwatchBookProps) => {
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
        {/* Main vertical swatch that stays */}
        <motion.path
          d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z"
          variants={mainSwatchVariants}
          animate={controls}
        />
        <motion.path
          d="M 7 17h.01"
          variants={mainSwatchVariants}
          animate={controls}
        />

        {/* Parts that merge into the main swatch */}
        <motion.path
          d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7"
          variants={mergingVariants}
          animate={controls}
        />
        <motion.path
          d="m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8"
          variants={mergingVariants}
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { AnimatedSwatchBook };
