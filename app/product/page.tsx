"use client"

import { useEffect, useState, forwardRef } from 'react'
import { Button } from "@/components/ui/button"
import { Filter, Sparkles, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from "framer-motion"
import { getProductImage } from '@/lib/product-utils'
import { SALE_ACTIVE, SALE_DISCOUNT, SALE_PERCENTAGE } from '@/lib/constants'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  category?: string
  type?: string
  delivery?: string
  isSubscription?: boolean
}

const CATEGORIES = ['Vendor', 'Cologne', 'Courses']

const CategoryButton = ({ category, isSelected, onClick }: { 
  category: string
  isSelected: boolean
  onClick: () => void 
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={onClick}
      className={`whitespace-nowrap relative overflow-hidden ${
        isSelected ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''
      }`}
    >
      {isSelected && (
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
      )}
      <span className="relative z-10 flex items-center gap-2">
        {category}
        {isSelected && <Sparkles className="w-4 h-4" />}
      </span>
    </Button>
  </motion.div>
)

interface ProductCardProps {
  product: Product
  index: number
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, index }, ref) => {
  const [imageError, setImageError] = useState(false)
  const imageUrl = getProductImage(imageError ? undefined : product.image)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 100,
        delay: index * 0.05,
      }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <motion.div
          className="bg-white rounded-2xl p-6 transition-all duration-300"
          style={{
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
          }}
          whileHover={{ 
            y: -8,
            scale: 1.02,
          }}
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
            <motion.div
              className="relative h-full w-full"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                className="object-cover transition-transform duration-700"
                onError={() => setImageError(true)}
              />
              {SALE_ACTIVE && (
                <motion.div 
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>{SALE_PERCENTAGE}% OFF</span>
                  </div>
                </motion.div>
              )}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 transition-opacity duration-300"
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
          </div>
          <div className="mt-4">
            <motion.h3 
              className="font-semibold text-lg text-slate-900 mb-2"
              whileHover={{ x: 5 }}
            >
              {product.name}
            </motion.h3>
            <div>
              {SALE_ACTIVE ? (
                <>
                  <motion.p 
                    className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                    whileHover={{ scale: 1.05 }}
                  >
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: product.currency,
                    }).format(product.price * (1 - SALE_DISCOUNT))}
                  </motion.p>
                  <motion.p 
                    className="text-sm text-gray-400 line-through"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: product.currency,
                    }).format(product.price)}
                  </motion.p>
                </>
              ) : (
                <motion.p 
                  className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                  whileHover={{ scale: 1.05 }}
                >
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: product.currency,
                  }).format(product.price)}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
})

ProductCard.displayName = 'ProductCard'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Vendor')

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching products:', error)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter(product => 
    product.category?.toLowerCase() === selectedCategory.toLowerCase()
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:items-center md:justify-between mb-12">
          <motion.h1 
            className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore Our Collection
          </motion.h1>
          <motion.div 
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {CATEGORIES.map((category) => (
              <CategoryButton
                key={category}
                category={category}
                isSelected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="aspect-square bg-slate-100 rounded-xl animate-pulse" />
                <div className="mt-4 space-y-3">
                  <div className="h-6 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            className="text-center py-32"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Filter className="mx-auto h-16 w-16 text-slate-400 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600">
              No products available in the {selectedCategory} category.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}