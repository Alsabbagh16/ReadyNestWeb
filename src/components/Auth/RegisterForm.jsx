
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [userType, setUserType] = useState('home_owner');
  const [notRobot, setNotRobot] = useState(false);

  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive"
      });
      return;
    }

    try {
      await signup(email, password, {
        first_name: firstName,
        last_name: lastName,
        dob: dob,
        user_type: userType,
        credits: 0, // Default credits on signup
      });
       const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect');
      const step = searchParams.get('step');
      if (redirectPath) {
        const targetPath = step ? `${redirectPath}?step=${step}` : redirectPath;
        navigate(targetPath, { replace: true });
      } else {
        // Toast for successful registration is handled by useAuthCore hook after email confirmation
      }
    } catch (error) {
      // Error toast is handled by useAuthCore
      console.error("Registration failed in RegisterForm:", error);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input
          id="first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input
          id="last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
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
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:[color-scheme:dark]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="user-type">Account Type</Label>
        <Select value={userType} onValueChange={setUserType}>
          <SelectTrigger className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-700">
            <SelectItem value="home_owner" className="dark:hover:bg-slate-700 dark:focus:bg-slate-700">Home Owner</SelectItem>
            <SelectItem value="property_manager" className="dark:hover:bg-slate-700 dark:focus:bg-slate-700">Property Manager</SelectItem>
            <SelectItem value="vacation_rental_owner" className="dark:hover:bg-slate-700 dark:focus:bg-slate-700">Vacation Rental Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
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
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="not-robot" 
          checked={notRobot}
          onCheckedChange={setNotRobot}
          required
          className="dark:border-slate-700 data-[state=checked]:dark:bg-primary data-[state=checked]:dark:text-primary-foreground"
        />
        <Label htmlFor="not-robot" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">
          I am not a robot
        </Label>
      </div>
      
      <Button type="submit" className="w-full">Create Account</Button>
    </form>
  );
};

export default RegisterForm;
