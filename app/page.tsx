"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Countdown from 'react-countdown'

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
}

const FloatingSparkles = () => {
  const [mounted, setMounted] = useState(false);
  const [sparklePositions, setSparklePositions] = useState<Array<{ x: number, y: number }>>([]);
  
  useEffect(() => {
    setMounted(true);
    setSparklePositions(
      Array.from({ length: 20 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
    );
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparklePositions.map((position, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            opacity: 0,
            scale: 0,
            left: `${position.x}%`,
            top: `${position.y}%`
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -100],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          <Sparkles className="text-yellow-400 w-3 h-3" />
        </motion.div>
      ))}
    </div>
  )
}

const SaleBanner = () => {
  const [mounted, setMounted] = useState(false);
  const saleEndDate = new Date(2025, 1, 17);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl font-semibold text-emerald-600 text-center"
        >
          🎉 Sale Successfully Completed! 🎉
        </motion.div>
      )
    }

    return (
      <div className="grid grid-flow-col gap-8 text-center auto-cols-max justify-center">
        {[
          { value: days, label: 'Days' },
          { value: hours, label: 'Hours' },
          { value: minutes, label: 'Min' },
          { value: seconds, label: 'Sec' }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.1,
              rotate: [-1, 1, -1],
              transition: { duration: 0.3 }
            }}
            className="flex flex-col items-center"
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-blue-50 p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="relative z-10 text-4xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {item.value.toString().padStart(2, '0')}
              </span>
            </div>
            <motion.span 
              className="mt-2 text-sm font-medium text-slate-600"
              whileHover={{ scale: 1.1 }}
            >
              {item.label}
            </motion.span>
          </motion.div>
        ))}
      </div>
    )
  }

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-16 shadow-xl relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🚀 Limited Time Offer!
        </motion.h2>
        <Countdown date={saleEndDate} renderer={renderer} />
      </div>
    </motion.div>
  )
}

const FeaturedProducts = ({ products }: { products: Product[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
    {products.map((product, index) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.2 }}
        className="group relative"
      >
        <Link href={`/product/${product.id}`}>
          <motion.div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={index === 0} // Add priority to first image
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ opacity: 1 }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <motion.h3 
                className="text-3xl font-bold text-white mb-2"
                whileHover={{ x: 5 }}
              >
                {product.name}
              </motion.h3>
              <motion.p 
                className="text-2xl font-bold text-white/90"
                whileHover={{ scale: 1.1 }}
              >
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: product.currency,
                }).format(product.price)}
              </motion.p>
            </div>
          </motion.div>
        </Link>
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:bottom-4 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
              View Details
              <ArrowRight className="h-5 w-5" />
            </span>
          </Button>
        </motion.div>
      </motion.div>
    ))}
  </div>
)

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/featured-product');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setFeaturedProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <FloatingSparkles />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <motion.h1
                className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-8 leading-tight"
                initial={{ letterSpacing: '0.2em' }}
                animate={{ letterSpacing: '0em' }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                Start Making Money Now!
              </motion.h1>
              
              <motion.p
                className="text-2xl text-slate-600 mb-12 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Premium Vendors & Digital Products
              </motion.p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-7 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transition-all group relative overflow-hidden"
              >
                <Link href="/product">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-200%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative z-10 flex items-center">
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Explore Collection
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated background elements */}
          <div className="absolute inset-0 z-0">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.2, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SaleBanner />
          
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
            <FeaturedProducts products={featuredProducts} />
          )}
        </div>
      </section>
    </div>
  )
}