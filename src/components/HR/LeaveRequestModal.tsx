import React, { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { format, isWeekend } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/CustomDialog';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  userId: string;
  isCreatingForOther?: boolean;
  teamMembers?: { _id: string; name: string }[];
  isSubmitting?: boolean;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  isCreatingForOther = false,
  teamMembers = [],
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'vacation',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    days: 1,
  });

  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        employeeId: '',
        type: 'vacation',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
        days: 1,
      });
      setError(null);
      setSelectedEmployee(isCreatingForOther ? '' : userId);
    }
  }, [isOpen, isCreatingForOther, userId]);

  const calculateWorkingDays = (start: Date, end: Date): number => {
    if (!start || !end || start > end) return 0;
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      if (!isWeekend(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  useEffect(() => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = calculateWorkingDays(start, end);
    setFormData(prev => ({ ...prev, days: days > 0 ? days : 1 }));
  }, [formData.startDate, formData.endDate]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    if (isCreatingForOther && !selectedEmployee) {
      setError('Please select an employee.');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        employeeId: isCreatingForOther ? selectedEmployee : userId,
      };
      await onSubmit(submissionData);
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      setError('An error occurred while submitting the request. Please try again.');
    }
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        setFormData(prev => ({ ...prev, endDate: formData.startDate }));
        return;
      }
      
      let days = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) { 
          days++;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        days: days || 1
      }));
    }
  }, [formData.startDate, formData.endDate]);
  
  useEffect(() => {
    if (isCreatingForOther && teamMembers.length > 0 && !formData.employeeId) {
      setFormData(prev => ({
        ...prev,
        employeeId: teamMembers[0]?._id || ''
      }));
    }
  }, [isCreatingForOther, teamMembers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isCreatingForOther ? 'Create Leave for Team Member' : 'New Leave Request'}</DialogTitle>
          <DialogDescription>
            {isCreatingForOther ? 'Select an employee and fill out the form to create a leave request on their behalf.' : 'Fill out the form to request time off.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isCreatingForOther && teamMembers && (
            <div>
              <label>Employee</label>
              <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(member => (
                    <SelectItem key={member._id} value={member._id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            
            {/* Leave Type */}
            <div>
              <Label htmlFor="type">Leave Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="maternity">Maternity</SelectItem>
                  <SelectItem value="paternity">Paternity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Days (readonly, calculated) */}
            <div>
              <Label>Working Days</Label>
              <Input
                type="number"
                value={formData.days}
                inputProps={{ readOnly: true }}
                sx={{ backgroundColor: '#f9fafb' }}
              />
            </div>
            
            {/* Start Date */}
            <div>
              <Label>Start Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
                  sx={{ paddingLeft: '2.5rem' }}
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            {/* End Date */}
            <div>
              <Label>End Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  inputProps={{ min: formData.startDate }}
                  sx={{ paddingLeft: '2.5rem' }}
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, reason: e.target.value})}
              placeholder="Enter the reason for leave"
              className="min-h-[100px]"
              required
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreatingForOther ? 'Creating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  {isCreatingForOther ? 'Create Request' : 'Submit Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestModal;
