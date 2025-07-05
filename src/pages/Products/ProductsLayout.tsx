import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

const ProductsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/products/categories')) return 'categories';
    return 'products';
  };
  
  const activeTab = getActiveTab();

  const handleTabClick = (tab: string) => {
    switch (tab) {
      case 'products':
        navigate('/products');
        break;
      case 'categories':
        navigate('/products/categories');
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => 
              activeTab === 'products' 
                ? navigate('/products/new') 
                : navigate('/products/categories/new')
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === 'products' ? 'Add Product' : 'Add Category'}
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <TabsList>
          <TabsTrigger 
            data-state={activeTab === 'products' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('products')}
          >
            Products
          </TabsTrigger>
          <TabsTrigger 
            data-state={activeTab === 'categories' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('categories')}
          >
            Categories
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ProductsLayout;
