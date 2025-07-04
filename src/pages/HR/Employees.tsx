import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, AlertCircle, CheckCircle, Trash2, Copy, Check } from 'lucide-react';
import { employeeService, departmentService } from '../../services/hrService';
import AddEmployeeModal from '../../components/HR/AddEmployeeModal';
import { Employee as EmployeeType, Address, EmergencyContact } from '../../types/HR';
import { Dialog, Transition } from '@headlessui/react';

interface Employee extends Omit<EmployeeType, 'status'> {
  _id: string;
  employeeId: string;
  dateOfJoining: string | Date;
  department: string;
  status: 'active' | 'inactive' | 'terminated' | 'on-leave';
  user?: {
    _id: string;
    email: string;
    defaultPassword?: string;
  };
  address: Address;
  emergencyContact: EmergencyContact;
}

interface DepartmentOption {
  id: string;
  name: string;
}

const Employees: React.FC = (): JSX.Element => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [credentials, setCredentials] = useState<{email: string; password: string} | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                console.log('Fetching employees...');
                const data = await employeeService.getAll();
                console.log('Employees data received:', data);
                // Ensure all employees have required fields
                const employeesWithDefaults: Employee[] = data.map((emp: any) => ({
                    ...emp,
                    _id: emp._id || '',
                    employeeId: emp.employeeId || '',
                    dateOfJoining: emp.dateOfJoining || new Date().toISOString(),
                    status: (emp.status || 'active') as Employee['status'],
                    department: emp.department || 'Unassigned',
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    email: emp.email || '',
                    phone: emp.phone || '',
                    position: emp.position || '',
                    salary: emp.salary || 0,
                    hireDate: emp.hireDate || new Date().toISOString(),
                    location: emp.location || '',
                    documents: emp.documents || []
                }));
                setEmployees(employeesWithDefaults);
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

        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchEmployees(),
                    departmentService.getAll().then(depts => {
                        setDepartments(depts.map(dept => ({
                            id: dept.id,
                            name: dept.name
                        })));
                    })
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const filteredEmployees = React.useMemo(() => {
        return employees.filter((employee) => {
            try {
                // Handle cases where properties might be undefined
                const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase().trim();
                const empId = employee.employeeId ? employee.employeeId.toString().toLowerCase() : '';
                const empEmail = employee.email ? employee.email.toLowerCase() : '';
                const empDept = employee.department || '';
                const empStatus = employee.status || '';

                // Only perform search if there's a search term
                const matchesSearch = searchTerm === '' || 
                    fullName.includes(searchTerm.toLowerCase()) || 
                    empId.includes(searchTerm.toLowerCase()) || 
                    empEmail.includes(searchTerm.toLowerCase());

                // Handle department filter
                const matchesDepartment = !filterDepartment || 
                    empDept.toLowerCase() === filterDepartment.toLowerCase();

                // Handle status filter
                const matchesStatus = !filterStatus || 
                    empStatus.toLowerCase() === filterStatus.toLowerCase();

                return matchesSearch && matchesDepartment && matchesStatus;
            } catch (error) {
                console.error('Error filtering employees:', error);
                return false;
            }
        });
    }, [employees, searchTerm, filterDepartment, filterStatus]);

    // Helper function to get status color class
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800';
            case 'terminated':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | '_id' | 'user' | 'employeeId' | 'hireDate' | 'avatar' | 'manager' | 'documents'> & { 
      dateOfJoining?: string | Date;
      address: Address;
      emergencyContact: EmergencyContact;
    }) => {
        try {
            setIsLoading(true);
            const response = await employeeService.create({
                ...employeeData,
                status: 'active',
                department: employeeData.department || 'Unassigned',
                dateOfJoining: employeeData.dateOfJoining || new Date().toISOString()
            });
            
            console.log('Employee creation response:', response);
            
            // Add the new employee to the list with all required fields
            const newEmployee: Employee = {
                ...response,
                _id: response._id || '',
                employeeId: response.employeeId || `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                status: 'active',
                hireDate: new Date().toISOString(),
                location: response.location || '',
                address: response.address || {
                  street: '',
                  city: '',
                  state: '',
                  country: '',
                  zipCode: ''
                },
                emergencyContact: response.emergencyContact || {
                  name: '',
                  relation: '',
                  phone: ''
                },
                // Ensure user data is properly set
                user: response.user ? {
                  _id: response.user._id,
                  email: response.email || employeeData.email,
                  defaultPassword: response.user.defaultPassword || '12345'
                } : undefined
            };
            
            setEmployees(prev => [...prev, newEmployee]);
            
            // Show success message
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 5000);
            
            // Show credentials modal with the email and default password
            setCredentials({
              email: response.email || employeeData.email,
              password: response.user?.defaultPassword || '12345'
            });
            
            // Close the modal after a short delay
            setTimeout(() => {
              setIsAddModalOpen(false);
            }, 100);
        } catch (error: any) {
            console.error('Error adding employee:', error);
            setError(error.response?.data?.message || 'Failed to add employee');
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const closeCredentialsModal = () => {
        setCredentials(null);
        setIsAddModalOpen(false);
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                setIsLoading(true);
                await employeeService.remove(employeeId);
                setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
            } catch (error) {
                console.error('Error deleting employee:', error);
                setError('Failed to delete employee');
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (isLoading && employees.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-2">Loading employees...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1 max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <select
                            className="block w-full md:w-40 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.name}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="block w-full md:w-32 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">No employees found matching your criteria.</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium">
                                                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {employee.firstName} {employee.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{employee.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.employeeId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                                employee.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => employee._id && handleDeleteEmployee(employee._id)}
                                                className="text-red-600 hover:text-red-900 flex items-center"
                                                title="Delete employee"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Employee added successfully!</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        className="ml-4 text-red-700 hover:text-red-900"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Add Employee Modal */}
            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddEmployee}
                departments={departments}
                employees={[]}
                isLoading={isLoading}
            />
            
            {/* Credentials Modal */}
            <Transition.Root show={!!credentials} as={React.Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={closeCredentialsModal}>
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>
                        
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div>
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                        <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                            Employee Account Created
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                The employee account has been created successfully. Here are the login credentials:
                                            </p>
                                            
                                            <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Email:</span>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-900 font-mono mr-2">{credentials?.email}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(credentials?.email || '')}
                                                            className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                                        >
                                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700">Password:</span>
                                                    <div className="flex items-center">
                                                        <span className="text-sm text-gray-900 font-mono mr-2">{credentials?.password}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(credentials?.password || '')}
                                                            className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                                        >
                                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <p className="mt-3 text-sm text-yellow-600">
                                                Please save these credentials. They won't be shown again.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                                        onClick={closeCredentialsModal}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
};

export default Employees;