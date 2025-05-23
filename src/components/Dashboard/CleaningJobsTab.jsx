
import React, { useState, useEffect } from 'react';
import { getJobsByUserId } from '@/lib/storage/jobStorage';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CalendarDays, Info, Tag, ListChecks } from 'lucide-react';

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
        case 'accepted':
        case 'in-progress': return 'default';
        case 'pending': return 'secondary';
        case 'canceled': return 'destructive';
        default: return 'outline';
    }
};

const CleaningJobsTab = () => {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userJobs = await getJobsByUserId(user.id);
        setJobs(userJobs);
      } catch (error) {
        console.error("Failed to fetch cleaning jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        fetchJobs();
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
        <Card className="border-0 shadow-none rounded-none">
            <CardHeader>
                <CardTitle>Cleaning Jobs</CardTitle>
                <CardDescription>Loading your scheduled cleaning jobs...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center items-center py-10">
                    <Info className="h-8 w-8 animate-spin text-primary" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
     <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center">
            <Briefcase className="h-6 w-6 mr-2 text-primary" />
            Cleaning Jobs
        </CardTitle>
        <CardDescription>View your upcoming and past cleaning jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
            <div className="text-center py-10">
                <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You have no cleaning jobs scheduled.</p>
            </div>
        ) : (
            <div className="overflow-x-auto border rounded-md">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="text-xs md:text-sm">Job Ref ID</TableHead>
                     <TableHead className="text-xs md:text-sm">Service Date</TableHead>
                     <TableHead className="text-xs md:text-sm">Service</TableHead>
                     <TableHead className="text-xs md:text-sm">Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {jobs.map((job) => (
                     <TableRow key={job.job_ref_id}>
                       <TableCell className="text-xs md:text-sm font-mono">
                            <Tag className="h-3 w-3 mr-1 inline-block text-muted-foreground" />
                            {job.job_ref_id}
                        </TableCell>
                       <TableCell className="text-xs md:text-sm whitespace-nowrap">
                            <CalendarDays className="h-3 w-3 mr-1 inline-block text-muted-foreground" />
                            {formatDateSafe(job.preferred_date)}
                        </TableCell>
                       <TableCell className="text-xs md:text-sm">{job.purchase?.product_name || 'N/A'}</TableCell>
                       <TableCell className="text-xs md:text-sm capitalize">
                           <Badge variant={getStatusBadgeVariant(job.status)} className="capitalize">
                                {job.status || 'Unknown'}
                           </Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CleaningJobsTab;
