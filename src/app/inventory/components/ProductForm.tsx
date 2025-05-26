"use client";

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  costPrice: string;
  retailPrice: string;
  price: string;
  deliveryCost: string;
  stock: string;
  minStock: string;
  supplier: string;
  location: string;
  dimensions: string;
  weight: string;
  warranty: string;
  compatibility: string;
  installationNotes: string;
}

const initialFormData: ProductFormData = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  description: '',
  costPrice: '',
  retailPrice: '',
  price: '',
  deliveryCost: '',
  stock: '',
  minStock: '',
  supplier: '',
  location: '',
  dimensions: '',
  weight: '',
  warranty: '',
  compatibility: '',
  installationNotes: ''
};

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages: File[] = [];
    const newPreviewUrls: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.match('image.*')) {
        newImages.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      }
    });
    
    setUploadedImages([...uploadedImages, ...newImages]);
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    // TODO: Add API call to save product
    console.log('Submitting product', { ...formData, isDraft });
    
    // In a real app, we would handle form submission here
    // For now, just show an alert
    alert(isDraft ? 'Product saved as draft' : 'Product added successfully');
  };

  const previewProduct = () => {
    // TODO: Implement product preview logic
    alert('Product preview would appear here');
  };

  const clearForm = () => {
    setFormData(initialFormData);
    setUploadedImages([]);
    
    // Clean up object URLs to prevent memory leaks
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls([]);
  };

  return (
    <form id="productForm" className="space-y-8" onSubmit={(e) => handleSubmit(e)}>
      {/* Basic Information Section */}
      <div className="form-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Icon name="fas fa-info-circle" className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input 
              type="text" 
              id="name" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              required
              value={formData.name}
              onChange={handleInputChange}
            />
            <label htmlFor="name" className="floating-label">Product Name *</label>
          </div>
          
          <div className="input-group">
            <input 
              type="text" 
              id="sku" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              required
              value={formData.sku}
              onChange={handleInputChange}
            />
            <label htmlFor="sku" className="floating-label">SKU *</label>
          </div>

          <div className="relative">
            <select 
              id="category" 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              required
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select Category</option>
              <option value="springs">Springs</option>
              <option value="openers">Garage Door Openers</option>
              <option value="hardware">Hardware</option>
              <option value="tracks">Tracks & Rails</option>
              <option value="panels">Door Panels</option>
              <option value="cables">Cables & Pulleys</option>
              <option value="remotes">Remotes & Controls</option>
              <option value="weather">Weather Protection</option>
              <option value="tools">Tools & Accessories</option>
            </select>
          </div>

          <div className="input-group">
            <input 
              type="text" 
              id="brand" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.brand}
              onChange={handleInputChange}
            />
            <label htmlFor="brand" className="floating-label">Brand</label>
          </div>

          <div className="md:col-span-2">
            <textarea 
              id="description" 
              rows={4} 
              placeholder="Enter detailed product description..." 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Pricing & Inventory Section */}
      <div className="form-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
            <Icon name="fas fa-dollar-sign" className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="input-group">
            <input 
              type="number" 
              id="costPrice" 
              step="0.01" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.costPrice}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="costPrice" className="floating-label">Cost Price ($) *</label>
          </div>
          
          <div className="input-group">
            <input 
              type="number" 
              id="retailPrice" 
              step="0.01" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.retailPrice}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="retailPrice" className="floating-label">Retail Price ($) *</label>
          </div>
          
          <div className="input-group">
            <input 
              type="number" 
              id="price" 
              step="0.01" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              required
              value={formData.price}
              onChange={handleInputChange}
            />
            <label htmlFor="price" className="floating-label">Sale Price ($) *</label>
          </div>
          
          <div className="input-group">
            <input 
              type="number" 
              id="deliveryCost" 
              step="0.01" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.deliveryCost}
              onChange={handleInputChange}
            />
            <label htmlFor="deliveryCost" className="floating-label">Delivery Cost ($)</label>
          </div>

          <div className="input-group">
            <input 
              type="number" 
              id="stock" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
              required
              value={formData.stock}
              onChange={handleInputChange}
            />
            <label htmlFor="stock" className="floating-label">Stock Quantity *</label>
          </div>

          <div className="input-group">
            <input 
              type="number" 
              id="minStock" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.minStock}
              onChange={handleInputChange}
            />
            <label htmlFor="minStock" className="floating-label">Minimum Stock Level</label>
          </div>

          <div className="input-group">
            <input 
              type="text" 
              id="supplier" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.supplier}
              onChange={handleInputChange}
            />
            <label htmlFor="supplier" className="floating-label">Supplier</label>
          </div>

          <div className="input-group">
            <input 
              type="text" 
              id="location" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.location}
              onChange={handleInputChange}
            />
            <label htmlFor="location" className="floating-label">Storage Location</label>
          </div>
        </div>
      </div>

      {/* Product Images Section */}
      <div className="form-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
            <Icon name="fas fa-images" className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
        </div>
        
        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div 
            id="imageDropArea" 
            className={`drag-drop-area border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-8 text-center cursor-pointer`}
            onClick={() => document.getElementById('imageInput')?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon name="fas fa-cloud-upload-alt" className="text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Product Images</h3>
            <p className="text-gray-500 mb-4">Drag and drop images here, or click to browse</p>
            <p className="text-sm text-gray-400">Supports: JPG, PNG, WEBP (Max 5MB each)</p>
            <input 
              type="file" 
              id="imageInput" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </div>

          {/* Image Previews */}
          {imagePreviewUrls.length > 0 && (
            <div id="imagePreviews" className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="image-preview relative">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-40 object-cover rounded-lg" />
                  <button 
                    type="button"
                    className="remove-image" 
                    onClick={() => removeImage(index)}
                  >
                    <Icon name="fas fa-times" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="form-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
            <Icon name="fas fa-cogs" className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="input-group">
            <input 
              type="text" 
              id="dimensions" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.dimensions}
              onChange={handleInputChange}
            />
            <label htmlFor="dimensions" className="floating-label">Dimensions (L x W x H)</label>
          </div>
          
          <div className="input-group">
            <input 
              type="number" 
              id="weight" 
              step="0.1" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.weight}
              onChange={handleInputChange}
            />
            <label htmlFor="weight" className="floating-label">Weight (lbs)</label>
          </div>

          <div className="input-group">
            <input 
              type="text" 
              id="warranty" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.warranty}
              onChange={handleInputChange}
            />
            <label htmlFor="warranty" className="floating-label">Warranty Period</label>
          </div>

          <div className="input-group">
            <input 
              type="text" 
              id="compatibility" 
              placeholder=" " 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.compatibility}
              onChange={handleInputChange}
            />
            <label htmlFor="compatibility" className="floating-label">Compatible Models</label>
          </div>

          <div className="md:col-span-2">
            <textarea 
              id="installationNotes" 
              rows={3} 
              placeholder="Installation notes, special instructions, or safety warnings..." 
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={formData.installationNotes}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button" 
            onClick={(e) => handleSubmit(e, true)} 
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Icon name="fas fa-save" className="mr-2" />Save as Draft
          </button>
          <button 
            type="button" 
            onClick={previewProduct} 
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Icon name="fas fa-eye" className="mr-2" />Preview
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            type="button" 
            onClick={clearForm} 
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Icon name="fas fa-times" className="mr-2" />Clear Form
          </button>
          <button 
            type="submit" 
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon name="fas fa-plus" className="mr-2" />Add Product
          </button>
        </div>
      </div>
    </form>
  );
}
