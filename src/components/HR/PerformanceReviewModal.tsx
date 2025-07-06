import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Rating, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { PerformanceReview, PopulatedUser } from '../../services/hr/performanceService';
import { userApi } from '../../services/userService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (review: PerformanceReview) => void;
  review: PerformanceReview | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const PerformanceReviewModal: React.FC<Props> = ({ open, onClose, onSave, review }) => {
  const [formData, setFormData] = useState<Partial<PerformanceReview>>(review || {});
  const [users, setUsers] = useState<PopulatedUser[]>([]);

  useEffect(() => {
    if (review) {
      setFormData(review);
    } else {
      setFormData({});
    }
  }, [review]);

  useEffect(() => {
    // Fetch users to populate employee/reviewer dropdowns
    const fetchUsers = async () => {
      try {
        // Fetch up to 1000 users to populate the dropdowns
        const response = await userApi.getUsers(1, 1000);
        setUsers(response.data.map((u: any) => ({ _id: u._id, name: u.name })));
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingChange = (name: string, value: number | null) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        qualityOfWork: prev.ratings?.qualityOfWork || 0,
        communication: prev.ratings?.communication || 0,
        teamwork: prev.ratings?.teamwork || 0,
        productivity: prev.ratings?.productivity || 0,
        [name]: value || 0,
      },
    }));
  };

  const handleSubmit = () => {
    onSave(formData as PerformanceReview);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">{review ? 'Edit' : 'Add'} Performance Review</Typography>
        <Grid container spacing={2} mt={2}>
          <Grid xs={12} sm={6}>
            <TextField select label="Employee" name="employee" value={formData.employee || ''} onChange={handleChange} fullWidth SelectProps={{ native: true }}>
              <option value=""></option>
              {users.map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
            </TextField>
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField select label="Reviewer" name="reviewer" value={formData.reviewer || ''} onChange={handleChange} fullWidth SelectProps={{ native: true }}>
            <option value=""></option>
              {users.map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
            </TextField>
          </Grid>
          <Grid xs={12}>
            <Typography component="legend">Quality of Work</Typography>
            <Rating name="qualityOfWork" value={formData.ratings?.qualityOfWork || 0} onChange={(_, val) => handleRatingChange('qualityOfWork', val)} />
          </Grid>
          <Grid xs={12}>
            <Typography component="legend">Communication</Typography>
            <Rating name="communication" value={formData.ratings?.communication || 0} onChange={(_, val) => handleRatingChange('communication', val)} />
          </Grid>
          <Grid xs={12}>
            <Typography component="legend">Teamwork</Typography>
            <Rating name="teamwork" value={formData.ratings?.teamwork || 0} onChange={(_, val) => handleRatingChange('teamwork', val)} />
          </Grid>
          <Grid xs={12}>
            <Typography component="legend">Productivity</Typography>
            <Rating name="productivity" value={formData.ratings?.productivity || 0} onChange={(_, val) => handleRatingChange('productivity', val)} />
          </Grid>
          <Grid xs={12}>
            <TextField label="Comments" name="comments" value={formData.comments || ''} onChange={handleChange} fullWidth multiline rows={4} />
          </Grid>
        </Grid>
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PerformanceReviewModal;
