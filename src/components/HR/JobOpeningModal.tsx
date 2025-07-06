import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, MenuItem } from '@mui/material';
import { JobOpening } from '../../services/hr/recruitmentService';
import departmentService, { Department } from '../../services/hr/departmentService';

interface JobOpeningModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (job: JobOpening) => void;
  jobToEdit: JobOpening | null;
}

const JobOpeningModal: React.FC<JobOpeningModalProps> = ({ open, onClose, onSave, jobToEdit }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<JobOpening>({
    title: '',
    department: '',
    description: '',
    requirements: '',
    status: 'Open',
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData(jobToEdit);
    } else {
      setFormData({
        title: '',
        department: '',
        description: '',
        requirements: '',
        status: 'Open',
      });
    }

    if (open) {
      fetchDepartments();
    }
  }, [jobToEdit, open]);

  const fetchDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as JobOpening));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} className="bg-white p-4 rounded-lg shadow-lg w-1/2">
        <Typography variant="h6" component="h2" className="mb-4">
          {jobToEdit ? 'Edit Job Opening' : 'Add Job Opening'}
        </Typography>
        <TextField label="Job Title" name="title" value={formData.title} onChange={handleChange} fullWidth margin="normal" />
        <TextField select label="Department" name="department" value={formData.department} onChange={handleChange} fullWidth margin="normal">
          {departments.map((dept) => (
            <MenuItem key={dept._id} value={dept.name}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={4} margin="normal" />
        <TextField label="Requirements" name="requirements" value={formData.requirements} onChange={handleChange} fullWidth multiline rows={3} margin="normal" />
        <TextField select label="Status" name="status" value={formData.status} onChange={handleChange} fullWidth margin="normal">
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="Closed">Closed</MenuItem>
          <MenuItem value="On Hold">On Hold</MenuItem>
        </TextField>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="mr-2">Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </div>
      </Box>
    </Modal>
  );
};

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default JobOpeningModal;
