import React from 'react';
import { motion } from 'framer-motion';

const LoadingDots = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-3 h-3 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            backgroundColor: [
              '#06b6d4', // cyan
              '#3b82f6', // blue
              '#8b5cf6', // purple
              '#ec4899', // pink
              '#f59e0b', // amber
              '#10b981'  // emerald
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;
