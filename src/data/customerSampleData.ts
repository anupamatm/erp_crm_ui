// src/data/customerSampleData.ts
export const customerSampleData = {
    profile: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Inc.",
      address: "123 Business St, Suite 100, New York, NY 10001",
      joinDate: "2023-01-15",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff"
    },
    stats: {
      totalOrders: 24,
      totalSpent: 12500,
      averageOrder: 520.83,
      lastOrder: "2023-06-10"
    },
    recentOrders: [
      {
        id: "ORD-1001",
        date: "2023-06-10",
        status: "Delivered",
        total: 1245.99,
        items: 3
      },
      {
        id: "ORD-1000",
        date: "2023-05-28",
        status: "Shipped",
        total: 845.50,
        items: 2
      },
      {
        id: "ORD-999",
        date: "2023-05-15",
        status: "Processing",
        total: 2100.00,
        items: 5
      }
    ],
    recentInvoices: [
      {
        id: "INV-5001",
        date: "2023-06-05",
        dueDate: "2023-07-05",
        amount: 1245.99,
        status: "Paid"
      },
      {
        id: "INV-5000",
        date: "2023-05-20",
        dueDate: "2023-06-20",
        amount: 2100.00,
        status: "Pending"
      }
    ]
  };