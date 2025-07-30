"use client";

import * as React from "react";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

interface AnimatedFoldersProps {
  className?: string;
  isAnimating?: boolean;
}

const folderVariants: Variants = {
  normal: {
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  animate: {
    x: -4,
    y: 2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

const bottomLineVariants: Variants = {
  normal: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  animate: {
    opacity: 0,
    x: 4,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      opacity: { duration: 0.1 },
    },
  },
};

const AnimatedFolders = ({ className, isAnimating = false }: AnimatedFoldersProps) => {
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
        {/* Main folder */}
        <motion.path
          d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.69-.9l-.81-1.2a2 2 0 0 0-1.67-.9H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"
          variants={folderVariants}
          animate={controls}
        />
        {/* Bottom line that fades away */}
        <motion.path
          d="M2 8v11a2 2 0 0 0 2 2h14"
          variants={bottomLineVariants}
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { AnimatedFolders }; 