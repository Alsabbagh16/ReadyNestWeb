
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { findUserById, adminUpdateUserProfile, getUserNotes, saveUserNotes } from '@/lib/storage/userStorage';
import { getBookingsByUserId } from '@/lib/storage/bookingStorage';
import { services, personalSubscriptionPlans, businessSubscriptionPlans } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Mail, Calendar, Briefcase, CreditCard, Edit, MapPin, FileText, UploadCloud, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EditUserForm from '@/components/AdminDashboard/EditUserForm';

const formatDateSafe = (dateString) => {
    try {
        if (!dateString || isNaN(new Date(dateString).getTime())) return 'N/A';
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};

const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'success';
        case 'in-progress': return 'default';
        case 'scheduled': return 'outline';
        case 'pending': return 'secondary';
        case 'cancelled': return 'destructive';
        case 'quote requested': return 'secondary';
        case 'refunded': return 'destructive';
        default: return 'secondary';
    }
};

const AdminUserProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userData = await findUserById(id);
            if (userData) {
                setUser(userData);
                const userNotes = await getUserNotes(id);
                setNotes(userNotes || '');
                const bookings = await getBookingsByUserId(id);
                bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setPurchaseHistory(bookings);
            } else {
                toast({ title: "Error", description: "User not found.", variant: "destructive" });
                navigate('/admin-dashboard/accounts');
            }
        } catch (error) {
             toast({ title: "Error", description: `Failed to fetch user data: ${error.message}`, variant: "destructive" });
        } finally {
            setLoading(false);
            setIsEditDialogOpen(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);


    const handleSaveUser = async (userData) => {
        try {
            await adminUpdateUserProfile(userData.id, userData);
            toast({ title: "User Updated", description: `Details for ${userData.email} saved.` });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: `Could not update user: ${error.message}`, variant: "destructive" });
        }
    };

    const handleSaveNotes = async () => {
        try {
            await saveUserNotes(id, notes);
            toast({ title: "Notes Saved", description: "User notes have been updated." });
        } catch (error) {
            toast({ title: "Error Saving Notes", description: error.message, variant: "destructive" });
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            toast({
                title: "File Selected",
                description: `${file.name} ready for upload (feature not fully implemented).`,
            });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getServiceName = (serviceId) => services.find(s => s.id === serviceId)?.name || 'N/A';
    const getPlanName = (planId, planCategory) => {
        if (!planId) return 'Single Cleaning';
        const plans = planCategory === 'business' ? businessSubscriptionPlans : personalSubscriptionPlans;
        return plans.find(p => p.id === planId)?.name || 'Unknown Plan';
    };

    if (loading) return <div className="p-6">Loading user profile...</div>;
    if (!user) return <div className="p-6">User not found.</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Accounts List
                </Button>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update the details for {user.email}.</DialogDescription>
                        </DialogHeader>
                        <EditUserForm user={user} onSave={handleSaveUser} onCancel={() => setIsEditDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</CardTitle>
                    <CardDescription>{user.user_type || 'Personal'} User</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">User Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center"><Mail className="h-4 w-4 mr-1 text-gray-500" /> <strong>Email:</strong> {user.email}</div>
                            <div className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-gray-500" /> <strong>DOB:</strong> {formatDateSafe(user.dob)}</div>
                            <div className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-gray-500" /> <strong>Joined:</strong> {formatDateSafe(user.created_at)}</div>
                            <div className="flex items-center"><CreditCard className="h-4 w-4 mr-1 text-gray-500" /> <strong>Credits:</strong> {user.credits || 0}</div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">Saved Addresses</h3>
                        {user.addresses && user.addresses.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {user.addresses.map((addr) => (
                                    <div key={addr.id} className="text-sm p-3 border rounded bg-gray-50/50">
                                        <p className="font-medium flex items-center"><MapPin className="h-4 w-4 mr-1 text-gray-500" />{addr.label || addr.street || 'Address'}</p>
                                        <p className="text-xs text-muted-foreground pl-5">{addr.street}<br />{addr.city}, {addr.state} {addr.zip_code}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">No saved addresses found.</p>}
                    </section>
                    
                    <section>
                        <div className="flex justify-between items-center border-b pb-2 mb-3">
                           <h3 className="font-semibold text-lg">Admin Notes</h3>
                           <Button size="sm" variant="outline" onClick={handleSaveNotes}>
                               <Save className="mr-2 h-4 w-4" /> Save Notes
                           </Button>
                        </div>
                        <Textarea
                            placeholder="Enter private notes for this user (visible to admins only)..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                        />
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">Purchase History</h3>
                        {purchaseHistory.length > 0 ? (
                            <div className="overflow-x-auto border rounded-md">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Ref No.</TableHead><TableHead>Date</TableHead><TableHead>Service</TableHead><TableHead>Plan</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {purchaseHistory.map(booking => (
                                            <TableRow key={booking.id}>
                                                <TableCell><Link to={`/admin-dashboard/service/${booking.id}`} className="text-blue-600 hover:underline font-mono">{booking.reference_number ? booking.reference_number.substring(0, 6) : booking.id.substring(0,6)}</Link></TableCell>
                                                <TableCell>{formatDateSafe(booking.created_at)}</TableCell>
                                                <TableCell>{getServiceName(booking.service_type)}</TableCell>
                                                <TableCell>{getPlanName(booking.service_details?.planId, booking.service_details?.planCategory)}</TableCell>
                                                <TableCell>{booking.paid_with_credits > 0 ? `${booking.paid_with_credits} Credits` : `${booking.price?.toFixed(2) || '0.00'}`}{booking.status === 'refunded' && <span className="text-red-600 ml-1">(R)</span>}</TableCell>
                                                <TableCell><Badge variant={getStatusBadgeVariant(booking.service_status)} className="capitalize">{booking.service_status || 'Unknown'}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : <p className="text-sm text-gray-500">No purchase history found.</p>}
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">User Documents</h3>
                        <div className="p-4 border border-dashed rounded-md text-center">
                            <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">Upload relevant documents for this user.</p>
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
                            </Button>
                            <Input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload} 
                                accept=".pdf,.doc,.docx,.jpg,.png" 
                            />
                            <p className="text-xs text-gray-400 mt-2">Max file size: 5MB. Allowed types: PDF, DOC, PNG, JPG.</p>
                            <div className="mt-3 text-sm text-gray-500">
                                No documents uploaded yet.
                            </div>
                        </div>
                    </section>

                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUserProfilePage;
  