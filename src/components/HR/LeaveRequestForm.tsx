import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, Loader2 } from 'lucide-react';
import { leaveService } from '../../services/hr/leaveService';
import { format, isWeekend } from 'date-fns';
import { toast } from 'react-toastify';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface LeaveFormData {
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  reason: string;
  days: number;
}

const LeaveRequestForm: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<LeaveFormData>({
    employeeId: '',
    type: 'vacation',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    days: 1
  });

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Replace with your actual employee service
        // const response = await employeeService.getAll();
        // setEmployees(response.data);
        
        // Mock data for now
        setEmployees([
          { _id: '1', firstName: 'John', lastName: 'Doe', employeeId: 'EMP001' },
          { _id: '2', firstName: 'Jane', lastName: 'Smith', employeeId: 'EMP002' },
        ]);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchPendingLeaves();
  }, []);

  // Fetch pending leaves
  const fetchPendingLeaves = async () => {
    try {
      const leaves = await leaveService.getAll({ status: 'pending' });
      setPendingLeaves(leaves as any[]);
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
      toast.error('Failed to load pending leaves');
    }
  };

  // Calculate working days between two dates (excludes weekends)
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
    
    // Update end date if it's before start date
    if (field === 'startDate' && new Date(value) > new Date(newFormData.endDate)) {
      newFormData.endDate = value;
    }
    
    // Calculate working days
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
    
    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }
    
    try {
      setSubmitting(true);
// Map form data to match the LeaveRequest interface
      const leaveData = {
        employee: formData.employeeId,
        type: formData.type,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        days: formData.days,
        reason: formData.reason,
        status: 'pending' as const,
        appliedDate: new Date(),
      };
      
      await leaveService.create(leaveData);
      toast.success('Leave request submitted successfully');
      
      // Reset form
      setFormData({
        employeeId: formData.employeeId, // Keep the same employee selected
        type: 'vacation',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
        days: 1
      });
      
      // Refresh pending leaves
      await fetchPendingLeaves();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Leave Request Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">New Leave Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full p-2 border rounded-md pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full p-2 border rounded-md pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={formData.startDate}
                  required
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days
              </label>
              <input
                type="number"
                value={formData.days}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reason for leave"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Submitting...
                </span>
              ) : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Pending Leave Requests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Leave Requests</h2>
        
        {pendingLeaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>No pending leave requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {leave.employee?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {leave.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(leave.startDate), 'MMM d, yyyy')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {leave.days} day{leave.days !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestForm;
