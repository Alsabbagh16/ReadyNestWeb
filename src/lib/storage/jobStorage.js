
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const generateJobRefId = () => {
  return `JOB-${uuidv4().substring(0, 8).toUpperCase()}`;
};

export const createJob = async (jobData) => {
  const { error } = await supabase
    .from('jobs')
    .insert([
      {
        ...jobData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]);
  if (error) throw error;
  return jobData; 
};

export const getJobByRefId = async (jobRefId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_ref_id', jobRefId)
    .single();
  if (error) throw error;
  return data;
};

export const updateJob = async (jobRefId, updateData) => {
  const { error } = await supabase
    .from('jobs')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('job_ref_id', jobRefId);
  if (error) throw error;
  return true;
};

export const getAllJobs = async () => {
    const { data, error } = await supabase
        .from('jobs')
        .select(`
            *,
            purchase:purchases (product_name),
            assigned_employees:employees (id, full_name) 
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
    return data.map(job => ({
        ...job,
        product_name: job.purchase?.product_name || 'Direct Job',
        assigned_employee_names: job.assigned_employees_ids && job.assigned_employees_ids.length > 0 && job.assigned_employees && job.assigned_employees.length > 0
            ? job.assigned_employees.map(emp => emp.full_name).join(', ')
            : 'N/A',
    }));
};


export const uploadJobDocument = async (jobRefId, file) => {
  if (!jobRefId || !file) {
    throw new Error('Job Reference ID and file are required for upload.');
  }

  const fileName = `${jobRefId}/${uuidv4()}-${file.name}`;
  const bucketName = 'job-documents'; 

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false, 
    });

  if (error) {
    console.error('Error uploading job document to Supabase Storage:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return { ...data, publicURL: publicUrlData.publicUrl, path: data.path };
};


export const getJobDocuments = async (jobRefId) => {
  const bucketName = 'job-documents';
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(jobRefId, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    console.error('Error listing job documents:', error);
    throw error;
  }
  if (!data) return [];
  return data.map(file => ({
    ...file,
    publicURL: supabase.storage.from(bucketName).getPublicUrl(`${jobRefId}/${file.name}`).data.publicUrl,
    filePath: `${jobRefId}/${file.name}` 
  }));
};

export const deleteJobDocument = async (filePath) => {
    const bucketName = 'job-documents';
    const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
    
    if (error) {
        console.error('Error deleting job document:', error);
        throw error;
    }
    return data;
};
