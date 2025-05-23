
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductInfoSection = ({
  productName, setProductName,
  productType, setProductType, productTypeOptions,
  propertyType, setPropertyType, propertyTypeOptions,
  size, setSize, sizeOptions,
  productDescription, setProductDescription,
  selectedCategoryId, setSelectedCategoryId, categories, isFetchingCategories,
  newCategoryName, setNewCategoryName,
  productValue, setProductValue
}) => {

  const renderSelectField = (id, label, value, onValueChange, placeholder, options, isLoadingOptions, loadingText, allowNew = false, newOptionLabel = "Create New") => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-300">{label}</Label>
      {isLoadingOptions ? (
        <div className="flex items-center text-slate-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {loadingText}
        </div>
      ) : (
        <Select onValueChange={onValueChange} value={value}>
          <SelectTrigger id={id} className="w-full bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-sky-500">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600 text-white">
            {options.map((opt) => (
              <SelectItem key={opt.value || opt.id} value={opt.value || opt.id} className="hover:bg-slate-600 focus:bg-slate-600">
                {opt.label || opt.name}
              </SelectItem>
            ))}
            {allowNew && (
              <SelectGroup>
                <SelectLabel className="text-slate-400">Or</SelectLabel>
                <SelectItem value="new_category" className="hover:bg-slate-600 focus:bg-slate-600">
                  <PlusCircle className="mr-2 h-4 w-4" /> {newOptionLabel}
                </SelectItem>
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderSelectField("category", "Product Category*", selectedCategoryId, setSelectedCategoryId, "Select a category or create new", categories, isFetchingCategories, "Loading categories...", true, "Create New Category")}

      {selectedCategoryId === 'new_category' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <Label htmlFor="newCategoryName" className="text-slate-300">New Category Name*</Label>
          <Input
            id="newCategoryName"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter new category name"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-sky-500"
          />
        </motion.div>
      )}

      <div className="space-y-2">
        <Label htmlFor="productName" className="text-slate-300">Product Name*</Label>
        <Input
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g., Premium Home Cleaning"
          required
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-sky-500"
        />
      </div>

      {renderSelectField("productType", "Type*", productType, setProductType, "Select product type", productTypeOptions, false, "")}
      {renderSelectField("propertyType", "Property Type*", propertyType, setPropertyType, "Select property type", propertyTypeOptions, false, "")}
      {renderSelectField("size", "Size*", size, setSize, "Select size", sizeOptions, false, "")}
      
      <div className="space-y-2">
        <Label htmlFor="productDescription" className="text-slate-300">Description</Label>
        <Textarea
          id="productDescription"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Detailed description of the service/product"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-sky-500 min-h-[100px]"
        />
      </div>

       <div className="space-y-2">
        <Label htmlFor="productValue" className="text-slate-300">Value (integer)*</Label>
        <Input
          id="productValue"
          type="number"
          value={productValue}
          onChange={(e) => setProductValue(e.target.value)}
          placeholder="e.g., 100 (used for sorting or internal weighting)"
          required
          min="0"
          step="1"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:ring-sky-500"
        />
      </div>
    </div>
  );
};

export default ProductInfoSection;
