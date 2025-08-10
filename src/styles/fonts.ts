// src/styles/fonts.ts
import { League_Spartan } from "next/font/google";

// Fonte de marca (geométrica/robusta). Ajuste os pesos conforme o gosto.
export const brandFont = League_Spartan({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-brand", // expõe a variável para usarmos em CSS
});
