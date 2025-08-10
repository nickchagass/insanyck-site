// components/Loader.tsx
import React from 'react';

export function Loader() {
  return (
    <div style={{ textAlign: "center", padding: 24 }}>
      <div className="loader" />
      <style jsx>{`
        .loader {
          border: 4px solid #555;
          border-top: 4px solid #FFD700;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ color: "#FFD700", fontWeight: "bold" }}>Carregando...</span>
    </div>
  );
}
