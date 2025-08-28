// INSANYCK STEP 3
import Navbar from "@/components/Navbar";
import HeroProduct from "@/sections/HeroProduct";

Produto.getInitialProps = async () => {
  return {};
};

export default function Produto() {
  return (
    <main className="min-h-dvh bg-[#0a0a0a] text-white">
      <Navbar />
      <HeroProduct />
    </main>
  );
}
