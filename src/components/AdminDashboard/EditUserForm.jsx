
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from 'lucide-react';

const EditUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: user?.id || '', // Keep ID for update reference
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    dob: user?.dob || '',
    userType: user?.userType || 'Personal',
    credits: user?.credits || 0,
    password: '', // Always start empty for security
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

   const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, userType: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
        alert("First Name, Last Name, and Email are required.");
        return;
    }
    const creditsNum = parseInt(formData.credits, 10);
    if (isNaN(creditsNum) || creditsNum < 0) {
        alert("Credits must be a non-negative number.");
        return;
    }
    // Password is optional when editing
    const dataToSave = { ...formData, credits: creditsNum };
    if (!dataToSave.password) {
        delete dataToSave.password; // Don't send empty password
    }

    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-firstName">First Name</Label>
            <Input id="edit-firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="edit-lastName">Last Name</Label>
            <Input id="edit-lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={!!user} />
             {user && <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>}
          </div>
           <div>
            <Label htmlFor="edit-dob">Date of Birth</Label>
            <Input id="edit-dob" name="dob" type="date" value={formData.dob} onChange={handleChange} />
          </div>
           <div>
            <Label htmlFor="edit-userType">User Type</Label>
             <Select name="userType" value={formData.userType} onValueChange={handleSelectChange}>
                <SelectTrigger id="edit-userType">
                    <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="edit-credits">Credits</Label>
            <Input id="edit-credits" name="credits" type="number" min="0" value={formData.credits} onChange={handleChange} required />
          </div>
           <div className="relative md:col-span-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                  id="edit-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
              />
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-6 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
              >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
      </div>
      <DialogFooter className="pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};

export default EditUserForm;
  