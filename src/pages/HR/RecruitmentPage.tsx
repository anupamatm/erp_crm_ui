import React, { useState, useEffect } from 'react';
import recruitmentService, { JobOpening } from '../../services/hr/recruitmentService';
import { Button, IconButton, TextField, MenuItem } from '@mui/material';
import departmentService from '../../services/hr/departmentService';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import JobOpeningModal from '../../components/HR/JobOpeningModal';

const RecruitmentPage: React.FC = () => {
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<JobOpening | null>(null);
  const [filters, setFilters] = useState({ status: '', department: '' });
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchJobOpenings();
  }, [filters, sort]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchJobOpenings = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        sortField: sort.field,
        sortOrder: sort.order as 'asc' | 'desc',
      };
      const data = await recruitmentService.getJobOpenings(params);
      setJobOpenings(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch job openings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data.map(d => d.name));
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [field, order] = e.target.value.split(',');
    setSort({ field, order });
  };

  const handleOpenModal = (job: JobOpening | null = null) => {
    setJobToEdit(job);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setJobToEdit(null);
  };

  const handleSaveJobOpening = async (job: JobOpening) => {
    try {
      if (job._id) {
        await recruitmentService.updateJobOpening(job._id, job);
      } else {
        await recruitmentService.createJobOpening(job);
      }
      fetchJobOpenings();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save job opening');
      console.error(err);
    }
  };

  const handleDeleteJobOpening = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job opening?')) {
      try {
        await recruitmentService.deleteJobOpening(id);
        fetchJobOpenings();
      } catch (err) {
        setError('Failed to delete job opening');
        console.error(err);
      }
    }
  };

    if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recruitment</h1>
        <Button onClick={() => handleOpenModal()} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Job Opening
        </Button>
      </div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-1/4">
          <TextField select label="Filter by Status" name="status" value={filters.status} onChange={handleFilterChange} fullWidth>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
            <MenuItem value="On Hold">On Hold</MenuItem>
          </TextField>
        </div>
        <div className="w-1/4">
          <TextField select label="Filter by Department" name="department" value={filters.department} onChange={handleFilterChange} fullWidth>
            <MenuItem value="">All Departments</MenuItem>
            {departments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
          </TextField>
        </div>
        <div className="w-1/3">
          <TextField select label="Sort by" value={`${sort.field},${sort.order}`} onChange={handleSortChange} fullWidth>
            <MenuItem value="createdAt,desc">Newest First</MenuItem>
            <MenuItem value="createdAt,asc">Oldest First</MenuItem>
            <MenuItem value="title,asc">Title (A-Z)</MenuItem>
            <MenuItem value="title,desc">Title (Z-A)</MenuItem>
            <MenuItem value="closingDate,asc">Closing Date (Asc)</MenuItem>
            <MenuItem value="closingDate,desc">Closing Date (Desc)</MenuItem>
          </TextField>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobOpenings.map((job) => (
              <tr key={job._id}>
                <td className="px-6 py-4 whitespace-nowrap">{job.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{job.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">{job.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <IconButton size="small" onClick={() => handleOpenModal(job)}>
                    <Edit className="h-4 w-4" />
                  </IconButton>
                  <IconButton size="small" style={{ color: '#ef4444' }} onClick={() => job._id && handleDeleteJobOpening(job._id)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <JobOpeningModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveJobOpening}
        jobToEdit={jobToEdit}
      />
    </div>
  );
};

export default RecruitmentPage;
