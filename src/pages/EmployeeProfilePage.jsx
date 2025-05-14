
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { findEmployeeById } from '@/lib/storage/employeeStorage';
import { getBookings } from '@/lib/storage/bookingStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Briefcase, FileText, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value) return null; // Don't render if value is missing
    return (
        <div className="flex items-start space-x-3">
            <Icon className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-base">{value}</p>
            </div>
        </div>
    );
};

const EmployeeProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [assignedServices, setAssignedServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => { // Simulate fetch
            const empData = findEmployeeById(id);
            if (empData) {
                setEmployee(empData);
                const allBookings = getBookings();
                const servicesForEmployee = allBookings.filter(booking =>
                    (booking.assignedEmployeeIds || []).includes(id)
                ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setAssignedServices(servicesForEmployee);
            } else {
                navigate('/admin-dashboard/employees'); // Redirect if employee not found
            }
            setLoading(false);
        }, 300);
    }, [id, navigate]);

    if (loading) {
        return <div className="p-6">Loading employee profile...</div>;
    }

    if (!employee) {
        return <div className="p-6">Employee not found.</div>;
    }

    const getInitials = (name) => {
        return name
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase() || '?';
     };


    return (
        <div className="p-6 space-y-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees List
            </Button>

            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
                     <Avatar className="h-20 w-20 border">
                        <AvatarImage src={employee.photoUrl || ''} alt={employee.name || employee.email} />
                        <AvatarFallback className="text-xl">{getInitials(employee.name)}</AvatarFallback>
                     </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-2xl">{employee.name || 'No Name Set'}</CardTitle>
                        <CardDescription className="text-base">{employee.position || 'No Position Set'}</CardDescription>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                         {employee.hireDate && <p className="text-sm text-gray-500">Hired: {format(new Date(employee.hireDate), 'MMM d, yyyy')}</p>}
                    </div>
                     {/* Add Edit Button Here if needed */}
                     {/* <Button variant="outline">Edit Profile</Button> */}
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <InfoRow icon={Phone} label="Mobile" value={employee.mobile} />
                        <InfoRow icon={MapPin} label="Address" value={employee.address} />
                        <InfoRow icon={User} label="Sex" value={employee.sex} />
                        <InfoRow icon={Calendar} label="Date of Birth" value={employee.dob ? format(new Date(employee.dob), 'MMM d, yyyy') : null} />
                        <InfoRow icon={MapPin} label="Origin (Nationality)" value={employee.origin} />
                     </div>

                    {(employee.passportNumber || employee.visaExpirationDate) && (
                        <div className="border-t pt-4 mt-4 space-y-4">
                            <h3 className="text-lg font-semibold mb-2">Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                <InfoRow icon={FileText} label="Passport Number" value={employee.passportNumber} />
                                <InfoRow icon={Calendar} label="Passport Issue Date" value={employee.passportIssueDate ? format(new Date(employee.passportIssueDate), 'MMM d, yyyy') : null} />
                                <InfoRow icon={Calendar} label="Passport Expiry Date" value={employee.passportExpiryDate ? format(new Date(employee.passportExpiryDate), 'MMM d, yyyy') : null} />
                                <InfoRow icon={ShieldCheck} label="Visa Issuance Date" value={employee.visaIssuanceDate ? format(new Date(employee.visaIssuanceDate), 'MMM d, yyyy') : null} />
                                <InfoRow icon={ShieldCheck} label="Visa Expiration Date" value={employee.visaExpirationDate ? format(new Date(employee.visaExpirationDate), 'MMM d, yyyy') : null} />
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-semibold mb-3">Assigned Services ({assignedServices.length})</h3>
                         {assignedServices.length === 0 ? (
                             <p className="text-gray-500">No services currently assigned.</p>
                         ) : (
                              <div className="overflow-x-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Ref #</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {assignedServices.map((service) => (
                                        <TableRow key={service.id}>
                                        <TableCell>
                                            <Link to={`/admin-dashboard/services/${service.id}`} className="font-mono text-primary hover:underline text-sm">
                                                {service.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">{service.date ? `${format(new Date(service.date), 'MMM d, yyyy')} ${service.time}` : 'N/A'}</TableCell>
                                        <TableCell className="text-sm">{service.name}</TableCell>
                                        <TableCell className="text-sm truncate max-w-[200px]">{service.address}</TableCell>
                                        <TableCell className="text-sm capitalize">{service.serviceStatus}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </div>
                         )}

                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeProfilePage;
  