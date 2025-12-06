"use client"

import { motion } from "framer-motion"

interface AnimatedLoadingDotsProps {
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
}

const dotVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export function AnimatedLoadingDots({
  size = "md",
}: AnimatedLoadingDotsProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-1"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`rounded-full bg-primary ${sizeClasses[size]}`}
          variants={dotVariants}
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </motion.div>
  )
}
