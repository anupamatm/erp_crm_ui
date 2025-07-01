import React from 'react';

// Table components
export const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="border rounded-md w-full overflow-hidden">
    <table className="w-full">{children}</table>
  </div>
);

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-gray-200">{children}</tbody>
);

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="hover:bg-gray-50">{children}</tr>
);

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-6 py-4 whitespace-nowrap">{children}</td>
);
