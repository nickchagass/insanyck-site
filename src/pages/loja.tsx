import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, ShoppingCart, Filter, ArrowUpDown } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  category: string;
  isNew?: boolean;
  isExclusive?: boolean;
  slug: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Drop Zero',
    price: 'R$ 350',
    image: '/api/placeholder/400/600',
    category: 'Camisetas',
    isNew: true,
    slug: 'drop-zero'
  },
  {
    id: '2',
    title: 'Oversized Classic',
    price: 'R$ 300',
    image: '/api/placeholder/400/600',
    category: 'Camisetas',
    slug: 'oversized-classic'
  },
  {
    id: '3',
    title: 'Ribbed Logo Top',
    price: 'R$ 250',
    image: '/api/placeholder/400/600',
    category: 'Tops',
    slug: 'ribbed-logo-top'
  },
  {
    id: '4',
    title: 'Minimalist Tenis',
    price: 'R$ 300',
    image: '/api/placeholder/400/600',
    category: 'Calçados',
    slug: 'minimalist-tenis'
  },
  {
    id: '5',
    title: 'Urban Sneaker',
    price: 'R$ 450',
    image: '/api/placeholder/400/600',
    category: 'Calçados',
    isExclusive: true,
    slug: 'urban-sneaker'
  },
  {
    id: '6',
    title: 'Premium Hoodie',
    price: 'R$ 380',
    image: '/api/placeholder/400/600',
    category: 'Camisetas',
    slug: 'premium-hoodie'
  }
];

const CinematographicShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const categories = ['Todos', 'Camisetas', 'Tops', 'Calçados'];
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(mockProducts.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-slide with hover pause
  useEffect(() => {
    if (!hoveredProduct) {
      const interval = setInterval(nextSlide, 6000);
      return () => clearInterval(interval);
    }
  }, [hoveredProduct]);

  const getCurrentProducts = () => {
    const start = currentSlide * itemsPerSlide;
    return mockProducts.slice(start, start + itemsPerSlide);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-blue-600/30 via-purple-600/20 to-transparent blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-32 w-80 h-80 bg-gradient-radial from-purple-500/25 via-pink-500/15 to-transparent blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-radial from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header Section */}
      <div className="relative z-10 px-8 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-light tracking-[-0.02em] mb-4 bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              Produtos
            </h1>
            <p className="text-white/60 text-lg tracking-wide">
              6 produto(s) • Vidro leve • borda hairline
            </p>
          </motion.div>

          {/* Categories & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap items-center justify-between gap-6 mb-12"
          >
            {/* Category Tabs */}
            <div className="flex gap-8">
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  onClick={() => setActiveCategory(category)}
                  className={`relative text-lg tracking-wide transition-all duration-500 hover:text-white group ${
                    activeCategory === category ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {category}
                  {activeCategory === category && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-all">
                <Filter size={16} />
                <span className="text-sm">Filtros</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-all">
                <ArrowUpDown size={16} />
                <span className="text-sm">Relevância</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Showcase Vitrine */}
      <div className="relative z-10 px-8" ref={containerRef}>
        <div className="max-w-7xl mx-auto">
          
          {/* Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-black/60 hover:border-white/40 transition-all duration-300 group"
          >
            <ChevronLeft size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-black/60 hover:border-white/40 transition-all duration-300 group"
          >
            <ChevronRight size={20} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Vitrine Container */}
          <div className="relative perspective-1000">
            
            {/* Professional Lighting Setup */}
            <div className="absolute inset-0 -z-10">
              {/* Key Light - Main illumination */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-white/15 via-white/5 to-transparent blur-2xl" />
              
              {/* Fill Lights - Side illumination */}
              <div className="absolute top-1/4 left-0 w-48 h-96 bg-gradient-to-r from-blue-400/20 to-transparent blur-3xl rotate-12" />
              <div className="absolute top-1/4 right-0 w-48 h-96 bg-gradient-to-l from-purple-400/20 to-transparent blur-3xl -rotate-12" />
              
              {/* Rim Light - Edge definition */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-gradient-to-t from-cyan-500/10 via-blue-500/5 to-transparent blur-xl" />
            </div>

            {/* Vitrine Platform Structure */}
            <div className="relative">
              {/* Glass Platform Base */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] h-16">
                {/* Main glass surface */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent rounded-full blur-lg" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/12 to-transparent rounded-full blur-sm" />
                
                {/* Glass edge reflections */}
                <div className="absolute top-0 left-1/4 right-1/4 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full blur-sm" />
              </div>

              {/* Support Pillars (subtle) */}
              <div className="absolute bottom-0 left-1/4 w-2 h-12 bg-gradient-to-t from-white/10 to-transparent blur-sm rounded-full" />
              <div className="absolute bottom-0 right-1/4 w-2 h-12 bg-gradient-to-t from-white/10 to-transparent blur-sm rounded-full" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-12 bg-gradient-to-t from-white/10 to-transparent blur-sm rounded-full" />

              {/* Products Display Area */}
              <div className="pt-20 pb-40">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 60, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -60, rotateX: 15 }}
                    transition={{ 
                      duration: 0.8, 
                      ease: [0.25, 0.25, 0.25, 1],
                      staggerChildren: 0.1
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-items-center"
                  >
                    {getCurrentProducts().map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 80, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          delay: index * 0.15,
                          duration: 0.9,
                          ease: [0.25, 0.25, 0.25, 1]
                        }}
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        className="relative group cursor-pointer transform-gpu"
                      >
                        {/* Individual Product Lighting */}
                        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-40 h-48 transition-all duration-700 ${
                          hoveredProduct === product.id 
                            ? 'opacity-100 scale-110' 
                            : 'opacity-60 scale-100'
                        }`}>
                          {/* Spotlight cone */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent blur-2xl transform rotate-3" />
                          <div className="absolute inset-0 bg-gradient-to-b from-blue-200/20 via-purple-200/10 to-transparent blur-xl transform -rotate-3" />
                        </div>

                        {/* Product Showcase Stand */}
                        <div className="relative">
                          {/* Stand Base */}
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-lg rounded-full" />
                            <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm rounded-full" />
                          </div>

                          {/* Product Card with Museum-like Presentation */}
                          <div className="relative w-80 h-[500px]">
                            {/* Card Aura */}
                            <div className={`absolute inset-0 transition-all duration-700 ${
                              hoveredProduct === product.id
                                ? 'opacity-100 scale-105 rotate-1'
                                : 'opacity-0 scale-100 rotate-0'
                            }`}>
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-2xl" />
                              <div className="absolute inset-0 bg-gradient-to-tl from-cyan-400/15 via-transparent to-purple-400/15 rounded-3xl blur-xl" />
                            </div>
                            
                            {/* Main Product Card */}
                            <div className="relative h-full bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
                              
                              {/* Status Badge */}
                              <AnimatePresence>
                                {(product.isNew || product.isExclusive) && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute top-6 left-6 z-20 px-4 py-2 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/20 rounded-full"
                                  >
                                    <span className="text-xs font-medium tracking-wider text-white/90">
                                      {product.isNew ? 'NOVO' : 'EXCLUSIVO'}
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Product Image */}
                              <div className="relative h-[380px] overflow-hidden">
                                <motion.img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-full h-full object-cover transition-all duration-700"
                                  animate={{
                                    scale: hoveredProduct === product.id ? 1.08 : 1,
                                    filter: hoveredProduct === product.id ? 'brightness(1.1) contrast(1.05)' : 'brightness(1) contrast(1)',
                                  }}
                                />
                                
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                
                                {/* Interactive Overlay */}
                                <AnimatePresence>
                                  {hoveredProduct === product.id && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center gap-6"
                                    >
                                      <motion.button
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                        className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all group"
                                      >
                                        <Eye size={20} className="group-hover:scale-110 transition-transform" />
                                      </motion.button>
                                      <motion.button
                                        initial={{ scale: 0, rotate: 180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        className="w-14 h-14 bg-white/90 text-black rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all group shadow-xl"
                                      >
                                        <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                                      </motion.button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Product Information */}
                              <div className="p-6 space-y-3">
                                <h3 className="text-xl font-light tracking-wide text-white/95 group-hover:text-white transition-colors">
                                  {product.title}
                                </h3>
                                <div className="flex items-center justify-between">
                                  <p className="text-2xl font-medium text-white">
                                    {product.price}
                                  </p>
                                  <div className="flex gap-2">
                                    <button className="px-4 py-2 text-sm border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                                      Comprar
                                    </button>
                                    <button className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                                      Ver detalhes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Product Reflection */}
                          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-t from-white/8 via-white/3 to-transparent opacity-60 blur-lg rounded-full transform scale-y-50" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-3 mt-16">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-white scale-125 shadow-lg shadow-white/50' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Performance & Navigation Info */}
      <div className="relative z-10 px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="flex justify-center items-center gap-8 text-white/50"
          >
            <span className="text-sm tracking-wider font-light">
              {currentSlide + 1} | {totalSlides}
            </span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-sm tracking-wider font-light">60 FPS</span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-sm tracking-wider font-light">EXCLUSIVO</span>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .transform-gpu {
          transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  );
};

export default CinematographicShowcase;