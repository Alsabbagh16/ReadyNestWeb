
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const ProfileDetailsForm = ({ initialData, onSave, onCancel, authLoading, isEditing, setIsEditing, userProvider }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [userType, setUserType] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (initialData.profile) {
      setFirstName(initialData.profile.first_name || '');
      setLastName(initialData.profile.last_name || '');
      setDob(initialData.profile.dob || '');
      setUserType(initialData.profile.user_type || 'Personal');
    }
    if (initialData.user) {
      setEmail(initialData.user.email || ''); 
    }
    
    if (!isEditing) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    }
  }, [initialData, isEditing]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let dataToUpdate = { 
        first_name: firstName, 
        last_name: lastName, 
        dob, 
    };

    if (newPassword) {
        if (userProvider === 'email' && !currentPassword) {
             toast({ title: "Error", description: "Please enter your current password to change it.", variant: "destructive" });
             return;
        }
        if (newPassword !== confirmNewPassword) {
            toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
            return;
        }
        dataToUpdate.password = newPassword;
    }
    
    try {
      await onSave(dataToUpdate);
      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
       // Error toast is handled in updateProfile
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    onCancel();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
            <Label htmlFor="dash-firstName">First Name</Label>
            <Input id="dash-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing || authLoading} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dash-lastName">Last Name</Label>
            <Input id="dash-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing || authLoading} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dash-email">Email</Label>
            <div className="relative">
              <Input id="dash-email" type="email" value={email} disabled />
              {!initialData.user?.email_confirmed_at && (
                <Badge variant="warning" className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-100 text-yellow-800">
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">Contact support to change your email.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dash-dob">Date of Birth</Label>
            <Input id="dash-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={!isEditing || authLoading} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Account Type</Label>
            <Input value={userType} disabled />
            <p className="text-xs text-gray-500">Contact support to change your account type.</p>
          </div>
      </div>

      {isEditing && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-2">Change Password</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {userProvider !== 'email' ? "Password changes for social logins are handled by the provider." : "Leave fields blank to keep your current password."}
            </p>
            {userProvider === 'email' && (
              <div className="space-y-4">
                <div className="relative space-y-2">
                  <Label htmlFor="current-password">Current Password (if changing password)</Label>
                  <Input id="current-password" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={authLoading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)} tabIndex={-1}>
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="relative space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={authLoading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="relative space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input id="confirm-new-password" type={showConfirmPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={authLoading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-6 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        {isEditing ? (
          <>
            <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={authLoading}>Cancel</Button>
            <Button type="submit" disabled={authLoading}>{authLoading ? 'Saving...' : 'Save Changes'}</Button>
          </>
        ) : (
          <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </div>
    </form>
  );
};

const AccountInfoTab = () => {
  const { profile, updateProfile, loading: authLoading, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [initialFormData, setInitialFormData] = useState({ profile: null, user: null });

  useEffect(() => {
    setInitialFormData({ profile, user });
  }, [profile, user]);
  
  const handleResetForm = useCallback(() => {
      setInitialFormData({ profile, user });
  }, [profile, user]);

  if (authLoading && !profile && !user) return <div className="p-6">Loading user data...</div>;
  if (!profile && !user) return <div className="p-6">No user data found.</div>;

  return (
     <Card className="border-0 shadow-none rounded-none">
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Account Information
              {!user?.email_confirmed_at && (
                <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
                  Email Not Verified
                </Badge>
              )}
            </CardTitle>
            <CardDescription>View and update your personal details and password.</CardDescription>
        </CardHeader>
        <CardContent>
            <ProfileDetailsForm
                initialData={initialFormData}
                onSave={updateProfile}
                onCancel={handleResetForm}
                authLoading={authLoading}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                userProvider={user?.app_metadata?.provider || 'email'}
            />
        </CardContent>
     </Card>
  );
};

export default AccountInfoTab;
