"use client"

import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ShoppingCart, Star, Heart, Share2, Sparkles, Shield, Truck, RefreshCw, ArrowLeft, XCircle, AlertTriangle, Bell } from "lucide-react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from '@/contexts/cart-context'
import { Product } from '@/types/product'
import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const ImageGallery = ({ images, name }: { images: string[], name: string }) => {
  const [selectedImage, setSelectedImage] = useState<string>(images[0])
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div className="space-y-4">
      <div 
        className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <motion.div
          className="h-full w-full"
          animate={{ scale: isZoomed ? 1.2 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={selectedImage}
            alt={name}
            className="object-cover object-center transition-all duration-300"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isZoomed ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square overflow-hidden rounded-lg ${
                selectedImage === image 
                  ? 'ring-2 ring-blue-600' 
                  : 'ring-1 ring-gray-200'
              }`}
            >
              <Image
                src={image}
                alt={`${name} - Image ${index + 1}`}
                className="object-cover object-center"
                fill
                sizes="(max-width: 768px) 25vw, 10vw"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

const ProductFeatures = () => (
  <div className="grid grid-cols-2 gap-4 mt-8">
    {[
      { icon: Shield, title: "Secure Payment", desc: "100% Protected" },
      { icon: Sparkles, title: "Quality Product", desc: "Verified Seller" }
    ].map((feature, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex flex-col items-center text-center p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
      >
        <feature.icon className="h-6 w-6 text-blue-600 mb-2" />
        <h3 className="font-medium text-sm">{feature.title}</h3>
        <p className="text-xs text-gray-500">{feature.desc}</p>
      </motion.div>
    ))}
  </div>
)

interface Review {
  id: string;
  productId: string;
  productName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  productImage?: string;
  createdAt: any;
}

const Reviews = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const reviewsQuery = query(
          collection(db, "reviews")
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        const reviewsData: Review[] = [];
        
        querySnapshot.forEach((doc) => {
          reviewsData.push({ id: doc.id, ...doc.data() } as Review);
        });
        
        reviewsData.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          
          return timeB - timeA;
        });
        
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="flex justify-center py-8">
          <motion.div 
            className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-500">No reviews yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div className="space-y-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {review.reviewerName.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h4 className="font-semibold">{review.reviewerName}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${
                        j < review.rating 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  {review.productName}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              {review.comment}
            </p>
            
            {review.productImage && (
              <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
                <Image 
                  src={review.productImage} 
                  alt={`${review.productName} - Customer Photo`} 
                  width={400} 
                  height={300} 
                  className="object-cover w-full h-48"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const router = useRouter()
  const { addItem, removeItem, updateQuantity, clearCart, total } = useCart()

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setProduct(data)
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [params.id])

  async function addToCart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!product) return
    
    if (product.stock <= 0) {
      toast.error(`Sorry, ${product.name} is currently out of stock`);
      return;
    }

    setIsAddingToCart(true)
    try {
      const loadingToast = toast.loading('Adding to cart...');
      await addItem(product)
      toast.dismiss(loadingToast);
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div 
          className="w-32 h-32 rounded-full border-4 border-blue-600 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Product not found</h1>
          <p className="mt-4 text-muted-foreground">
            The product you are looking for does not exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 -mt-4 mb-8 bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm pb-4"
        >
          <Button
            variant="ghost"
            className="group relative overflow-hidden rounded-xl hover:bg-transparent"
            asChild
          >
            <Link href="/product">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="flex items-center gap-2 px-4 py-2"
              >
                <motion.div
                  whileHover={{ x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                    <ArrowLeft className="h-5 w-5 text-blue-600 relative z-10" />
                  </motion.div>
                  <motion.span 
                    className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Back to Products
                  </motion.span>
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                />
              </motion.div>
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery images={product.images} name={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <motion.h1 
                className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {product.name}
              </motion.h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsFavorite(!isFavorite)
                    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
                  }}
                  className={`${isFavorite ? 'text-red-500 hover:text-red-600' : ''}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.share({
                      title: product.name,
                      text: product.description,
                      url: window.location.href,
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copied to clipboard!')
                    })
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                (50+ Reviews)
              </span>
            </div>

            <motion.div 
              className="flex items-baseline gap-4 mb-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: product.currency,
                    }).format(product.salePrice)}
                  </span>
                  <span className="text-2xl font-medium text-gray-400 line-through">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: product.currency,
                    }).format(product.price)}
                  </span>
                  <motion.span 
                    className="text-lg font-semibold text-red-500"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    -{Math.round((1 - (product.salePrice / product.price)) * 100)}% OFF
                  </motion.span>
                </>
              ) : (
                <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: product.currency,
                  }).format(product.price)}
                </span>
              )}
            </motion.div>

            <div className="mb-6">
              {product.stock <= 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2"
                >
                  <span className="inline-flex items-center gap-2 text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">
                    <XCircle className="h-5 w-5" />
                    Out of Stock
                  </span>
                  <p className="text-sm text-gray-500">
                    This product is currently unavailable. You can sign up to be notified when it's back in stock.
                  </p>
                </motion.div>
              ) : product.stock <= 5 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-lg"
                >
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock - Only {product.stock} {product.stock === 1 ? 'item' : 'items'} left!
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg"
                >
                  <Truck className="h-5 w-5" />
                  In Stock - Ready to Ship
                </motion.div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {Object.entries(product.metadata)
                .filter(([key]) => ['category', 'type', 'delivery'].includes(key))
                .map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <motion.span
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset"
                      style={{
                        backgroundColor: 
                          key === 'category' ? 'rgb(243, 244, 246)' :
                          key === 'type' ? 'rgb(239, 246, 255)' :
                          key === 'delivery' ? 'rgb(240, 253, 244)' :
                          'white',
                        color: 
                          key === 'category' ? 'rgb(31, 41, 55)' :
                          key === 'type' ? 'rgb(29, 78, 216)' :
                          key === 'delivery' ? 'rgb(21, 128, 61)' :
                          'black'
                      }}
                    >
                      {value}
                    </motion.span>
                  );
                })}
            </div>

            <div className="prose prose-blue max-w-none mb-8">
              <p className="text-lg leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>

            <form onSubmit={addToCart}>
              {product.stock <= 0 ? (
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="button" 
                      size="lg" 
                      className="w-full bg-gray-100 text-gray-500 text-lg py-6 rounded-xl relative overflow-hidden cursor-not-allowed"
                      disabled={true}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Out of Stock
                      </span>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4"
                  >
                    <Button 
                      type="button" 
                      variant="outline"
                      size="lg" 
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 text-lg py-6 rounded-xl"
                      onClick={() => toast.success("We'll notify you when this product is back in stock!")}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notify Me When Available
                      </span>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-6 rounded-xl relative overflow-hidden"
                    disabled={isAddingToCart}
                  >
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
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                    </span>
                  </Button>
                </motion.div>
              )}
            </form>

            <ProductFeatures />
          </motion.div>
        </div>

        <Reviews productId={params.id} />
      </div>
    </div>
  )
}