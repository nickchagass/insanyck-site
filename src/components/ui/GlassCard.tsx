// INSANYCK MUSEUM-UNIFICATION — Reusable Glass Card Component
// Premium Glassmorphism with specular highlights

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  noSpecular?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  noPadding = false,
  noSpecular = false,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card-museum ${noPadding ? '' : 'p-6'} ${className}`}
      {...motionProps}
    >
      {!noSpecular && (
        <div
          className="absolute top-0 left-[10%] right-[10%] h-px rounded-t-[20px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)'
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
