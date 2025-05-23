
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const AddonLinkSection = ({
  addonTemplates, selectedAddonTemplateIds, handleAddonToggle, isFetchingAddons
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">Link Addon Templates</Label>
      {isFetchingAddons ? (
        <div className="flex items-center text-slate-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading addon templates...
        </div>
      ) : addonTemplates.length === 0 ? (
        <p className="text-slate-400 text-sm">No addon templates available. Create some first!</p>
      ) : (
        <div className="space-y-2 p-3 bg-slate-700/50 rounded-md border border-slate-600 max-h-60 overflow-y-auto">
          {addonTemplates.map(template => (
            <div key={template.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-600/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`addon-template-${template.id}`}
                  checked={selectedAddonTemplateIds.includes(template.id)}
                  onCheckedChange={() => handleAddonToggle(template.id)}
                  className="border-slate-500 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                />
                <Label htmlFor={`addon-template-${template.id}`} className="text-slate-300 cursor-pointer">
                  {template.name} (${template.price}) {template.is_required ? "(Required by template)" : ""}
                </Label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddonLinkSection;
