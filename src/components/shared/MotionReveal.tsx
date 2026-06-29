"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type MotionRevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
};

export function MotionReveal({
  children,
  delay = 0,
  className,
  ...props
}: MotionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
