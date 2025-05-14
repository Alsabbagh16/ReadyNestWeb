
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { findEmployeeById, updateEmployee } from '@/lib/storage/employeeStorage';
import { getBookingsByEmployeeId } from '@/lib/storage/bookingStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Phone, Mail, Briefcase, CalendarDays, Edit3, UploadCloud, FileText, ShieldAlert, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import EmployeeDialog from '@/components/AdminDashboard/EmployeeDialog';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const InfoRow = ({ icon, label, value, className }) => (
  <div className={`flex items-start space-x-3 ${className}`}>
    <div className="flex-shrink-0 text-primary pt-0.5">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-sm text-gray-800 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

const formatDateSafe = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
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
        default: return 'secondary';
    }
};

const getInitials = (name) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
};

const AdminEmployeeProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { adminProfile } = useAdminAuth();

    const [employee, setEmployee] = useState(null);
    const [assignedServices, setAssignedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [formError, setFormError] = useState(null);

    const canManageEmployees = adminProfile && (adminProfile.role === 'admin' || adminProfile.role === 'superadmin');

    const fetchEmployeeData = useCallback(async () => {
        setLoading(true);
        try {
            const empData = await findEmployeeById(id);
            if (empData) {
                setEmployee(empData);
                const bookings = await getBookingsByEmployeeId(id);
                setAssignedServices(bookings || []);
            } else {
                toast({ title: "Error", description: "Employee not found.", variant: "destructive" });
                navigate('/admin-dashboard/employees');
            }
        } catch (error) {
            toast({ title: "Error Fetching Data", description: error.message, variant: "destructive" });
            navigate('/admin-dashboard/employees');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, toast]);

    useEffect(() => {
        fetchEmployeeData();
    }, [fetchEmployeeData]);

    const handleSaveEmployee = async (employeeData) => {
        if (!canManageEmployees) {
            toast({ title: "Permission Denied", description: "You do not have permission to edit employees.", variant: "destructive" });
            return;
        }
        setFormError(null);
        try {
            await updateEmployee(employeeData);
            toast({ title: "Employee Updated", description: `Details for ${employeeData.fullName || employeeData.email} saved.` });
            setIsEditDialogOpen(false);
            fetchEmployeeData(); 
        } catch (error) {
            let errorMessage = error.message || "An unexpected error occurred.";
            toast({ title: "Error Saving Employee", description: errorMessage, variant: "destructive" });
            setFormError(errorMessage);
        }
    };
    
    const handleDocumentUpload = (file) => {
        toast({
            title: "Document Upload (Conceptual)",
            description: `File "${file.name}" selected. Actual upload to Supabase Storage requires further implementation.`,
        });
        // In a real scenario:
        // 1. Upload file to Supabase Storage (e.g., in a bucket like 'employee-documents/{employeeId}/{fileName}')
        // 2. Get the public URL or file path.
        // 3. Update the 'employees' table (or a separate 'employee_documents' table) with metadata (file name, path/URL, type, upload date).
        // Example: await uploadEmployeeDocument(employee.id, file);
        //          fetchEmployeeData(); // to refresh document list
    };


    if (loading) {
        return <div className="p-6 text-center">Loading employee profile...</div>;
    }

    if (!employee) {
        return <div className="p-6 text-center">Employee not found.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => navigate('/admin-dashboard/employees')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees
                </Button>
                {canManageEmployees && (
                    <Button size="sm" onClick={() => setIsEditDialogOpen(true)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Employee
                    </Button>
                )}
            </div>
             {!canManageEmployees && (
                 <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-center">
                    <ShieldAlert className="h-5 w-5 mr-2" />
                    <p className="text-sm">Your role ('staff') does not permit editing employee details.</p>
                </div>
            )}

            <Card className="overflow-hidden shadow-lg border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground p-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20 border-2 border-white">
                            <AvatarImage src={employee.photo_url || undefined} alt={employee.full_name || 'Employee'} />
                            <AvatarFallback className="text-2xl bg-primary-foreground text-primary">{getInitials(employee.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl font-bold">{employee.full_name || 'Employee'}</CardTitle>
                            <CardDescription className="text-primary-foreground/80 text-lg">{employee.position || 'N/A'}</CardDescription>
                            <Badge variant={employee.role === 'superadmin' || employee.role === 'admin' ? 'default' : 'secondary'} className="capitalize mt-1">
                                {employee.role}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoRow icon={<Mail size={18} />} label="Email Address" value={employee.email} />
                    <InfoRow icon={<Phone size={18} />} label="Mobile" value={employee.mobile} />
                    <InfoRow icon={<User size={18} />} label="Employee ID" value={employee.id} className="md:col-span-2"/>
                    <InfoRow icon={<MapPin size={18} />} label="Address" value={employee.address} className="md:col-span-2"/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Personal & Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoRow icon={<User size={18} />} label="Origin Country" value={employee.origin} />
                    <InfoRow icon={<User size={18} />} label="Sex" value={employee.sex} />
                    <InfoRow icon={<CalendarDays size={18} />} label="Date of Birth" value={formatDateSafe(employee.date_of_birth)} />
                    <InfoRow icon={<CalendarDays size={18} />} label="Hire Date" value={formatDateSafe(employee.hire_date)} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Documents</CardTitle>
                     {canManageEmployees && (
                        <label htmlFor="document-upload-input">
                            <Button size="sm" variant="outline" asChild>
                                <span><UploadCloud className="mr-2 h-4 w-4" /> Upload Document</span>
                            </Button>
                            <input 
                                id="document-upload-input" 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => e.target.files && e.target.files.length > 0 && handleDocumentUpload(e.target.files[0])} 
                            />
                        </label>
                    )}
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoRow icon={<FileText size={18} />} label="Passport Number" value={employee.passport_number} />
                    <InfoRow icon={<CalendarDays size={18} />} label="Passport Issue Date" value={formatDateSafe(employee.passport_issue_date)} />
                    <InfoRow icon={<CalendarDays size={18} />} label="Passport Expiry Date" value={formatDateSafe(employee.passport_expiry_date)} />
                    <InfoRow icon={<FileText size={18} />} label="Visa Number" value={employee.visa_number || 'N/A'} />
                    <InfoRow icon={<CalendarDays size={18} />} label="Visa Issuance Date" value={formatDateSafe(employee.visa_issuance_date)} />
                    <InfoRow icon={<CalendarDays size={18} />} label="Visa Expiry Date" value={formatDateSafe(employee.visa_expiry_date)} />
                    {/* Placeholder for listing uploaded documents */}
                    {/* <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600 mb-1">Uploaded Files:</p>
                        {employee.documents && employee.documents.length > 0 ? (
                            <ul className="list-disc pl-5 text-sm">
                                {employee.documents.map(doc => <li key={doc.id}>{doc.name}</li>)}
                            </ul>
                        ) : <p className="text-sm text-gray-500">No documents uploaded yet.</p>}
                    </div> */}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Assigned Services</CardTitle>
                </CardHeader>
                <CardContent>
                    {assignedServices.length > 0 ? (
                        <div className="overflow-x-auto border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ref No.</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedServices.slice(0, 10).map(service => (
                                        <TableRow key={service.id}>
                                            <TableCell>
                                                <Link to={`/admin-dashboard/service/${service.id}`} className="text-blue-600 hover:underline">
                                                    {service.id.substring(0, 8)}...
                                                </Link>
                                            </TableCell>
                                            <TableCell>{formatDateSafe(service.date)}</TableCell>
                                            <TableCell>{service.time || 'N/A'}</TableCell>
                                            <TableCell className="truncate max-w-[200px]">{service.address}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(service.service_status)} className="capitalize">
                                                    {service.service_status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No services assigned recently.</p>
                    )}
                </CardContent>
            </Card>

            {isEditDialogOpen && canManageEmployees && (
                <EmployeeDialog
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    editingEmployee={employee}
                    onSave={handleSaveEmployee}
                    formError={formError}
                    setFormError={setFormError}
                />
            )}
        </div>
    );
};

export default AdminEmployeeProfilePage;
  