import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';
import { X, Plus, ImageIcon, DollarSign, Tag, Package, Truck, Download, Info, Star, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from "@/components/ui/switch";

export interface ProductData {
  name: string;
  description: string;
  price: number | undefined;
  salePrice?: number | undefined;
  onSale?: boolean;
  currency: string;
  images: string[];
  metadata: {
    category: string;
    type: 'physical' | 'digital';
    delivery: 'shipping' | 'download';
  };
  stock: number | undefined;
  sku?: string;
  tags?: string[];
  featured?: boolean;
}

interface ProductFormProps {
  onSubmit: (data: ProductData & { imageFiles?: File[] }) => void;
  initialData?: ProductData;
  onClose: () => void;
}

export function ProductForm({ onSubmit, initialData, onClose }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProductData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? undefined,
    salePrice: initialData?.salePrice ?? undefined,
    onSale: initialData?.onSale ?? false,
    currency: initialData?.currency ?? 'USD',
    images: initialData?.images ?? [],
    metadata: {
      category: initialData?.metadata?.category ?? '',
      type: initialData?.metadata?.type ?? 'physical',
      delivery: initialData?.metadata?.delivery ?? 'shipping',
    },
    stock: initialData?.stock ?? undefined,
    tags: initialData?.tags ?? [],
    featured: initialData?.featured ?? false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>(initialData?.images || []);
  const [activeTab, setActiveTab] = useState("basic");
  const [tagInput, setTagInput] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveAttempted, setSaveAttempted] = useState(false);

  // Calculate discount percentage
  const discountPercentage = formData.price && formData.salePrice
    ? Math.round((1 - (formData.salePrice / formData.price)) * 100)
    : 0;

  // Validate form on submit attempt
  useEffect(() => {
    if (saveAttempted) {
      validateForm();
    }
  }, [formData, saveAttempted]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.price || formData.price <= 0) errors.price = "Price must be greater than zero";
    if (formData.onSale && (!formData.salePrice || formData.salePrice <= 0)) errors.salePrice = "Sale price must be greater than zero";
    if (formData.onSale && formData.salePrice && formData.price && formData.salePrice >= formData.price) errors.salePrice = "Sale price must be less than regular price";
    if (formData.stock !== undefined && formData.stock < 0) errors.stock = "Stock cannot be negative";
    if (!formData.metadata.category) errors.category = "Category is required";
    if (imagePreview.length === 0) errors.images = "At least one product image is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveAttempted(true);
    
    if (validateForm()) {
      onSubmit({ ...formData, imageFiles });
    } else {
      // Find the first tab with errors and switch to it
      if (formErrors.name || formErrors.description || formErrors.images) {
        setActiveTab("basic");
      } else if (formErrors.price || formErrors.salePrice) {
        setActiveTab("pricing");
      } else if (formErrors.stock) {
        setActiveTab("inventory");
      } else if (formErrors.category) {
        setActiveTab("details");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
    
    // Clear image error if it exists
    if (formErrors.images) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), tagInput.trim()]
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Hero Section */}
      <div className="relative h-[220px] rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 mb-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {initialData ? 'Edit Mode' : 'Create Mode'}
            </Badge>
            {formData.featured && (
              <Badge className="bg-amber-500 text-white border-none">
                <Star className="w-3.5 h-3.5 mr-1" />
                Featured Product
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {initialData ? 'Update Product' : 'Create New Product'}
            </h2>
            <p className="text-white/80 max-w-xl">
              {formData.name ? formData.name : 'Fill in the details below to create your product listing'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl">
          <TabsTrigger value="basic" className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Basic Info
            {(formErrors.name || formErrors.description || formErrors.images) && (
              <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Pricing
            {(formErrors.price || formErrors.salePrice) && (
              <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Inventory
            {formErrors.stock && (
              <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="details" className="relative rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Details
            {formErrors.category && (
              <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the core details about your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Product Name
                  {formErrors.name && (
                    <span className="text-red-500 ml-2 text-xs">{formErrors.name}</span>
                  )}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`border-gray-200 focus-visible:ring-blue-500 ${formErrors.name ? 'border-red-300' : ''}`}
                  placeholder="Enter a descriptive name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Description
                  {formErrors.description && (
                    <span className="text-red-500 ml-2 text-xs">{formErrors.description}</span>
                  )}
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`min-h-[150px] border-gray-200 focus-visible:ring-blue-500 ${formErrors.description ? 'border-red-300' : ''}`}
                  placeholder="Describe your product in detail..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Product Media</CardTitle>
                  <CardDescription>Add photos of your product</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Images
                </Button>
              </div>
              {formErrors.images && (
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors.images}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {imagePreview.map((url, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-gray-50"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-white hover:text-red-500"
                          onClick={() => {
                            setImagePreview(prev => prev.filter((_, i) => i !== index));
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <motion.div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-3 rounded-full bg-blue-50">
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm text-gray-500">Upload Images</span>
                </motion.div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Pricing Information</CardTitle>
              <CardDescription>Set your product's price and promotional offers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Regular Price
                  {formErrors.price && (
                    <span className="text-red-500 ml-2 text-xs">{formErrors.price}</span>
                  )}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : undefined })}
                    className={`pl-9 border-gray-200 focus-visible:ring-blue-500 ${formErrors.price ? 'border-red-300' : ''}`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <Switch
                    checked={formData.onSale || false}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      onSale: checked,
                      salePrice: checked ? formData.salePrice : 0
                    })}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <div>
                    <label className="block text-sm font-medium">Special Offer</label>
                    <p className="text-xs text-gray-500">Enable discounted pricing</p>
                  </div>
                </div>

                <AnimatePresence>
                  {formData.onSale && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          Sale Price
                          {formErrors.salePrice && (
                            <span className="text-red-500 ml-2 text-xs">{formErrors.salePrice}</span>
                          )}
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.salePrice || ''}
                            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                            className={`pl-9 border-gray-200 focus-visible:ring-green-500 ${formErrors.salePrice ? 'border-red-300' : ''}`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      {formData.price && formData.price > 0 && formData.salePrice && formData.salePrice > 0 && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500">
                              {discountPercentage}% OFF
                            </Badge>
                            <span className="text-sm text-gray-500 line-through">
                              ${formData.price.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            ${formData.salePrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Manage your product's stock and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Stock Quantity
                  {formErrors.stock && (
                    <span className="text-red-500 ml-2 text-xs">{formErrors.stock}</span>
                  )}
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value ? Number(e.target.value) : undefined })}
                    className={`pl-9 border-gray-200 focus-visible:ring-blue-500 ${formErrors.stock ? 'border-red-300' : ''}`}
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Number of items available for purchase
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">SKU (Optional)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="pl-9 border-gray-200 focus-visible:ring-blue-500"
                    placeholder="Enter SKU"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Stock Keeping Unit - unique identifier for your product
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Product Tags</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="pl-9 border-gray-200 focus-visible:ring-blue-500"
                    placeholder="Type tag and press Enter"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add tags to help customers find your product
                </p>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <AnimatePresence>
                      {formData.tags.map(tag => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Specify category and delivery information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Category
                  {formErrors.category && (
                    <span className="text-red-500 ml-2 text-xs">{formErrors.category}</span>
                  )}
                </label>
                <Select 
                  value={formData.metadata.category}
                  onValueChange={(value: string) => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      category: value
                    }
                  })}
                >
                  <SelectTrigger className={`border-gray-200 ${formErrors.category ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Select product category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-md">
                    <SelectItem value="Cologne" className="hover:bg-blue-50">
                      <div className="flex items-center py-1">
                        <span>Cologne</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Perfume" className="hover:bg-blue-50">
                      <div className="flex items-center py-1">
                        <span>Perfume</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Vendors" className="hover:bg-blue-50">
                      <div className="flex items-center py-1">
                        <span>Vendors</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Product Type</label>
                <Select 
                  value={formData.metadata.type}
                  onValueChange={(value: 'physical' | 'digital') => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      type: value
                    }
                  })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-md">
                    <SelectItem value="physical" className="hover:bg-blue-50">
                      <div className="flex items-center py-1">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Physical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="digital" className="hover:bg-blue-50">
                      <div className="flex items-center py-1">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Digital</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Delivery Method</label>
                <Select 
                  value={formData.metadata.delivery}
                  onValueChange={(value: 'shipping' | 'download') => setFormData({
                    ...formData,
                    metadata: {
                      ...formData.metadata,
                      delivery: value
                    }
                  })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-md">
                    <SelectItem value="shipping" className="hover:bg-blue-50">
                      <div className="flex items-center py-1">
                        <Truck className="mr-2 h-4 w-4" />
                        <span>Shipping</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="download" className="hover:bg-blue-50">
                      <div className="flex items-center py-1">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <div>
                    <label className="block text-sm font-medium">Feature Product</label>
                    <p className="text-xs text-gray-500">Show in featured sections</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="sticky bottom-0 bg-white border-t py-4 px-6 -mx-6 mt-8 shadow-md backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      // Preview functionality would go here
                      alert("Preview functionality would be implemented here");
                    }}
                  >
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview how your product will look</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white min-w-[120px] shadow-sm"
            >
              {initialData ? 'Update' : 'Create'} Product
            </Button>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
