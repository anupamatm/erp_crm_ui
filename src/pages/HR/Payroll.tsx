import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Users, CheckCircle, AlertTriangle, Info, Download, Eye } from 'lucide-react';
import { payrollService } from '../../services/hrService';
import { PayrollRecord, PaySlip, PayItem } from '../../types/HR';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';

interface PaySlipModalProps {
    payslip: PaySlip | null;
    onClose: () => void;
}

const PaySlipModal: React.FC<PaySlipModalProps> = ({ payslip, onClose }) => {
    if (!payslip) return null;

    const { employee, month, year, basicSalary, allowances, deductions, overtime, bonuses, netSalary, status, paymentDate, paymentMethod } = payslip;

        const totalAllowances = allowances.reduce((sum: number, item: PayItem) => sum + item.amount, 0);
        const totalDeductions = deductions.reduce((sum: number, item: PayItem) => sum + item.amount, 0);
        const totalBonuses = bonuses.reduce((sum: number, item: PayItem) => sum + item.amount, 0);
    const grossSalary = basicSalary + totalAllowances + totalBonuses + (overtime?.amount || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-6">Pay Slip</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><strong>Employee:</strong> {employee.firstName} {employee.lastName}</div>
                    <div><strong>Pay Period:</strong> {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</div>
                    <div><strong>Department:</strong> {employee.department?.name || 'N/A'}</div>
                    <div><strong>Status:</strong> <span className={`font-semibold ${status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{status}</span></div>
                </div>
                <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-x-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Earnings</h3>
                            <div className="flex justify-between"><span>Basic Salary:</span> <span>${basicSalary.toFixed(2)}</span></div>
                                                        {allowances.map((a: PayItem) => <div key={a.name} className="flex justify-between"><span>{a.name}:</span> <span>${a.amount.toFixed(2)}</span></div>)}
                                                        {bonuses.map((b: PayItem) => <div key={b.name} className="flex justify-between"><span>{b.name}:</span> <span>${b.amount.toFixed(2)}</span></div>)}
                            <div className="flex justify-between border-t mt-2 pt-2 font-bold"><span>Gross Salary:</span> <span>${grossSalary.toFixed(2)}</span></div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Deductions</h3>
                                                        {deductions.map((d: PayItem) => <div key={d.name} className="flex justify-between"><span>{d.name}:</span> <span>${d.amount.toFixed(2)}</span></div>)}
                            <div className="flex justify-between border-t mt-2 pt-2 font-bold"><span>Total Deductions:</span> <span>${totalDeductions.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
                <div className="text-right font-bold text-xl mt-6 border-t pt-4">Net Salary: ${netSalary.toFixed(2)}</div>
                {paymentDate && <div className="text-xs text-gray-500 mt-4">Paid on {new Date(paymentDate).toLocaleDateString()} via {paymentMethod}</div>}
            </div>
        </div>
    );
};

const Payroll: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [selectedPayslip, setSelectedPayslip] = useState<PaySlip | null>(null);

  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) })), []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getAll({ month: currentMonth, year: currentYear });
      setPayrollRecords(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch payroll data');
      toast.error('Failed to fetch payroll data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [currentMonth, currentYear]);

  const handleSelect = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) ? prev.filter(recId => recId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRecords(payrollRecords.map(r => r._id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleProcess = async (status: string) => {
    if (selectedRecords.length === 0) {
        toast.info('Please select records to process.');
        return;
    }
    try {
        const res = await payrollService.process({ payrollIds: selectedRecords, status });
        toast.success(res.message);
        fetchPayrollData();
        setSelectedRecords([]);
    } catch (error) {
        toast.error('Failed to process payroll.');
    }
  };

  const handleExport = async () => {
    try {
        const blob = await payrollService.export({ month: currentMonth, year: currentYear });
        saveAs(blob, `payroll-${currentMonth}-${currentYear}.csv`);
        toast.success('Payroll data exported successfully!');
    } catch (error) {
        toast.error('Failed to export payroll data.');
    }
  };

  const handleViewPayslip = async (id: string) => {
    try {
        const payslipData = await payrollService.getPaySlip(id);
        setSelectedPayslip(payslipData);
    } catch (error) {
        toast.error('Failed to fetch payslip details.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const summaryData = {
    totalEmployees: payrollRecords.length,
    totalPayroll: payrollRecords.reduce((acc, record) => acc + record.netSalary, 0),
    paidCount: payrollRecords.filter(r => r.status === 'paid').length,
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-50 p-8 rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Error Fetching Data</h2>
        <p className="text-red-600 text-center">{error}. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PaySlipModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payroll Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center"><Users className="h-8 w-8 text-blue-500 mr-4" /><div><p className="text-sm text-gray-500">Total Employees</p><p className="text-2xl font-bold text-gray-800">{summaryData.totalEmployees}</p></div></div>
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center"><DollarSign className="h-8 w-8 text-green-500 mr-4" /><div><p className="text-sm text-gray-500">Total Payroll Value</p><p className="text-2xl font-bold text-gray-800">${summaryData.totalPayroll.toLocaleString()}</p></div></div>
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center"><CheckCircle className="h-8 w-8 text-purple-500 mr-4" /><div><p className="text-sm text-gray-500">Paid Records</p><p className="text-2xl font-bold text-gray-800">{summaryData.paidCount}</p></div></div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
                <select value={currentMonth} onChange={e => setCurrentMonth(parseInt(e.target.value))} className="p-2 border rounded-md">{months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}</select>
                <select value={currentYear} onChange={e => setCurrentYear(parseInt(e.target.value))} className="p-2 border rounded-md">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => handleProcess('paid')} disabled={selectedRecords.length === 0} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 transition-colors flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Mark as Paid</button>
                <button onClick={handleExport} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center"><Download className="h-4 w-4 mr-2" />Export CSV</button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedRecords.length === payrollRecords.length && payrollRecords.length > 0} /></th>
                <th scope="col" className="px-6 py-3">Employee</th>
                <th scope="col" className="px-6 py-3">Department</th>
                <th scope="col" className="px-6 py-3">Net Salary</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((record) => (
                <tr key={record._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="w-4 p-4"><input type="checkbox" checked={selectedRecords.includes(record._id)} onChange={() => handleSelect(record._id)} /></td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{record.employeeName}</td>
                  <td className="px-6 py-4">{record.department}</td>
                  <td className="px-6 py-4 font-bold">${record.netSalary.toLocaleString()}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>{record.status}</span></td>
                  <td className="px-6 py-4"><button onClick={() => handleViewPayslip(record._id)} className="font-medium text-blue-600 hover:underline flex items-center"><Eye className="h-4 w-4 mr-1"/>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payrollRecords.length === 0 && (
            <div className="text-center py-12">
                <Info className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records found</h3>
                <p className="mt-1 text-sm text-gray-500">No payroll data available for the selected period. The system may generate them automatically.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;