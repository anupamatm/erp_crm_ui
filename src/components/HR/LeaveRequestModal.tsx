import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2, UserPlus } from 'lucide-react';
import { format, isWeekend, addDays, differenceInDays } from 'date-fns';
import { employeeService } from '../../services/hrService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/CustomDialog';



interface TeamMember {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  department?: string;
  position?: string;
}

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isAdmin?: boolean;
  isCreatingForOthers?: boolean;
  teamMembers?: TeamMember[];
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isAdmin = false,
  isCreatingForOthers = false,
  teamMembers = []
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'vacation',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    days: 1,
  });

  const [employees, setEmployees] = useState<HREmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<TeamMember | null>(null);
  
  // Mock HREmployee type since we're not importing it
  interface HREmployee {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
  }

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        if (isAdmin && isCreatingForOthers && teamMembers.length > 0) {
          setEmployees(teamMembers.map(member => ({
            _id: member._id,
            firstName: member.name.split(' ')[0],
            lastName: member.name.split(' ').slice(1).join(' '),
            email: member.email,
            employeeId: member.employeeId,
            department: member.department || '',
            position: member.position || '',
          })));
        } else {
          const data = await employeeService.getAll();
          setEmployees(data);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee list. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [isOpen]);

  const calculateWorkingDays = (start: Date, end: Date): number => {
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

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'startDate' && new Date(value) > new Date(newFormData.endDate)) {
      newFormData.endDate = value;
    }
    
    const start = new Date(newFormData.startDate);
    const end = new Date(newFormData.endDate);
    const days = calculateWorkingDays(start, end);
    
    setFormData({
      ...newFormData,
      days: days > 0 ? days : 1
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date cannot be before start date');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      let days = 0;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) { 
          days++;
        }
      }
      
      const submitData = {
        ...formData,
        days,
        employeeId: isCreatingForOthers ? formData.employeeId : undefined
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError('Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
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
    if (isCreatingForOthers && teamMembers.length > 0 && !formData.employeeId) {
      setFormData(prev => ({
        ...prev,
        employeeId: teamMembers[0]?._id || ''
      }));
    }
  }, [isCreatingForOthers, teamMembers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isCreatingForOthers ? 'Create Leave Request for Team Member' : 'New Leave Request'}
          </DialogTitle>
          <DialogDescription>
            {isCreatingForOthers 
              ? 'Fill in the details to create a leave request on behalf of a team member.'
              : 'Submit a new leave request with the details below.'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Selector (only for HR creating for others) */}
            {isCreatingForOthers && (
              <div className="md:col-span-2">
                <Label htmlFor="employee">Team Member</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({...formData, employeeId: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>{member.name} ({member.employeeId})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Leave Type */}
            <div>
              <Label htmlFor="type">Leave Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
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
              <Label htmlFor="days">Working Days</Label>
              <Input
                id="days"
                type="number"
                value={formData.days}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            {/* Start Date */}
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            {/* End Date */}
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  min={formData.startDate}
                  className="pl-10"
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
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Enter the reason for leave"
              className="min-h-[100px]"
              required
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreatingForOthers ? 'Creating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  {isCreatingForOthers ? 'Create Request' : 'Submit Request'}
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
