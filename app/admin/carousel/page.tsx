'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Trash2, 
  Upload, 
  Plus, 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BackgroundCarousel, CarouselImage } from '@/components/background-carousel';

export default function CarouselManagementPage() {
  const router = useRouter();
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [editForm, setEditForm] = useState({
    alt: '',
    caption: ''
  });

  // Fetch carousel images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carousel');
      if (!response.ok) throw new Error('Failed to fetch carousel images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      toast.error('Failed to load carousel images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const response = await fetch('/api/carousel/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      
      const data = await response.json();
      toast.success('Image uploaded successfully');
      fetchImages(); // Refresh the image list
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/carousel/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');
      
      toast.success('Image deleted successfully');
      fetchImages(); // Refresh the image list
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const startEditing = (image: CarouselImage) => {
    setEditingImage(image);
    setEditForm({
      alt: image.alt,
      caption: image.caption
    });
  };

  const cancelEditing = () => {
    setEditingImage(null);
    setEditForm({ alt: '', caption: '' });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveImageDetails = async () => {
    if (!editingImage) return;

    try {
      const response = await fetch(`/api/carousel/${editingImage.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alt: editForm.alt,
          caption: editForm.caption
        }),
      });

      if (!response.ok) throw new Error('Failed to update image details');
      
      toast.success('Image details updated successfully');
      fetchImages(); // Refresh the image list
      cancelEditing();
    } catch (error) {
      console.error('Error updating image details:', error);
      toast.error('Failed to update image details');
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/carousel/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          direction
        }),
      });

      if (!response.ok) throw new Error('Failed to reorder images');
      
      toast.success('Image order updated');
      fetchImages(); // Refresh the image list
    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Failed to update image order');
    }
  };

  if (previewMode) {
    return (
      <div className="relative min-h-screen">
        <BackgroundCarousel customImages={images} />
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Editor
          </button>
        </div>
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
          <h1 className="text-3xl font-bold">Carousel Management</h1>
          <p className="text-gray-600 mt-2">
            Manage the images displayed in the homepage carousel
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Eye size={16} />
            Preview Carousel
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer">
            <Upload size={16} />
            Upload New Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No carousel images found</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer">
            <Plus size={16} />
            Add Your First Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                editingImage?.id === image.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              {editingImage?.id === image.id ? (
                <div className="p-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      name="alt"
                      value={editForm.alt}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Image description for accessibility"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <input
                      type="text"
                      name="caption"
                      value={editForm.caption}
                      onChange={handleEditFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Caption displayed on the image"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveImageDetails}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{image.caption}</h3>
                  <p className="text-sm text-gray-500 mb-4">Alt: {image.alt}</p>
                  <div className="flex justify-between">
                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(image.id, 'up')}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                          title="Move up"
                        >
                          <MoveUp size={18} />
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          onClick={() => moveImage(image.id, 'down')}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                          title="Move down"
                        >
                          <MoveDown size={18} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(image)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        title="Edit details"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        title="Delete image"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 