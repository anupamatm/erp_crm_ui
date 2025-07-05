import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LeadService from '../../services/leadService';
import { Lead } from '../../types/Lead';
import { userApi } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LeadWithAssignedTo extends Omit<Lead, 'assignedTo'> {
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LeadWithAssignedTo extends Omit<Lead, 'assignedTo'> {
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const AssignLead = () => {
  const [leads, setLeads] = useState<LeadWithAssignedTo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([fetchLeads(), fetchUsers()]);
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await LeadService.getAllLeads();
      setLeads(data as LeadWithAssignedTo[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Failed to fetch leads');
    }
  };

  const fetchUsers = async () => {
    try {
      // If current user is a sales manager, only fetch sales executives
      const role = user?.role === 'sales_manager' ? 'sales_exec' : undefined;
      const response = await userApi.getUsers(1, 100, '', role);
      
      // Filter out the current user if they're a sales executive
      const filteredUsers = Array.isArray(response.data) 
        ? response.data.filter(u => u._id !== user?._id)
        : [];
        
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(e.target.value);
  };

  const handleAssign = async (leadId: string, userId: string) => {
    if (!leadId) return;
    
    try {
      const user = users.find(u => u._id === userId);
      
      // Create the update data with proper typing
      const updateData = user 
        ? { 
            assignedTo: {
              _id: user._id,
              name: user.name,
              email: user.email
            }
          }
        : { assignedTo: null };
      
      await LeadService.updateLead(leadId, updateData);
      await fetchLeads();
      alert('Lead assigned successfully');
    } catch (error: any) {
      console.error('Error assigning lead:', error);
      
      // Check if this is a permission error
      if (error.message?.includes('permission') || error.message?.includes('authorized')) {
        alert('You do not have permission to assign leads. Please contact your administrator.');
      } else {
        alert(`Failed to assign lead: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    const statusColors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    } as const;
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assign Leads</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchText}
              onChange={handleSearch}
              className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedUser}
            onChange={handleFilter}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Assignees</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads
                .filter(lead => {
                  const searchLower = searchText.toLowerCase();
                  return (
                    (lead.firstName?.toLowerCase() || '').includes(searchLower) ||
                    (lead.email?.toLowerCase() || '').includes(searchLower) ||
                    (lead.company?.toLowerCase() || '').includes(searchLower)
                  );
                })
                .filter(lead => !selectedUser || lead.assignedTo?._id === selectedUser)
                .map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <select
                        value={lead.assignedTo?._id || ''}
                        onChange={(e) => handleAssign(lead._id || '', e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassign</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </select>
                      <Link
                        to={`/leads/${lead._id}`}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignLead;
