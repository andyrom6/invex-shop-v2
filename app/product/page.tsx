"use client"

import { useEffect, useState, forwardRef } from 'react'
import { Button } from "@/components/ui/button"
import { Filter, Sparkles, Tag, ShoppingCart, XCircle, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from "framer-motion"
import { getProductImage } from '@/lib/product-utils'
import { toast } from 'react-hot-toast'
import { useCart } from '@/contexts/cart-context'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  metadata: {
    category: string
    type: 'physical' | 'digital'
    delivery: string
  }
  stock: number
  featured?: boolean
  salePrice?: number
  onSale?: boolean
}

const CATEGORIES = ['Cologne', 'Perfume', 'Vendors', 'All']

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
  const imageUrl = getProductImage(imageError ? undefined : product.images[0])
  const { addItem } = useCart()
  const router = useRouter()
  
  // Check if product is out of stock
  const isOutOfStock = !product.stock || product.stock <= 0

  // Calculate discount percentage if product is on sale
  const discountPercentage = product.onSale && product.salePrice && product.price
    ? Math.round((1 - (product.salePrice / product.price)) * 100)
    : 0;

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent buying if out of stock
    if (isOutOfStock) {
      toast.error(`Sorry, ${product.name} is out of stock`);
      return;
    }
    
    try {
      const loadingToast = toast.loading('Adding to cart...');
      
      // Add item directly to cart context instead of using fetch
      // Cast the product to match the expected type with proper metadata
      await addItem({
        ...product,
        createdAt: new Date().toISOString(),
        metadata: {
          ...product.metadata,
          delivery: (product.metadata.delivery || 'shipping') as 'shipping' | 'download'
        }
      } as any); // Use type assertion as a last resort
      
      toast.dismiss(loadingToast);
      toast.success('Added to cart!');
      
      // Navigate to cart page using router
      router.push('/cart');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart. Please try again.');
    }
  };

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
          className="bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl"
          whileHover={{ 
            y: -5,
            scale: 1.02,
          }}
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-70 grayscale' : ''}`}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transform -rotate-12"
                >
                  <XCircle className="w-5 h-5" />
                  OUT OF STOCK
                </motion.div>
              </div>
            )}
            
            {product.onSale && product.salePrice && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {discountPercentage}% OFF
              </div>
            )}
            {product.featured && (
              <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </div>
            )}
            
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
            >
              <motion.button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`m-4 w-full font-medium py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 ${
                  isOutOfStock 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-blue-600 hover:text-white'
                }`}
                whileHover={isOutOfStock ? {} : { scale: 1.05 }}
                whileTap={isOutOfStock ? {} : { scale: 0.95 }}
              >
                {isOutOfStock ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Out of Stock
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
                  </>
                )}
              </motion.button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <div className="text-right">
                {product.onSale && product.salePrice ? (
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-red-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: product.currency,
                      }).format(product.salePrice)}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: product.currency,
                      }).format(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: product.currency,
                    }).format(product.price)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                {product.metadata.category}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                {product.metadata.type}
              </span>
              
              {/* Stock Status Badge */}
              <span className={`px-2 py-1 rounded-full text-xs ${
                isOutOfStock 
                  ? 'bg-red-100 text-red-600' 
                  : product.stock && product.stock <= 5 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-green-100 text-green-600'
              }`}>
                {isOutOfStock 
                  ? 'Out of Stock' 
                  : product.stock && product.stock <= 5 
                    ? `Only ${product.stock} left` 
                    : 'In Stock'}
              </span>
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
  const [selectedCategory, setSelectedCategory] = useState('Cologne')

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        console.log('Products fetched:', data);
        setProducts(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching products:', error)
        setLoading(false)
      })
  }, [])

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => 
        product.metadata?.category?.toLowerCase() === selectedCategory.toLowerCase()
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