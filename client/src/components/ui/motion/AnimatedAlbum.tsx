"use client";

import * as React from "react";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const bookmarkVariants: Variants = {
  normal: {
    scaleY: 1,
    originY: 0,
  },
  animate: {
    scaleY: [1.2, 0.8, 1],
    transition: {
      duration: 0.6,
      times: [0.4, 0.7, 1],
      type: "spring",
      stiffness: 300,
      damping: 10,
    },
  },
};

interface AnimatedAlbumProps {
  className?: string;
  isAnimating?: boolean;
}

const AnimatedAlbum = ({ className, isAnimating = false }: AnimatedAlbumProps) => {
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
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <motion.path
          d="M11 3 L11 11 L14 8 L17 11 L17 3"
          variants={bookmarkVariants}
          animate={controls}
          initial="normal"
        />
      </svg>
    </div>
  );
};

export { AnimatedAlbum };
