
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Step1PropertyType from '@/components/BookingProcess/Step1PropertyType';
import Step2HomeSize from '@/components/BookingProcess/Step2HomeSize';
import Step3CleaningType from '@/components/BookingProcess/Step3CleaningType';
import BookingSummaryPage from '@/components/BookingProcess/BookingSummaryPage';

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState({
    propertyType: null,
    homeSize: null,
    cleaningType: null,
  });
  const [addonTemplates, setAddonTemplates] = useState([]);
  const { toast } = useToast();

  const totalStepsForHome = 3;
  const totalStepsForAirbnb = 1; 

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const { data, error } = await supabase.from('addon_templates').select('*');
        if (error) throw error;
        setAddonTemplates(data || []);
      } catch (error) {
        toast({
          title: "Error fetching addons",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    if (currentStep === 'summary') {
      fetchAddons();
    }
  }, [currentStep, toast]);

  const handleNext = () => {
    if (selections.propertyType === 'home') {
      if (currentStep === 1 && selections.propertyType) setCurrentStep(2);
      else if (currentStep === 2 && selections.homeSize) setCurrentStep(3);
      else if (currentStep === 3 && selections.cleaningType) setCurrentStep('summary');
    } else if (selections.propertyType === 'airbnb') {
      if (currentStep === 1 && selections.propertyType) setCurrentStep('summary');
    }
  };

  const handleBack = () => {
    if (currentStep === 'summary') {
      setCurrentStep(selections.propertyType === 'home' ? 3 : 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateSelection = (stepKey, value) => {
    let newSelections = { ...selections, [stepKey]: value };
    if (stepKey === 'propertyType') {
      newSelections.homeSize = null;
      newSelections.cleaningType = null;
    } else if (stepKey === 'homeSize') {
      newSelections.cleaningType = null;
    }
    setSelections(newSelections);
  };

  const isNextDisabled = () => {
    if (currentStep === 1 && !selections.propertyType) return true;
    if (selections.propertyType === 'home') {
      if (currentStep === 2 && !selections.homeSize) return true;
      if (currentStep === 3 && !selections.cleaningType) return true;
    }
    return false;
  };
  
  const getProgress = () => {
    if (currentStep === 'summary') return 100;
    const completedSteps = currentStep -1;
    const totalProcessSteps = selections.propertyType === 'home' ? totalStepsForHome : totalStepsForAirbnb;
    return (completedSteps / totalProcessSteps) * 100;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {currentStep !== 'summary' && (
          <Progress value={getProgress()} className="w-full h-3 mb-8 [&>div]:bg-primary" />
        )}
        
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1PropertyType key="step1" onSelect={(val) => updateSelection('propertyType', val)} currentSelection={selections.propertyType} />
          )}
          {currentStep === 2 && selections.propertyType === 'home' && (
            <Step2HomeSize key="step2" onSelect={(val) => updateSelection('homeSize', val)} currentSelection={selections.homeSize} />
          )}
          {currentStep === 3 && selections.propertyType === 'home' && (
            <Step3CleaningType key="step3" onSelect={(val) => updateSelection('cleaningType', val)} currentSelection={selections.cleaningType} />
          )}
          {currentStep === 'summary' && (
            <BookingSummaryPage key="summary" selections={selections} addonTemplates={addonTemplates} />
          )}
        </AnimatePresence>

        <div className="flex justify-between pt-8">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 1} 
            className="bg-card hover:bg-muted/50 border-border text-foreground px-6 py-3 text-base"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Back
          </Button>
          {currentStep !== 'summary' && (
            <Button 
              onClick={handleNext} 
              disabled={isNextDisabled()} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base font-semibold"
            >
              Next <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
  