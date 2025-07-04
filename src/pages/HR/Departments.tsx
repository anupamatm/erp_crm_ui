import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, Edit, Trash2, Plus } from 'lucide-react';
import { departmentService } from '../../services/hrService';
import AddDepartmentModal from '../../components/HR/AddDepartmentModal';

interface Department {
  _id: string;
  id?: string; // For frontend compatibility
  name: string;
  code: string;
  description?: string;
  manager?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string | null;
  status: 'active' | 'inactive';
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsFetching(true);
        setError(null);
        console.log('Fetching departments...');
        const data = await departmentService.getAll();
        console.log('Fetched departments:', data);
        setDepartments(data);
      } catch (err: any) {
        console.error('Failed to fetch departments:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load departments. Please try again later.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleAddDepartment = async (data: { name: string; code: string; description: string }) => {
    setIsLoading(true);
    try {
      console.log('Creating department with data:', data);
      
      // Prepare the department data according to the model
      const departmentData = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description?.trim() || undefined, // Send undefined instead of empty string
        status: 'active' as const
      };
      
      console.log('Sending department data:', departmentData);
      
      const newDepartment = await departmentService.create(departmentData);
      
      console.log('Department created successfully:', newDepartment);
      
      // Update the UI with the new department
      setDepartments(prev => [
        ...prev, 
        {
          ...newDepartment,
          id: newDepartment._id, // Ensure we have an id for the frontend
          employeeCount: 0 // Initialize employee count
        }
      ]);
      
      // Show success message
      alert('Department created successfully!');
      
      // Close the modal
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding department:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: error.config?.data
      });
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to add department';
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  // Loading state
  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Loading departments...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">
            {departments.length} department{departments.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => {
          // Safely get manager name
          const getManagerName = () => {
            if (!department.manager) return 'No manager';
            if (typeof department.manager === 'string') return department.manager;
            const manager = department.manager as { firstName: string; lastName: string };
            return `${manager.firstName} ${manager.lastName}`.trim();
          };

          return (
            <div key={department._id || department.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {department.name}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        department.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {department.status}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {department.employeeCount || 0} members • {getManagerName()}
                    </p>
                    {department.code && (
                      <span className="text-xs text-gray-400">Code: {department.code}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {department.description && (
                <p className="text-sm text-gray-600 mb-4">{department.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Employees</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {department.employeeCount || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Status</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                    {department.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {department.updatedAt 
                    ? `Updated: ${new Date(department.updatedAt).toLocaleDateString()}`
                    : ''}
                </span>
                <button 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  onClick={() => {
                    // TODO: Implement view details
                    console.log('View details for department:', department._id);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Structure */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Department Structure</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Head</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Employees</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{department.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{department.head}</td>
                    <td className="py-3 px-4 text-gray-600">{department.employeeCount}</td>
                    <td className="py-3 px-4 text-gray-600">${(department.budget / 1000000).toFixed(1)}M</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((department.employeeCount / 30) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round((department.employeeCount / 30) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDepartment={handleAddDepartment}
      />
    </div>
  );
};

export default Departments;