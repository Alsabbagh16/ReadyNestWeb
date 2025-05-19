
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from 'lucide-react';
import { getCategories, addProduct, addCategory } from '@/lib/storage/productStorage'; // Placeholder functions

const AdminCreateProductPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // This will use the placeholder function until Supabase is integrated
        const fetchedCategories = await getCategories(); 
        setCategories(fetchedCategories);
      } catch (error) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    fetchCategories();
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!productName || !productPrice) {
        toast({ title: "Validation Error", description: "Product Name and Price are required.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    let categoryIdToUse = selectedCategory;

    try {
      // If a new category is being created
      if (selectedCategory === 'new_category' && newCategoryName) {
        // This will use the placeholder function
        const newCategory = await addCategory({ name: newCategoryName }); 
        categoryIdToUse = newCategory.id; 
        toast({ title: "Category Created", description: `Category "${newCategoryName}" created.` });
      } else if (selectedCategory === 'new_category' && !newCategoryName) {
        toast({ title: "Validation Error", description: "Please enter a name for the new category.", variant: "destructive" });
        setIsLoading(false);
        return;
      } else if (!selectedCategory) {
         toast({ title: "Validation Error", description: "Please select or create a category.", variant: "destructive" });
        setIsLoading(false);
        return;
      }


      const productData = {
        category_id: categoryIdToUse,
        name: productName,
        type: productType,
        description: productDescription,
        price: parseFloat(productPrice),
        image_url: productImageUrl,
      };
      
      // This will use the placeholder function
      await addProduct(productData); 

      toast({
        title: "Product Created",
        description: `Product "${productName}" has been successfully created.`,
      });
      navigate('/admin-dashboard/manage-services');
    } catch (error) {
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/manage-services')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Services
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Create New Product/Service</CardTitle>
          <CardDescription>Fill in the details for the new product or service.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="product-category">Product Category</Label>
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="Select a category or create new" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new_category">Create new category...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCategory === 'new_category' && (
              <div>
                <Label htmlFor="new-category-name">New Category Name</Label>
                <Input
                  id="new-category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter name for the new category"
                />
              </div>
            )}

            <div>
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="product-type">Type (e.g., Cleaning, Repair, Consultation)</Label>
              <Input
                id="product-type"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="product-image-url">Image URL</Label>
              <Input
                id="product-image-url"
                value={productImageUrl}
                onChange={(e) => setProductImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateProductPage;
  