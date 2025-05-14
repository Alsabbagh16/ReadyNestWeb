
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';

const EmployeeFormFields = ({ formData, handleChange, isEditingEmployee, showNewPassword, setShowNewPassword, showConfirmPassword, setShowConfirmPassword }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isEditingEmployee && (
            <>
                <div>
                    <Label htmlFor="emp-id">Employee ID (Supabase Auth User ID)</Label>
                    <Input id="emp-id" name="id" value={formData.id} onChange={handleChange} required placeholder="UUID from Supabase Auth" />
                </div>
                <div>
                    <Label htmlFor="emp-email">Email (Must match Supabase Auth)</Label>
                    <Input id="emp-email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
            </>
        )}
        {isEditingEmployee && (
             <div>
                <Label htmlFor="emp-email-display">Email</Label>
                <Input id="emp-email-display" name="email" type="email" value={formData.email} readOnly disabled className="bg-gray-100" />
            </div>
        )}
        <div>
          <Label htmlFor="emp-fullName">Full Name</Label>
          <Input id="emp-fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="emp-mobile">Mobile</Label>
          <Input id="emp-mobile" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="emp-address">Address</Label>
          <Input id="emp-address" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="emp-position">Position</Label>
          <Input id="emp-position" name="position" value={formData.position} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="emp-role">Role</Label>
          <select 
            id="emp-role" 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="staff">Staff</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
         <div>
          <Label htmlFor="emp-origin">Origin (Country)</Label>
          <Input id="emp-origin" name="origin" value={formData.origin} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-sex">Sex</Label>
          <Input id="emp-sex" name="sex" value={formData.sex} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-dateOfBirth">Date of Birth</Label>
          <Input id="emp-dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-passportNumber">Passport Number</Label>
          <Input id="emp-passportNumber" name="passportNumber" value={formData.passportNumber} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-passportIssueDate">Passport Issue Date</Label>
          <Input id="emp-passportIssueDate" name="passportIssueDate" type="date" value={formData.passportIssueDate} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-passportExpiryDate">Passport Expiry Date</Label>
          <Input id="emp-passportExpiryDate" name="passportExpiryDate" type="date" value={formData.passportExpiryDate} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-hireDate">Hire Date</Label>
          <Input id="emp-hireDate" name="hireDate" type="date" value={formData.hireDate} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="emp-visaNumber">Visa Number</Label>
          <Input id="emp-visaNumber" name="visaNumber" value={formData.visaNumber} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-visaIssuanceDate">Visa Issuance Date</Label>
          <Input id="emp-visaIssuanceDate" name="visaIssuanceDate" type="date" value={formData.visaIssuanceDate} onChange={handleChange} />
        </div>
         <div>
          <Label htmlFor="emp-visaExpiryDate">Visa Expiry Date</Label>
          <Input id="emp-visaExpiryDate" name="visaExpiryDate" type="date" value={formData.visaExpiryDate} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="emp-photoUrl">Photo URL</Label>
          <Input id="emp-photoUrl" name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="https://example.com/image.png"/>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Set/Update Password</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isEditingEmployee ? "Leave blank to keep current password." : "Set an initial password for the new employee."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative space-y-2">
                <Label htmlFor="emp-newPassword">New Password</Label>
                <Input 
                    id="emp-newPassword" 
                    name="newPassword" 
                    type={showNewPassword ? "text" : "password"} 
                    value={formData.newPassword} 
                    onChange={handleChange}
                    placeholder={!isEditingEmployee ? "Required for new employee" : "Enter new password"}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-6 h-7 w-7"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
            <div className="relative space-y-2">
                <Label htmlFor="emp-confirmNewPassword">Confirm New Password</Label>
                <Input 
                    id="emp-confirmNewPassword" 
                    name="confirmNewPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={formData.confirmNewPassword} 
                    onChange={handleChange} 
                    placeholder={!isEditingEmployee ? "Confirm password" : "Confirm new password"}
                />
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-6 h-7 w-7"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeFormFields;
  