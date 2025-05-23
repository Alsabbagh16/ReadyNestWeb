
import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selections, setSelections] = useState({
    propertyType: null, 
    homeSize: null,     
    cleaningType: null, 
  });
  const [matchedProduct, setMatchedProduct] = useState(null); 
  const [loadingProductMatch, setLoadingProductMatch] = useState(false);
  const { toast } = useToast();

  const updateSelection = useCallback((stepKey, value) => {
    setSelections(prev => {
      let newSelections = { ...prev, [stepKey]: value };
      if (stepKey === 'propertyType') {
        newSelections.homeSize = null;
        newSelections.cleaningType = null;
        setMatchedProduct(null); 
      } else if (stepKey === 'homeSize') {
        newSelections.cleaningType = null;
        setMatchedProduct(null); 
      } else if (stepKey === 'cleaningType') {
        setMatchedProduct(null); 
      }
      return newSelections;
    });
  }, []);

  const findAndSetMatchingProduct = useCallback(async () => {
    if (!selections.propertyType || !selections.homeSize || !selections.cleaningType) {
      setMatchedProduct(null); 
      console.log("[BookingContext] Pre-flight check failed: Not all selections made.", selections);
      return null;
    }

    setLoadingProductMatch(true);
    setMatchedProduct(null);

    let dbPropertyType;
    if (selections.propertyType === 'home') {
      dbPropertyType = "Home";
    } else if (selections.propertyType === 'airbnb') {
      dbPropertyType = "airbnb"; 
    } else {
      dbPropertyType = selections.propertyType; 
    }

    let dbHomeSize; 
    if (selections.homeSize === 'small') {
      dbHomeSize = "Small";
    } else if (selections.homeSize === 'medium') {
      dbHomeSize = "Medium";
    } else if (selections.homeSize === 'large') {
      dbHomeSize = "Large";
    } else {
      dbHomeSize = selections.homeSize; 
    }
    
    let dbCleaningType; 
    if (selections.cleaningType === 'one-time') {
        dbCleaningType = "one_time_service"; 
    } else if (selections.cleaningType === 'recurring') {
        dbCleaningType = "recurring_service"; 
    } else {
        dbCleaningType = selections.cleaningType; 
    }

    console.log("--- [BookingContext] Debug: Matching Criteria ---");
    console.log(`UI Selections: propertyType='${selections.propertyType}', homeSize='${selections.homeSize}', cleaningType='${selections.cleaningType}'`);
    console.log(`DB Query Values: property_type ILIKE '${dbPropertyType}', size ILIKE '${dbHomeSize}', type ILIKE '${dbCleaningType}'`);
    console.log("--------------------------------------------------");

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          property_type, 
          size, 
          type,
          product_addon_links (
            addon_templates (id, name, price, is_required)
          )
        `) 
        .ilike('property_type', dbPropertyType)
        .ilike('size', dbHomeSize)
        .ilike('type', dbCleaningType) 
        .eq('isActive', true) 
        .maybeSingle(); 

      console.log("--- [BookingContext] Debug: Supabase Query Result ---");
      if (productError) {
        console.error("Supabase query error object:", JSON.stringify(productError, null, 2));
      } else {
        console.log("Supabase query data object:", JSON.stringify(productData, null, 2));
      }
      console.log("----------------------------------------------------");

      if (productError) {
        throw productError;
      }

      if (productData) {
        const linkedAddons = productData.product_addon_links.map(link => link.addon_templates).filter(Boolean);
        const productWithLinkedAddons = { ...productData, linked_addons: linkedAddons };
        delete productWithLinkedAddons.product_addon_links; // Clean up the original links structure

        setMatchedProduct(productWithLinkedAddons); 
        toast({
          title: "Service Matched!",
          description: `We found the "${productData.name}" service for your selections. Price: ${productData.price}`,
        });
        console.log(`[BookingContext] Match Found: Product ID - ${productData.id}, Name - "${productData.name}", Price - ${productData.price}`);
        console.log(`[BookingContext] DB Values Matched: property_type='${productData.property_type}', size='${productData.size}', type='${productData.type}'`);
        console.log(`[BookingContext] Linked Addons:`, linkedAddons);
        setLoadingProductMatch(false);
        return productWithLinkedAddons; 
      } else {
        toast({
          title: "No Exact Match Found",
          description: "We couldn't find an exact service for your selections. You can still proceed with a general booking, or contact us for custom options.",
          variant: "default",
          duration: 7000,
        });
        console.log(`[BookingContext] No exact match found for the criteria.`);
        setLoadingProductMatch(false);
        return null;
      }
    } catch (error) {
      console.error("[BookingContext] Error finding matching product:", error.message);
      toast({
        title: "Error Matching Service",
        description: "There was an issue finding a matching service. " + error.message,
        variant: "destructive",
      });
      console.log(`[BookingContext] Error during matching: ${error.message}`);
      setLoadingProductMatch(false);
      return null;
    }
  }, [selections, toast]);

  const resetSelections = useCallback(() => {
    setSelections({
      propertyType: null,
      homeSize: null,
      cleaningType: null,
    });
    setMatchedProduct(null);
  }, []);

  const value = {
    selections,
    matchedProduct, 
    loadingProductMatch,
    updateSelection,
    findAndSetMatchingProduct,
    resetSelections,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
