
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, adminUpdateUserProfile, deleteUser } from '@/lib/storage/userStorage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import EditUserForm from '@/components/AdminDashboard/EditUserForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const RegisteredAccountsTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      await adminUpdateUserProfile(userData.id, userData);
      toast({ title: "User Updated", description: `Details for ${userData.email} saved.` });
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers(); 
    } catch (error) {
      toast({ title: "Error", description: `Could not update user: ${error.message}`, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
     if (window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
        try {
            await deleteUser(userId); 
            toast({ title: "User Deleted", description: `${userEmail} removed.` });
            fetchUsers(); 
        } catch (error) {
            toast({ title: "Error", description: `Could not delete user: ${error.message}`, variant: "destructive" });
        }
     }
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };


  if (loading) {
    return <div className="p-6">Loading registered accounts...</div>;
  }

  return (
    <div className="p-6">
      {users.length === 0 ? (
        <p>No registered users found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                     <Link to={`/admin-dashboard/user/${user.id}`} className="text-blue-600 hover:underline">
                        {user.name || user.email}
                     </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.user_type || 'Personal'}</TableCell>
                  <TableCell>{user.credits || 0}</TableCell>
                  <TableCell>{user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}</TableCell>
                  <TableCell className="space-x-1 whitespace-nowrap">
                     <Dialog open={isDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                        if (!open) setEditingUser(null);
                        if (editingUser?.id === user.id) setIsDialogOpen(open);
                     }}>
                       <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                           <Edit className="h-4 w-4" />
                           <span className="sr-only">Edit</span>
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-lg">
                         <DialogHeader>
                           <DialogTitle>Edit User</DialogTitle>
                           <DialogDescription>
                             Update the details for {editingUser?.email}.
                           </DialogDescription>
                         </DialogHeader>
                         {editingUser && (
                             <EditUserForm
                               user={editingUser}
                               onSave={handleSaveUser}
                               onCancel={() => { setIsDialogOpen(false); setEditingUser(null); }}
                             />
                         )}
                       </DialogContent>
                     </Dialog>

                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleDeleteUser(user.id, user.email)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RegisteredAccountsTab;
  