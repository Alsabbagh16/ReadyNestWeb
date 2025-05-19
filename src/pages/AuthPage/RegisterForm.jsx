
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [userType, setUserType] = useState('home_owner');
  const [notRobot, setNotRobot] = useState(false);

  const { signup } = useAuth();
  const { toast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!notRobot) {
      toast({
        title: "Verification Required",
        description: "Please confirm you are not a robot.",
        variant: "destructive"
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive"
      });
      return;
    }

    try {
      await signup(registerEmail, registerPassword, {
        first_name: firstName,
        last_name: lastName,
        dob: dob,
        user_type: userType,
        credits: 0, // Default credits
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      // Toast is handled by useAuthCore
    } catch (error) {
      console.error("Registration failed:", error);
      // Toast is handled by useAuthCore
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-type">Account Type</Label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home_owner">Home Owner</SelectItem>
                <SelectItem value="property_manager">Property Manager</SelectItem>
                <SelectItem value="vacation_rental_owner">Vacation Rental Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="not-robot" 
              checked={notRobot}
              onCheckedChange={setNotRobot}
              required
            />
            <Label htmlFor="not-robot" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I am not a robot
            </Label>
          </div>
          
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
  