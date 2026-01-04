// INSANYCK GOD TIER — GlassCard "Vault Edition"
// Premium Glassmorphism with physical depth, spotlight, corner prism, floor reflection
"use client";

import { ReactNode, useRef, useState, useCallback } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  noSpecular?: boolean;      // Disable top specular wire
  noSpotlight?: boolean;     // Disable museum spotlight
  noCornerPrism?: boolean;   // Disable corner light refraction
  noFloorReflection?: boolean; // Disable floor reflection
  noMouseGlow?: boolean;     // Disable mouse-follow illumination
  noInnerBevel?: boolean;    // Disable diamond-cut inner shadows
  spotlightIntensity?: number;
  specularIntensity?: number;
  prismIntensity?: number;
  reflectionIntensity?: number;
  variant?: 'default' | 'sidebar' | 'panel' | 'card';
  size?: 'sm' | 'md' | 'lg';
}

// ══════════════════════════════════════════════════════════════
// CONSTANTS — Physical Material Properties
// ══════════════════════════════════════════════════════════════

const GLASS_PHYSICS = {
  tint: 'rgba(255, 255, 255, 0.018)',
  tintHover: 'rgba(255, 255, 255, 0.028)',
  borderBase: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.14)',
  specularPeak: 'rgba(255, 255, 255, 0.85)',
  specularMid: 'rgba(255, 255, 255, 0.45)',
  specularGlow: 'rgba(255, 255, 255, 0.25)',
  spotlightColor: '255, 255, 255',
  spotlightAlpha: 0.12,
  spotlightAlphaHover: 0.18,
  prismAlpha: 0.15,
  prismAlphaTop: 0.22,
  prismSize: '100px',
  reflectionAlpha: 0.08,
  reflectionHeight: '40%',
  mouseGlowSize: 300,
  mouseGlowAlpha: 0.08,
  bevelHighlight: 'rgba(255, 255, 255, 0.06)',
  bevelShadow: 'rgba(0, 0, 0, 0.25)',
  radiusSm: '14px',
  radiusMd: '20px',
  radiusLg: '24px',
} as const;

export default function GlassCard({
  children,
  className = '',
  noPadding = false,
  noSpecular = false,
  noSpotlight = false,
  noCornerPrism = false,
  noFloorReflection = false,
  noMouseGlow = false,
  noInnerBevel = false,
  spotlightIntensity = 1,
  specularIntensity = 1,
  prismIntensity = 1,
  reflectionIntensity = 1,
  variant = 'default',
  size = 'md',
  ...motionProps
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (noMouseGlow || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  }, [noMouseGlow]);

  const getRadius = () => {
    switch (size) {
      case 'sm': return GLASS_PHYSICS.radiusSm;
      case 'lg': return GLASS_PHYSICS.radiusLg;
      default: return GLASS_PHYSICS.radiusMd;
    }
  };

  const getPadding = () => {
    if (noPadding) return '';
    switch (size) {
      case 'sm': return 'p-4';
      case 'lg': return 'p-8';
      default: return 'p-6';
    }
  };

  const spotAlpha = GLASS_PHYSICS.spotlightAlpha * spotlightIntensity;
  const spotAlphaHover = GLASS_PHYSICS.spotlightAlphaHover * spotlightIntensity;
  const specAlpha = specularIntensity;
  const prismAlpha = GLASS_PHYSICS.prismAlpha * prismIntensity;
  const prismAlphaTop = GLASS_PHYSICS.prismAlphaTop * prismIntensity;
  const reflectAlpha = GLASS_PHYSICS.reflectionAlpha * reflectionIntensity;

  return (
    <motion.div
      ref={cardRef}
      className={`vault-glass-card ${getPadding()} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: getRadius(),
        background: isHovered ? GLASS_PHYSICS.tintHover : GLASS_PHYSICS.tint,
        border: `1px solid ${isHovered ? GLASS_PHYSICS.borderHover : GLASS_PHYSICS.borderBase}`,
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        boxShadow: noInnerBevel ? `
          0 4px 12px -4px rgba(0, 0, 0, 0.30),
          0 12px 32px -8px rgba(0, 0, 0, 0.40)
        ` : `
          inset 0 1px 0 ${GLASS_PHYSICS.bevelHighlight},
          inset 0 0 0 1px rgba(255, 255, 255, 0.03),
          inset 0 -20px 40px rgba(0, 0, 0, 0.20),
          0 4px 12px -4px rgba(0, 0, 0, 0.30),
          0 12px 32px -8px rgba(0, 0, 0, 0.40),
          0 24px 48px -12px rgba(0, 0, 0, 0.35)
        `,
        isolation: 'isolate',
        overflow: 'visible',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      {...motionProps}
    >
      {!noSpotlight && (
        <div
          className="vault-spotlight"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-5%',
            right: '-5%',
            bottom: '20%',
            zIndex: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: `
              radial-gradient(
                ellipse 85% 55% at 50% 5%,
                rgba(${GLASS_PHYSICS.spotlightColor}, ${isHovered ? spotAlphaHover : spotAlpha}) 0%,
                rgba(${GLASS_PHYSICS.spotlightColor}, ${(isHovered ? spotAlphaHover : spotAlpha) * 0.4}) 35%,
                rgba(${GLASS_PHYSICS.spotlightColor}, ${(isHovered ? spotAlphaHover : spotAlpha) * 0.1}) 60%,
                transparent 85%
              )
            `,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      {!noSpecular && (
        <>
          <div
            className="vault-specular-wire"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70%',
              height: '1px',
              zIndex: 10,
              pointerEvents: 'none',
              background: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, ${0.25 * specAlpha}) 15%,
                rgba(255, 255, 255, ${0.65 * specAlpha}) 35%,
                ${GLASS_PHYSICS.specularPeak} 50%,
                rgba(255, 255, 255, ${0.65 * specAlpha}) 65%,
                rgba(255, 255, 255, ${0.25 * specAlpha}) 85%,
                transparent 100%
              )`,
              boxShadow: `
                0 0 8px 2px rgba(255, 255, 255, ${0.20 * specAlpha}),
                0 0 20px 4px rgba(255, 255, 255, ${0.10 * specAlpha})
              `,
            }}
          />
          <div
            className="vault-specular-glow"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: '2px',
              zIndex: 9,
              pointerEvents: 'none',
              background: `linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, ${0.08 * specAlpha}) 30%,
                rgba(255, 255, 255, ${0.12 * specAlpha}) 50%,
                rgba(255, 255, 255, ${0.08 * specAlpha}) 70%,
                transparent 100%
              )`,
              filter: 'blur(2px)',
            }}
          />
        </>
      )}
      {!noCornerPrism && (
        <div
          className="vault-corner-prism"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: `
              radial-gradient(circle at 0% 0%, rgba(255, 255, 255, ${prismAlphaTop}) 0%, transparent ${GLASS_PHYSICS.prismSize}),
              radial-gradient(circle at 100% 0%, rgba(255, 255, 255, ${prismAlphaTop}) 0%, transparent ${GLASS_PHYSICS.prismSize}),
              radial-gradient(circle at 0% 100%, rgba(255, 255, 255, ${prismAlpha * 0.5}) 0%, transparent ${GLASS_PHYSICS.prismSize}),
              radial-gradient(circle at 100% 100%, rgba(255, 255, 255, ${prismAlpha * 0.5}) 0%, transparent ${GLASS_PHYSICS.prismSize})
            `,
          }}
        />
      )}
      {!noMouseGlow && isHovered && (
        <div
          className="vault-mouse-glow"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: mousePosition.y - GLASS_PHYSICS.mouseGlowSize / 2,
            left: mousePosition.x - GLASS_PHYSICS.mouseGlowSize / 2,
            width: GLASS_PHYSICS.mouseGlowSize,
            height: GLASS_PHYSICS.mouseGlowSize,
            zIndex: 2,
            pointerEvents: 'none',
            borderRadius: '50%',
            background: `radial-gradient(
              circle at center,
              rgba(220, 230, 245, ${GLASS_PHYSICS.mouseGlowAlpha}) 0%,
              rgba(220, 230, 245, ${GLASS_PHYSICS.mouseGlowAlpha * 0.4}) 30%,
              transparent 70%
            )`,
            transition: 'opacity 0.15s ease',
            opacity: 1,
            filter: 'blur(20px)',
          }}
        />
      )}
      {!noInnerBevel && (
        <div
          className="vault-inner-vignette"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: `linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.15) 100%)`,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 5 }}>
        {children}
      </div>
      {!noFloorReflection && (
        <div
          className="vault-floor-reflection"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '100%',
            left: '8%',
            right: '8%',
            height: GLASS_PHYSICS.reflectionHeight,
            marginTop: '8px',
            zIndex: -1,
            pointerEvents: 'none',
            background: `linear-gradient(
              to bottom,
              rgba(255, 255, 255, ${reflectAlpha}) 0%,
              rgba(255, 255, 255, ${reflectAlpha * 0.35}) 30%,
              rgba(255, 255, 255, ${reflectAlpha * 0.08}) 60%,
              transparent 100%
            )`,
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
            borderRadius: `0 0 ${getRadius()} ${getRadius()}`,
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </motion.div>
  );
}

export function GlassCardSidebar(props: Omit<GlassCardProps, 'variant'>) {
  return <GlassCard {...props} variant="sidebar" spotlightIntensity={0.7} prismIntensity={0.6} noFloorReflection />;
}
export function GlassCardPanel(props: Omit<GlassCardProps, 'variant'>) {
  return <GlassCard {...props} variant="panel" spotlightIntensity={0.5} noMouseGlow />;
}
export function GlassCardProduct(props: Omit<GlassCardProps, 'variant'>) {
  return <GlassCard {...props} variant="card" spotlightIntensity={1.2} specularIntensity={1.1} reflectionIntensity={1.2} />;
}
