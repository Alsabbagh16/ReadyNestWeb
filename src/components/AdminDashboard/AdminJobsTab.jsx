
import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Edit, Loader2, AlertTriangle, ListChecks, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { fetchAllJobs, deleteJob } from '@/lib/storage/jobStorage';
import JobFormDialog from './JobFormDialog';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const getJobStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'success';
        case 'scheduled': case 'confirmed': return 'default';
        case 'pending': case 'pending assignment': return 'outline';
        case 'in progress': return 'info';
        case 'cancelled': case 'failed': return 'destructive';
        default: return 'secondary';
    }
};

const AdminJobsTab = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedJobs = await fetchAllJobs();
      setJobs(fetchedJobs);
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("Failed to load jobs. Please try again.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleDeleteJob = async (jobRefId) => {
    if (window.confirm(`Are you sure you want to delete job ${jobRefId}? This action cannot be undone.`)) {
        try {
            await deleteJob(jobRefId);
            toast({ title: "Job Deleted", description: `Job ${jobRefId} has been deleted.` });
            loadJobs(); // Refresh list
        } catch (err) {
            toast({ title: "Error Deleting Job", description: err.message, variant: "destructive" });
        }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadJobs();
  };

  const JobRow = ({ job, index }) => (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="hover:bg-slate-50/5 dark:hover:bg-slate-800/50"
    >
      <TableCell className="font-mono text-sm">
        <Link to={`/admin-dashboard/job/${job.job_ref_id}`} className="text-sky-600 dark:text-sky-400 hover:underline">
            {job.job_ref_id}
        </Link>
      </TableCell>
      <TableCell>{job.customer_name || job.user_name || 'N/A'}</TableCell>
      <TableCell>{job.product_name || 'Custom Service'}</TableCell>
      <TableCell>{job.preferred_date ? format(new Date(job.preferred_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
      <TableCell>
        <Badge variant={getJobStatusBadgeVariant(job.status)} className="capitalize">
          {job.status || 'Unknown'}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="outline" size="sm" onClick={() => handleEditJob(job)} className="border-sky-500/50 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300">
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Button>
         <Button variant="outline" size="sm" onClick={() => handleDeleteJob(job.job_ref_id)} className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </TableCell>
    </motion.tr>
  );

  return (
    <div className="p-4 sm:p-6 min-h-full">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-lg">
        <div className="p-6 border-b dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center">
              <ListChecks className="mr-3 h-7 w-7 text-primary" /> Manage Jobs
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              View, create, and edit all cleaning jobs.
            </p>
          </div>
          <Button onClick={handleCreateJob} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Job
          </Button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-red-500/50 rounded-lg bg-red-500/5 p-6 dark:bg-red-900/10">
              <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mb-4" />
              <p className="text-xl font-semibold text-red-700 dark:text-red-300">Error Loading Jobs</p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={loadJobs} variant="destructive">Try Again</Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <ListChecks className="w-16 h-16 text-gray-400 dark:text-slate-600 mb-4" />
              <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-slate-400">
                No Jobs Found
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500">
                Get started by creating a new job.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-700 dark:hover:bg-slate-800/30">
                    <TableHead className="dark:text-slate-400">Job Ref</TableHead>
                    <TableHead className="dark:text-slate-400">Customer</TableHead>
                    <TableHead className="dark:text-slate-400">Service</TableHead>
                    <TableHead className="dark:text-slate-400">Date</TableHead>
                    <TableHead className="dark:text-slate-400">Status</TableHead>
                    <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {jobs.map((job, index) => (
                      <JobRow key={job.job_ref_id} job={job} index={index} />
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      <JobFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        jobData={editingJob}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default AdminJobsTab;
