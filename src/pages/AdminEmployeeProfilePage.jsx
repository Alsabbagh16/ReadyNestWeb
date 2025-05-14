
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { findEmployeeById } from '@/lib/storage/employeeStorage';
import { getBookingsByEmployeeId } from '@/lib/storage/bookingStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Calendar, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Helper function to format date or return 'N/A'
const formatDateSafe = (dateString) => {
    try {
        return dateString ? format(new Date(dateString), 'MMM d, yyyy') : 'N/A';
    } catch (error) {
        return 'Invalid Date';
    }
};

// Helper function to determine Badge variant based on status
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


const AdminEmployeeProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [assignedServices, setAssignedServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = () => {
        setLoading(true);
        setTimeout(() => { // Simulate fetch
            const empData = findEmployeeById(id);
            if (empData) {
                setEmployee(empData);
                setAssignedServices(getBookingsByEmployeeId(id));
            } else {
                // Handle employee not found - maybe navigate back or show error
                navigate('/admin-dashboard/employees');
            }
            setLoading(false);
        }, 300);
    };

    if (loading) {
        return <div className="p-6">Loading employee profile...</div>;
    }

    if (!employee) {
        return <div className="p-6">Employee not found.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees List
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                             <img  class="w-full h-full rounded-full object-cover" alt={`Profile photo of ${employee.fullName || employee.email}`} src="https://images.unsplash.com/photo-1544212408-c711b7c19b92" />
                        </div>
                        <div className="flex-grow">
                            <CardTitle className="text-2xl">{employee.fullName || 'N/A'}</CardTitle>
                            <CardDescription className="text-lg">{employee.position || 'N/A'}</CardDescription>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                                <span className="flex items-center"><Mail className="h-4 w-4 mr-1" /> {employee.email}</span>
                                <span className="flex items-center"><Phone className="h-4 w-4 mr-1" /> {employee.mobile}</span>
                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {employee.address}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Personal & Contact Info */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">Personal Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            <div><strong>Origin:</strong> {employee.origin || 'N/A'}</div>
                            <div><strong>Sex:</strong> {employee.sex || 'N/A'}</div>
                            <div><strong>Date of Birth:</strong> {formatDateSafe(employee.dateOfBirth)}</div>
                            <div><strong>Hire Date:</strong> {formatDateSafe(employee.hireDate)}</div>
                        </div>
                    </section>

                     {/* Passport & Visa Info */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">Documents</h3>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            <div><strong>Passport No:</strong> {employee.passportNumber || 'N/A'}</div>
                            <div><strong>Passport Issue:</strong> {formatDateSafe(employee.passportIssueDate)}</div>
                            <div><strong>Passport Expiry:</strong> {formatDateSafe(employee.passportExpiryDate)}</div>
                            <div><strong>Visa Issue:</strong> {formatDateSafe(employee.visaIssuanceDate)}</div>
                            <div><strong>Visa Expiry:</strong> {formatDateSafe(employee.visaExpiryDate)}</div>
                        </div>
                    </section>

                    {/* Assigned Services */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-3">Recent Assigned Services</h3>
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
                                        {assignedServices.slice(0, 10).map(service => ( // Show latest 10
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
                                                    <Badge variant={getStatusBadgeVariant(service.serviceStatus)} className="capitalize">
                                                        {service.serviceStatus || 'Unknown'}
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
                    </section>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminEmployeeProfilePage;
  