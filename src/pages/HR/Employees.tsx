import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Mail, Phone, MapPin, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { IEmployee } from '../../types/Employee';
import { employeeService } from '../../services/hrService';
import AddEmployeeModal from '../../components/HR/AddEmployeeModal';
import {departments} from '../../data/mockData';

const Employees: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Fetch employees
    useEffect(() => {
      const fetchEmployees = async () => {
        try {
          console.log('Fetching employees...');
          const data = await employeeService.getAll();
          console.log('Employees data received:', data);
          setEmployees(data);
          setError(null);
        } catch (err: any) {
          console.error('Error fetching employees:', {
            error: err,
            response: err.response?.data,
            status: err.response?.status,
            config: {
              url: err.config?.url,
              method: err.config?.method,
              headers: err.config?.headers,
            },
          });
          
          let errorMessage = 'Failed to fetch employees. ';
          if (err.response?.data?.message) {
            errorMessage += err.response.data.message;
          } else if (err.message) {
            errorMessage += err.message;
          } else {
            errorMessage += 'Please check your network connection and try again.';
          }
          
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEmployees();
    }, []);
  
    const filteredEmployees = employees.filter(employee => {
      const matchesSearch = `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
      const matchesStatus = !filterStatus || employee.status === filterStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  
    const departmentsList = [...new Set(employees.map(emp => emp.department))];
    const statuses = [...new Set(employees.map(emp => emp.status))];
  
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'inactive': return 'bg-yellow-100 text-yellow-800';
        case 'terminated': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
  
  const handleAddEmployee = async (employeeData: Omit<IEmployee, '_id' | 'employeeId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      const newEmployee = await employeeService.create({
        ...employeeData,
        dateOfJoining: new Date(employeeData.dateOfJoining).toISOString(),
        status: employeeData.status || 'active',
        documents: employeeData.documents || []
      });
      
      setEmployees(prev => [...prev, newEmployee]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding employee:', error);
      setError(error.response?.data?.message || 'Failed to add employee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      setIsLoading(true);
      await employeeService.remove(employeeId);
      setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('Failed to delete employee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading employees...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 px-3 py-1 text-sm bg-white border border-red-200 rounded-md flex items-center hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </button>
        </div>
      </div>
    );
  }
  
    return (
      <div className="space-y-6">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Employee added successfully!</span>
          </div>
        )}
  
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600 mt-1">Manage your organization's workforce</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
  
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{employees.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{departmentsList.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Salary</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  ${Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length / 1000)}K
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
  
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
  
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
  
            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
  
        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{employee.employeeId}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </div>
  
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-medium">Position:</span> {employee.position}</p>
                <p className="text-sm"><span className="font-medium">Department:</span> {employee.department}</p>
                <p className="text-sm"><span className="font-medium">Manager:</span> {employee.manager || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">Hire Date:</span> {new Date(employee.hireDate).toLocaleDateString()}</p>
              </div>
  
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{employee.location}</span>
                </div>
              </div>
  
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">
                  ${employee.salary.toLocaleString()}
                </span>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No employees found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
  
        {/* Add Employee Modal */}
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setError(null);
          }}
          onSubmit={handleAddEmployee}
          departments={departments}
          employees={employees}
          isLoading={isLoading}
        />
        
        {/* Error message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

export default Employees;