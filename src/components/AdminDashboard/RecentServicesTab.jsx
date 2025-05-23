
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, PlusCircle, ExternalLink, Briefcase, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const formatDateSafe = (dateString, includeTime = false, placeholder = 'N/A') => {
  try {
    if (!dateString || isNaN(new Date(dateString).getTime())) return placeholder;
    return format(new Date(dateString), includeTime ? 'MMM d, yyyy, HH:mm' : 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'success';
        case 'pending assignment': case 'scheduled': return 'default';
        case 'assigned': case 'in progress': return 'outline';
        case 'cancelled': case 'on hold': case 'failed': return 'destructive';
        default: return 'secondary';
    }
};

const JobRow = ({ job, canViewAllJobs, canEditJobs }) => {
    return (
      <TableRow key={job.job_ref_id}>
        <TableCell className="font-mono">
           <Link to={`/admin-dashboard/job/${job.job_ref_id}`} className="text-primary hover:underline flex items-center">
                {job.job_ref_id} <ExternalLink className="h-3 w-3 ml-1"/>
            </Link>
        </TableCell>
        <TableCell className="whitespace-nowrap">{formatDateSafe(job.created_at, true)}</TableCell>
        <TableCell>
          <div>{job.user_name || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">{job.user_email || 'N/A'}</div>
          <div className="text-xs text-muted-foreground flex items-center">
             <Phone className="h-3 w-3 mr-1" /> {job.user_phone || 'N/A'}
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap">{formatDateSafe(job.preferred_date)}</TableCell>
        <TableCell>
          {canViewAllJobs && job.purchase_ref_id ? (
             <Link to={`/admin-dashboard/purchase/${job.purchase_ref_id}`} className="text-primary hover:underline flex items-center">
                {job.purchase_ref_id} <ExternalLink className="h-3 w-3 ml-1"/>
             </Link>
          ) : (
            job.purchase_ref_id || 'Direct Job'
          )}
        </TableCell>
        <TableCell>
          <Badge variant={getStatusBadgeVariant(job.status)} className="capitalize">
            {job.status || 'Unknown'}
          </Badge>
        </TableCell>
        <TableCell className="text-right space-x-1 whitespace-nowrap">
          {canEditJobs && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin-dashboard/job/${job.job_ref_id}`}>
                <Edit className="h-3 w-3 mr-1" /> Edit
              </Link>
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
};


const RecentServicesTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { adminProfile } = useAdminAuth();

  const canCreateJobs = adminProfile && (adminProfile.role === 'admin' || adminProfile.role === 'superadmin');
  const canEditJobs = adminProfile && (adminProfile.role === 'admin' || adminProfile.role === 'superadmin');
  const canViewAllJobs = adminProfile && (adminProfile.role === 'admin' || adminProfile.role === 'superadmin');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          job_ref_id,
          created_at,
          user_name,
          user_email,
          user_phone,
          preferred_date,
          status,
          purchase_ref_id
        `)
        .order('created_at', { ascending: false });

      if (adminProfile && (adminProfile.role === 'staff' || adminProfile.role === 'employee') && !canViewAllJobs) {
        query = query.contains('assigned_employees_ids', [adminProfile.id]);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({ title: "Error", description: "Could not fetch jobs.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, adminProfile, canViewAllJobs]);

  useEffect(() => {
    if (adminProfile) { // Ensure adminProfile is loaded before fetching
        fetchJobs();
    }
  }, [fetchJobs, adminProfile]);

  const handleExport = () => {
    if (jobs.length === 0) {
      toast({ title: "No Data", description: "There are no jobs to export." });
      return;
    }
    const headers = ["Job Ref No.", "Created Date", "Customer Name", "Customer Email", "Customer Phone", "Preferred Date", "Status", "Purchase Ref No."];
    const csvRows = [headers.join(",")];

    jobs.forEach(job => {
      const row = [
        job.job_ref_id,
        formatDateSafe(job.created_at, true),
        `"${job.user_name || 'N/A'}"`,
        job.user_email || 'N/A',
        job.user_phone || 'N/A',
        formatDateSafe(job.preferred_date),
        job.status || 'N/A',
        job.purchase_ref_id || 'Direct Job'
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `jobs_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Successful", description: "Jobs CSV file downloaded." });
  };

  if (loading) {
    return <div className="p-6 text-center">Loading jobs...</div>;
  }

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold">
          <Briefcase className="mr-3 h-7 w-7 text-primary" />
          Scheduled Jobs
        </CardTitle>
        <CardDescription>View and manage all scheduled cleaning jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4 space-x-2">
           {canCreateJobs && (
            <Button asChild size="sm">
              <Link to="/admin-dashboard/job/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Job
              </Link>
            </Button>
          )}
          <Button onClick={handleExport} size="sm" variant="outline" disabled={jobs.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        {jobs.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">
            {canViewAllJobs ? "No jobs recorded yet." : "No jobs assigned to you or no jobs recorded yet."}
          </p>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Ref</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Purchase Ref</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <JobRow 
                    key={job.job_ref_id} 
                    job={job} 
                    canViewAllJobs={canViewAllJobs}
                    canEditJobs={canEditJobs}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentServicesTab;
