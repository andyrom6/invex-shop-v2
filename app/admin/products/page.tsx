"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit, Trash, Search, Filter, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-hot-toast';
import { ProductForm, ProductData } from '@/components/product-form';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';

interface Product extends ProductData {
  id: string;
  createdAt: string;
}

export default function ProductsAdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const loadingToast = toast.loading('Loading products...');
      const response = await fetch('/api/products');
      const data = await response.json();
      toast.dismiss(loadingToast);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(productId: string) {
    try {
      const loadingToast = toast.loading('Deleting product...');
      
      const response = await fetch(`/api/products/${productId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      toast.dismiss(loadingToast);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  }

  async function handleSubmit(productData: ProductData & { imageFiles?: File[] }) {
    try {
      const loadingToast = toast.loading(`${selectedProduct ? 'Updating' : 'Creating'} product...`);
      
      const formData = new FormData();
      
      // Append all product data
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'metadata') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'images' && Array.isArray(value)) {
          // Don't append image URLs here, we'll handle them separately
        } else if (key !== 'imageFiles') {
          formData.append(key, String(value));
        }
      });
      
      // Handle image files separately
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        productData.imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }
      
      // Append existing image URLs if updating
      if (selectedProduct && Array.isArray(productData.images)) {
        formData.append('existingImages', JSON.stringify(productData.images));
      }

      // If selectedProduct exists, update existing product
      const url = selectedProduct 
        ? `/api/products/${selectedProduct.id}` 
        : '/api/products';
      
      const method = selectedProduct ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      if (!response.ok) throw new Error(`Failed to ${selectedProduct ? 'update' : 'create'} product`);
      
      toast.dismiss(loadingToast);
      toast.success(`Product ${selectedProduct ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.metadata.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine how many products are likely to be visible in the first viewport
  // For desktop, we show 3 products in a row, so the first 3 should have priority
  // For tablet, we show 2 products in a row, so the first 2 should have priority
  // For mobile, we show 1 product in a row, so only the first one needs priority
  const isPriorityImage = (index: number) => {
    return index < 3; // Prioritize the first 3 images to cover all viewport sizes
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div 
          className="w-20 h-20 rounded-full border-4 border-blue-600 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-gray-600 mt-2">
            Add, edit, and manage your product inventory
          </p>
        </div>
        
        <Button 
          onClick={() => setShowForm(true)}
          size="lg"
          className="bg-black hover:bg-gray-800 text-white gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Products', value: products.length },
            { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length },
            { label: 'Featured', value: products.filter(p => p.featured).length },
            { label: 'Categories', value: new Set(products.map(p => p.metadata.category)).size }
          ].map((stat, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 border-2 border-black">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus-visible:ring-black"
            />
          </div>
          <Button variant="outline" className="gap-2 border-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group bg-white rounded-xl border hover:border-black transition-colors duration-200"
              >
                <div className="aspect-[4/3] relative bg-gray-50 rounded-t-xl overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      priority={isPriorityImage(index)}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                  {product.featured && (
                    <Badge className="absolute top-2 right-2 bg-black text-white">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.metadata.category}</p>
                    </div>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: product.currency,
                      }).format(product.price ?? 0)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-xs border-2">
                      {product.metadata.type}
                    </Badge>
                    <Badge 
                      variant={(product.stock ?? 0) > 0 ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-2 hover:bg-gray-50"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DialogHeader className="px-8 pt-8 pb-0 border-b border-gray-100">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <p className="text-gray-500 mt-1">
                Fill in the details below to {selectedProduct ? 'update' : 'create'} your product
              </p>
            </DialogHeader>

            <div className="p-8">
              <ProductForm 
                onSubmit={handleSubmit}
                initialData={selectedProduct || undefined}
                onClose={() => setShowForm(false)}
              />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 