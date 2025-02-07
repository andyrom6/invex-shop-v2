"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SALE_ACTIVE, SALE_PERCENTAGE } from "@/lib/constants";
import { BackgroundCarousel } from "@/components/background-carousel";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
}

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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Main Heading */}
        <div className="relative z-20 pt-24 md:pt-28 pb-12 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent">
          <div className="max-w-[90rem] mx-auto text-center px-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight">
                <span className="inline-block text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
                  Start Making
                </span>
                <br />
                <span className="inline-block mt-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 animate-gradient">
                    Money Now!
                  </span>
                </span>
              </h1>
            </motion.div>
          </div>
        </div>
  
        {/* Carousel Section */}
        <div className="relative h-[450px] md:h-[550px] lg:h-[650px] -mt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950">
            <BackgroundCarousel />
          </div>
        </div>
  

  
        {/* Remove extra instance here */}
        {/* <BackgroundCarousel /> */}
      </section>
  
      {/* Featured Products Section */}
      <section className="py-20 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {featuredProducts.map((product, index) => {
                const formattedPrice = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: product.currency,
                }).format(product.price);
  
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg"
                  >
                    <Link href={`/product/${product.id}`}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {SALE_ACTIVE && (
                          <motion.div
                            className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full text-lg font-bold shadow-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="h-5 w-5" />
                              <span>{SALE_PERCENTAGE}% OFF</span>
                            </div>
                          </motion.div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                          <motion.h3
                            className="text-3xl font-bold text-white mb-2"
                            whileHover={{ x: 5 }}
                          >
                            {product.name}
                          </motion.h3>
                          {SALE_ACTIVE ? (
                            <div className="flex items-baseline gap-3">
                              <motion.p
                                className="text-2xl font-bold text-white/90"
                                whileHover={{ scale: 1.1 }}
                              >
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: product.currency,
                                }).format(product.price * (1 - SALE_PERCENTAGE / 100))}
                              </motion.p>
                              <motion.p
                                className="text-lg text-white/60 line-through"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {formattedPrice}
                              </motion.p>
                            </div>
                          ) : (
                            <motion.p
                              className="text-2xl font-bold text-white/90"
                              whileHover={{ scale: 1.1 }}
                            >
                              {formattedPrice}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </Link>
                    <motion.div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:bottom-4 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl">
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
        </div>
      </section>

      {/* Membership Section */}
      <section className="relative z-20 py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <motion.div
          className="max-w-4xl mx-auto text-center px-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 leading-relaxed font-light">
            Join our{" "}
            <span className="font-medium bg-gradient-to-br from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Exclusive Membership
            </span>{" "}
            and
            <br className="hidden md:block" />
            get all the{" "}
            <span className="font-medium bg-gradient-to-br from-purple-400 to-purple-500 bg-clip-text text-transparent">
              Vendors and Tools
            </span>{" "}
            you need today
          </p>
          <Link href="/product" className="block w-fit mx-auto">
            <motion.div
              className="mt-12 px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white rounded-full text-xl font-medium shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_48px_rgba(59,130,246,0.5)] transition-all duration-300 cursor-pointer overflow-hidden relative group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98, y: 2 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-blue-600/0"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              <span className="relative flex items-center gap-2">
                Explore Collection <ArrowRight className="h-6 w-6" />
              </span>
            </motion.div>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
