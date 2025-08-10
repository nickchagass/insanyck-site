// src/animations/cartAnimations.ts
export const drawerSpring = {
    type: "spring",
    stiffness: 360,
    damping: 35,
    mass: 0.8
  };
  
  export const cartButtonVariants = {
    rest: { scale: 1, boxShadow: "none" },
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 18px rgba(255, 215, 0, 0.35)",
      transition: { type: "spring", stiffness: 280, damping: 22 }
    },
    tap: {
      scale: 0.97,
      boxShadow: "0px 0px 6px rgba(255, 215, 0, 0.21)"
    }
  };
  