"use client";

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';

export default function BulkUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCsvUpload = (file: File | null) => {
    if (!file) return;
    
    if (file.type !== 'text/csv') {
      alert('Please upload a valid CSV file');
      return;
    }
    
    setFile(file);
    
    // In a real application, we would process the CSV file here
    // For demo purposes, we'll just log the file info
    console.log('CSV file selected:', file.name, file.size);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    try {
      // In a real app, we would send the file to the server here
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`File ${file.name} has been uploaded successfully!`);
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // In a real app, this would download a CSV template
    // For demo purposes, we'll just show an alert
    alert('Downloading CSV template...');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="form-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div 
            className="bulk-upload-area rounded-lg p-12 cursor-pointer" 
            onClick={() => document.getElementById('csvInput')?.click()}
          >
            <Icon name="fas fa-file-csv" className="text-6xl text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bulk Upload Products</h3>
            <p className="text-gray-600 mb-4">Upload a CSV file with product information</p>
            <button 
              type="button" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose CSV File
            </button>
            <input 
              type="file" 
              id="csvInput" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => handleCsvUpload(e.target.files?.[0] || null)}
            />
          </div>
          
          {file && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Icon name="fas fa-file-csv" className="text-blue-500 mr-3 text-xl" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => setFile(null)}
                >
                  <Icon name="fas fa-times" />
                </button>
              </div>
              <button 
                type="submit" 
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Icon name="fas fa-spinner fa-spin" className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Icon name="fas fa-upload" className="mr-2" />
                    Upload Products
                  </>
                )}
              </button>
            </div>
          )}
          
          <div className="mt-6 text-left">
            <h4 className="font-semibold text-gray-900 mb-3">CSV Format Requirements:</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Required columns: name, sku, category, price, stock</p>
              <p className="text-gray-600 mb-2">Optional columns: brand, description, cost_price, min_stock, supplier, location, dimensions, weight, warranty</p>
              <button 
                type="button" 
                onClick={downloadTemplate} 
                className="text-blue-600 hover:underline"
              >
                <Icon name="fas fa-download" className="mr-1" />
                Download CSV Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
