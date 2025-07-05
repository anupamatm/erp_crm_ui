import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ReportData {
  dateRange: string;
  selectedCategory: string;
  totalAmount: number;
  averageAmount: number;
  transactionCount: number;
  categoryData: Array<{
    name: string;
    value: number;
    percentage: string;
  }>;
  monthlyTrendData: Array<{
    month: string;
    amount: number;
  }>;
  topExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  expenses: Array<any>;
}

export const exportFinancialReport = (data: ReportData) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246);
  doc.text('FINANCIAL REPORT', 20, yPosition);
  yPosition += 15;

  // Company Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Finance ERP System - Comprehensive Financial Analysis', 20, yPosition);
  yPosition += 10;
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Report Period: ${data.dateRange.replace(/([A-Z])/g, ' $1')}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Category Filter: ${data.selectedCategory === 'all' ? 'All Categories' : data.selectedCategory}`, 20, yPosition);
  yPosition += 20;

  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('EXECUTIVE SUMMARY', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  // Key Metrics Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPosition - 5, 170, 40, 'FD');
  
  doc.text(`Total Expenses: $${data.totalAmount.toFixed(2)}`, 25, yPosition + 5);
  doc.text(`Average Transaction: $${data.averageAmount.toFixed(2)}`, 25, yPosition + 15);
  doc.text(`Total Transactions: ${data.transactionCount}`, 25, yPosition + 25);
  doc.text(`Active Categories: ${data.categoryData.length}`, 120, yPosition + 5);
  doc.text(`Highest Expense: $${data.topExpenses[0]?.amount.toFixed(2) || '0.00'}`, 120, yPosition + 15);
  doc.text(`Most Active Category: ${data.categoryData[0]?.name || 'N/A'}`, 120, yPosition + 25);
  
  yPosition += 50;

  // Category Breakdown
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text('CATEGORY BREAKDOWN', 20, yPosition);
  yPosition += 10;

  const categoryTableData = data.categoryData.map(category => [
    category.name,
    `$${category.value.toFixed(2)}`,
    `${category.percentage}%`,
    `${Math.round((category.value / data.totalAmount) * data.transactionCount)} transactions`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Amount', 'Percentage', 'Est. Transactions']],
    body: categoryTableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Monthly Trend Analysis
  if (data.monthlyTrendData.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('MONTHLY TREND ANALYSIS', 20, yPosition);
    yPosition += 10;

    const monthlyTableData = data.monthlyTrendData.map(month => [
      month.month,
      `$${month.amount.toFixed(2)}`,
      data.monthlyTrendData.indexOf(month) > 0 
        ? `${((month.amount - data.monthlyTrendData[data.monthlyTrendData.indexOf(month) - 1].amount) / data.monthlyTrendData[data.monthlyTrendData.indexOf(month) - 1].amount * 100).toFixed(1)}%`
        : 'N/A'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Month', 'Total Expenses', 'Change %']],
      body: monthlyTableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Top Expenses
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text('TOP EXPENSES', 20, yPosition);
  yPosition += 10;

  const topExpensesData = data.topExpenses.map(expense => [
    expense.description.length > 40 ? expense.description.substring(0, 40) + '...' : expense.description,
    expense.category,
    format(new Date(expense.date), 'MMM dd, yyyy'),
    `$${expense.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Category', 'Date', 'Amount']],
    body: topExpensesData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, halign: 'right' },
    },
  });

  // Add new page for detailed transactions if needed
  if (data.expenses.length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('DETAILED TRANSACTION LOG', 20, yPosition);
    yPosition += 15;

    const detailedData = data.expenses.slice(0, 50).map(expense => [
      format(new Date(expense.date), 'MM/dd/yyyy'),
      expense.description.length > 35 ? expense.description.substring(0, 35) + '...' : expense.description,
      expense.category,
      `$${expense.amount.toFixed(2)}`,
      expense.notes ? (expense.notes.length > 20 ? expense.notes.substring(0, 20) + '...' : expense.notes) : '-'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Description', 'Category', 'Amount', 'Notes']],
      body: detailedData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 35 },
      },
    });
  }

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
    doc.text('Generated by Finance ERP System', 120, doc.internal.pageSize.height - 10);
    doc.text(`Report Date: ${format(new Date(), 'MM/dd/yyyy')}`, 20, doc.internal.pageSize.height - 5);
  }

  // Save the PDF
  doc.save(`financial-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
};