
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PricingAndImageSection = ({
  productPrice, setProductPrice,
  productImageUrl, setProductImageUrl
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="productPrice" className="text-slate-300">Price ($)*</Label>
        <Input
          id="productPrice"
          type="number"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          placeholder="e.g., 99.99"
          required
          min="0"
          step="0.01"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-sky-500"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="productImageUrl" className="text-slate-300">Image URL (Optional)</Label>
        <Input
          id="productImageUrl"
          value={productImageUrl}
          onChange={(e) => setProductImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-sky-500"
        />
      </div>
    </div>
  );
};

export default PricingAndImageSection;
