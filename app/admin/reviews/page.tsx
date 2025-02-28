"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Star, 
  Trash2, 
  Edit, 
  Plus, 
  ArrowLeft, 
  Upload, 
  X,
  Loader2,
  Image as ImageIcon,
  Search
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { Product } from "@/types/product";

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

const IndexCreationHelper = ({ indexUrl }: { indexUrl: string }) => {
  return (
    <div className="bg-blue-900/50 border border-blue-500/50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-white mb-2">Create Firestore Index</h3>
      <p className="text-white/80 mb-3">
        To improve performance and enable sorting by date, you need to create a Firestore index.
      </p>
      <a 
        href={indexUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
      >
        Create Index in Firebase Console
      </a>
    </div>
  );
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [indexUrl, setIndexUrl] = useState<string | null>(null);
  
  // Form state
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [authLoading, user, router]);

  // Fetch reviews and products
  useEffect(() => {
    if (user) {
      fetchReviews();
      fetchProducts();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setIndexUrl(null); // Reset index URL
      
      // Try with a simple query first (no ordering)
      let reviewsData: Review[] = [];
      
      try {
        // First attempt: with ordering (requires index)
        const reviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(reviewsQuery);
        
        querySnapshot.forEach((doc) => {
          reviewsData.push({ id: doc.id, ...doc.data() } as Review);
        });
      } catch (error: any) {
        // If index error, fall back to simple query and sort client-side
        if (error.message && error.message.includes("requires an index")) {
          console.log("Index not found, falling back to client-side sorting");
          
          const simpleQuery = query(collection(db, "reviews"));
          const querySnapshot = await getDocs(simpleQuery);
          
          querySnapshot.forEach((doc) => {
            reviewsData.push({ id: doc.id, ...doc.data() } as Review);
          });
          
          // Sort by createdAt on the client side
          reviewsData.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            
            return timeB - timeA; // Descending order (newest first)
          });
          
          // Extract and store the index URL
          if (error.code === "failed-precondition") {
            const extractedUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
            if (extractedUrl && extractedUrl[0]) {
              setIndexUrl(extractedUrl[0]);
              
              toast.error(
                "Missing Firestore index. See the banner above to create it.",
                { duration: 4000 }
              );
            }
          }
        } else {
          // If it's another error, rethrow it
          throw error;
        }
      }
      
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setProductId("");
    setProductName("");
    setReviewerName("");
    setRating(5);
    setComment("");
    setProductImage(null);
    setPreviewUrl(null);
    setEditingReview(null);
    setSearchTerm("");
  };

  const openModal = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setProductId(review.productId);
      setProductName(review.productName);
      setReviewerName(review.reviewerName);
      setRating(review.rating);
      setComment(review.comment);
      setPreviewUrl(review.productImage || null);
    } else {
      clearForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
  };

  const selectProduct = (product: Product) => {
    setProductId(product.id);
    setProductName(product.name);
    setIsProductDropdownOpen(false);
    setSearchTerm("");
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !reviewerName || !comment) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let imageUrl = editingReview?.productImage || null;
      
      // Generate a random ID if product ID is not provided
      const finalProductId = productId || `product-${Date.now()}`;
      
      // Upload image if provided
      if (productImage) {
        const storageRef = ref(storage, `review-product-images/${Date.now()}-${productImage.name}`);
        await uploadBytes(storageRef, productImage);
        imageUrl = await getDownloadURL(storageRef);
        
        // Delete old image if updating and had a previous image
        if (editingReview?.productImage) {
          try {
            const oldImageRef = ref(storage, editingReview.productImage);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }
      }
      
      const reviewData = {
        productId: finalProductId,
        productName,
        reviewerName,
        rating,
        comment,
        productImage: imageUrl,
        createdAt: serverTimestamp(),
      };
      
      if (editingReview) {
        // Update existing review
        await updateDoc(doc(db, "reviews", editingReview.id), reviewData);
        toast.success("Review updated successfully");
      } else {
        // Add new review
        await addDoc(collection(db, "reviews"), reviewData);
        toast.success("Review added successfully");
      }
      
      closeModal();
      fetchReviews();
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string, productImage?: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete the review document
      await deleteDoc(doc(db, "reviews", reviewId));
      
      // Delete the product image if it exists
      if (productImage) {
        try {
          const imageRef = ref(storage, productImage);
          await deleteObject(imageRef);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
      
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div 
          className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {indexUrl && <IndexCreationHelper indexUrl={indexUrl} />}
        
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
          <h3 className="font-medium mb-2">All Reviews Visible</h3>
          <p className="text-white/80 text-sm">
            All reviews are now displayed on every product page, regardless of which product they belong to.
            This helps build trust by showing the overall customer satisfaction across your store.
          </p>
        </div>
        
        {reviews.length === 0 && !loading && !indexUrl && (
          <div className="mb-6 text-center p-4 bg-white/5 rounded-lg">
            <p className="text-white/70">
              No reviews found. Add your first review using the button above.
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/admin"
              className="flex items-center text-white/70 hover:text-white mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Customer Reviews
            </h1>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Review
          </motion.button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div 
              className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <p className="text-white/70 mb-4">No reviews found</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add your first review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{review.reviewerName}</h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(review)}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id, review.productImage)}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-red-500/20 transition-colors text-white hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs text-white/50">Product: </span>
                  <span className="text-sm text-white/80">{review.productName}</span>
                </div>
                
                <p className="text-white/80 mb-4">{review.comment}</p>
                
                {review.productImage && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
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
        )}
      </div>
      
      {/* Add/Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingReview ? "Edit Review" : "Add New Review"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Product
                </label>
                <div className="relative">
                  <div 
                    className="flex items-center justify-between w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white cursor-pointer"
                    onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                  >
                    <span className={productName ? "text-white" : "text-white/40"}>
                      {productName || "Select a product"}
                    </span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${isProductDropdownOpen ? "rotate-180" : ""}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {isProductDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-slate-700 p-2 border-b border-white/10">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                        </div>
                      </div>
                      
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-center text-white/60">
                          No products found
                        </div>
                      ) : (
                        filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => selectProduct(product)}
                          >
                            <div className="font-medium text-white">{product.name}</div>
                            <div className="text-xs text-white/60">ID: {product.id}</div>
                          </div>
                        ))
                      )}
                      
                      <div 
                        className="p-2 border-t border-white/10 text-center text-sm text-white/60 hover:bg-white/10 cursor-pointer"
                        onClick={() => {
                          setProductName("");
                          setProductId("");
                          setIsProductDropdownOpen(false);
                        }}
                      >
                        Clear selection
                      </div>
                    </div>
                  )}
                </div>
                
                {!productId && productName && (
                  <div className="mt-1 text-xs text-blue-400">
                    Note: A random product ID will be generated
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter reviewer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  className="block w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter review comment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Product Image (Optional)
                </label>
                <div className="mt-1">
                  {previewUrl ? (
                    <div className="mb-3">
                      <div className="relative rounded-lg overflow-hidden border border-white/20 h-48">
                        <Image 
                          src={previewUrl} 
                          alt="Product Preview" 
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProductImage(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <ImageIcon className="h-10 w-10 mx-auto text-white/30 mb-2" />
                      <p className="text-sm text-white/60 mb-3">
                        Upload a photo of the product
                      </p>
                      <label className="inline-flex items-center justify-center px-4 py-2 border border-white/20 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 cursor-pointer transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Select Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>{editingReview ? 'Update Review' : 'Add Review'}</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 