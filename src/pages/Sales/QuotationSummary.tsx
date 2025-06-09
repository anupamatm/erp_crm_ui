import React from 'react';

type QuotationItem = {
  quantity: number;
  price: number;
};

type Quotation = {
  total?: number;
  status: string;
  dueDate?: string;
  items?: QuotationItem[];
};

const QuotationSummary = ({ quotations }: { quotations: Quotation[] }) => {
  // Helper to get total safely, fallback to sum of items or 0
  const getTotal = (quotation: Quotation): number => {
    if (typeof quotation.total === 'number' && !isNaN(quotation.total)) {
      return quotation.total;
    }
    if (quotation.items && Array.isArray(quotation.items)) {
      return quotation.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
    }
    return 0;
  };

  const totalOutstanding = quotations.reduce((acc, quotation) => {
    if (quotation.status !== 'paid') acc += getTotal(quotation);
    return acc;
  }, 0);
  console.log(totalOutstanding)

  const overdueAmount = quotations.reduce((acc, quotation) => {
    if (quotation.status === 'overdue') acc += getTotal(quotation);
    return acc;
  }, 0);

  const dueSoonAmount = quotations.reduce((acc, quotation) => {
    if (!quotation.dueDate) return acc;
    const dueDate = new Date(quotation.dueDate);
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysLeft = timeDiff / (1000 * 3600 * 24);
    if (daysLeft <= 7 && daysLeft >= 0 && quotation.status !== 'paid') {
      acc += getTotal(quotation);
    }
    return acc;
  }, 0);

  const paidAmount = quotations.reduce((acc, quotation) => {
    if (quotation.status === 'paid') acc += getTotal(quotation);
    return acc;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-2">
          ${totalOutstanding.toFixed(2)}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
        <p className="text-2xl font-semibold text-red-600 mt-2">
          ${overdueAmount.toFixed(2)}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Due in 7 Days</h3>
        <p className="text-2xl font-semibold text-orange-600 mt-2">
          ${dueSoonAmount.toFixed(2)}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Paid Last 30 Days</h3>
        <p className="text-2xl font-semibold text-green-600 mt-2">
          ${paidAmount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default QuotationSummary;

