// INSANYCK FASE G-03.1 — UX-10 · Toast Provider de Luxo
"use client";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Provider de toast INSANYCK com estilo luxury noir:
 * - Glassmorphism (fundo preto translúcido + blur)
 * - Bordas sutis
 * - Posicionamento top-right
 * - Respeita prefers-reduced-motion
 */
export function InsanyckToastProvider() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        limit={3}
        theme="dark"
        transition={Slide}
        className="insanyck-toast-container"
      />
      <style jsx global>{`
        .insanyck-toast-container .Toastify__toast {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          padding: 16px;
          min-height: 64px;
        }

        .insanyck-toast-container .Toastify__toast-body {
          padding: 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .insanyck-toast-container .Toastify__progress-bar {
          background: rgba(255, 255, 255, 0.3);
        }

        .insanyck-toast-container .Toastify__close-button {
          color: rgba(255, 255, 255, 0.7);
          opacity: 0.7;
        }

        .insanyck-toast-container .Toastify__close-button:hover {
          opacity: 1;
          color: rgba(255, 255, 255, 0.95);
        }

        /* Respeita prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .insanyck-toast-container .Toastify__toast {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
