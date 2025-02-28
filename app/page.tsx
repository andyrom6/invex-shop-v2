"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag, Sparkles, ShoppingBag, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import the BackgroundCarousel component
const BackgroundCarousel = dynamic(
  () => import("@/components/background-carousel").then((mod) => mod.BackgroundCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin"></div>
      </div>
    ),
  }
);

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  onSale: boolean;
  salePrice: number;
}

// Add this component before the Home component
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    top: string;
    left: string;
    size: number;
    animationY: number[];
    animationX: number[];
    duration: number;
  }>>([]);

  useEffect(() => {
    // Generate particles only on the client side to avoid hydration mismatch
    const particlesData = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      animationY: [0, Math.random() * 100 - 50],
      animationX: [0, Math.random() * 100 - 50],
      duration: 10 + Math.random() * 20,
    }));
    
    setParticles(particlesData);
  }, []);

  if (particles.length === 0) return null;

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full bg-blue-400/70"
          style={{
            top: particle.top,
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            filter: 'blur(1px) drop-shadow(0 0 2px rgba(59,130,246,0.8))'
          }}
          animate={{
            y: particle.animationY,
            x: particle.animationX,
            opacity: [0, 0.8, 0],
            scale: [0, Math.random() + 0.5, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
    </>
  );
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/featured-product");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setFeaturedProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* Hero Section with Title Above Carousel */}
      <section className="relative py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
          
          {/* Animated grid lines */}
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.5) 1px, transparent 1px),
                                   linear-gradient(to bottom, rgba(59,130,246,0.5) 1px, transparent 1px)`,
                 backgroundSize: '80px 80px'
               }}>
          </div>
          
          {/* Client-side only floating particles */}
          <FloatingParticles />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Title and Description Above Carousel */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block mb-4"
            >
              <span className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-sm font-medium border border-blue-500/20 backdrop-blur-sm">
                Premium 1:1 Products
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
                Welcome To
              </span>
              <br />
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                InvexSupplier
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We have the best products for your reselling journey best quality and best prices.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/product"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium overflow-hidden shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Browse Products
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
              
              <Link
                href="/contact"
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-medium overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Contact Us
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
            </motion.div>
          </div>
          
          {/* Carousel Below Title with enhanced container */}
          <motion.div 
            className="relative h-[600px] md:h-[700px] rounded-3xl overflow-hidden shadow-[0_20px_80px_-15px_rgba(0,0,0,0.5)] mx-auto mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-[80px]"></div>
            
            {/* Glowing border */}
            <div className="absolute inset-0 rounded-3xl p-[1px] pointer-events-none">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 animate-pulse" style={{ animationDuration: '3s' }}></div>
            </div>
            
            <BackgroundCarousel />
          </motion.div>
          
          {/* Tech specs badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {['Cologne', 'Sp5der Hoodie', 'Airpods', 'Perfumes', 'USA Warehouse', 'Fast Shipping', 'Best Quality'].map((badge, i) => (
              <motion.div 
                key={badge}
                className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm text-blue-100 flex items-center gap-2"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {badge}
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Enhanced wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              className="fill-white opacity-10"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              className="fill-white opacity-5"
            ></path>
          </svg>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-white to-blue-50 text-slate-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
          <div className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="inline-block mb-4"
            >
              <span className="inline-block px-5 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">Featured Products</span>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Best Trending Products
            </motion.h2>
            
            <motion.p 
              className="text-slate-600 max-w-2xl mx-auto text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              
            </motion.p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-[4/3] bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {featuredProducts.map((product, index) => {
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.8 }}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Link href={`/product/${product.id}`}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {/* 3D Card Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
                        
                        {/* Glowing border */}
                        <div className="absolute inset-0 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30"></div>
                        </div>
                        
                        <Image
                          src={product.images && product.images.length > 0 ? product.images[0] : ''}
                          alt={product.name}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110 z-0"
                        />
                        
                        {/* Enhanced overlay with animated gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                        
                        {/* Futuristic tech elements */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 z-20">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                          <span className="text-xs font-medium text-white">Premium</span>
                        </div>
                        
                        {product.onSale && product.salePrice ? (
                          <motion.div
                            className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg z-20"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="h-5 w-5" />
                              <span>{Math.round((1 - (product.salePrice / product.price)) * 100)}% OFF</span>
                            </div>
                          </motion.div>
                        ) : null}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8 z-20">
                          <motion.h3
                            className="text-3xl font-bold text-white mb-3 tracking-tight"
                            whileHover={{ x: 5 }}
                          >
                            {product.name}
                          </motion.h3>
                          
                          {product.onSale && product.salePrice ? (
                            <div className="flex items-baseline gap-3">
                              <motion.p
                                className="text-2xl font-bold text-white/90"
                                whileHover={{ scale: 1.1 }}
                              >
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: product.currency,
                                }).format(product.salePrice)}
                              </motion.p>
                              <motion.p
                                className="text-lg text-white/60 line-through"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: product.currency,
                                }).format(product.price)}
                              </motion.p>
                            </div>
                          ) : (
                            <motion.p
                              className="text-2xl font-bold text-white/90"
                              whileHover={{ scale: 1.1 }}
                            >
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: product.currency,
                              }).format(product.price)}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      
                      {/* Product features badges */}
                      <div className="px-6 py-4 flex flex-wrap gap-2">
                        {['Premium', 'New', 'Featured'].map((badge, i) => (
                          <span 
                            key={`${product.id}-${badge}`} 
                            className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </Link>
                    
                    <motion.div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:bottom-6 transition-all duration-500 z-30"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl text-lg shadow-xl hover:shadow-blue-500/30">
                        <span className="flex items-center gap-2">
                          View Details
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          <div className="text-center mt-20">
            <Link href="/product">
              <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-xl text-lg shadow-sm hover:shadow-md transition-all duration-300">
                <span className="flex items-center gap-2">
                  View All Products
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
