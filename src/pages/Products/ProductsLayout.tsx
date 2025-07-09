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
    if (path.includes('/products/requirements')) return 'requirements';
    if (path.includes('/products/training')) return 'training';
    if (path.includes('/products/suggestions')) return 'suggestions';
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
      case 'requirements':
        navigate('/products/requirements');
        break;
      case 'training':
        navigate('/products/training');
        break;
      case 'suggestions':
        navigate('/products/suggestions');
        break;
    }
  };

  const getButtonText = () => {
    switch (activeTab) {
      case 'products':
        return 'Add Product';
      case 'categories':
        return 'Add Category';
      case 'requirements':
        return 'New Requirement';
      case 'training':
        return 'New Training';
      case 'suggestions':
        return 'New Suggestion';
      default:
        return 'Add New';
    }
  };

  const handleAddNew = () => {
    switch (activeTab) {
      case 'products':
        navigate('/products/new');
        break;
      case 'categories':
        navigate('/products/categories/new');
        break;
      case 'requirements':
        // Handle new requirement
        break;
      case 'training':
        // Handle new training
        break;
      case 'suggestions':
        // navigate('/products/suggestions/new');
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {activeTab === 'products' && 'Products Management'}
          {activeTab === 'categories' && 'Product Categories'}
          {activeTab === 'requirements' && 'Product Requirements'}
          {activeTab === 'training' && 'Product Training'}
          {activeTab === 'suggestions' && 'Product Suggestions'}
        </h1>
        {/* <div className="flex space-x-2">
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            {getButtonText()}
          </Button>
        </div> */}
      </div>

      <div className="border-b border-gray-200 mb-6">
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
          <TabsTrigger 
            data-state={activeTab === 'requirements' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('requirements')}
          >
            Requirements
          </TabsTrigger>
          <TabsTrigger 
            data-state={activeTab === 'training' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('training')}
          >
            Training
          </TabsTrigger>
          <TabsTrigger 
            data-state={activeTab === 'suggestions' ? 'active' : 'inactive'}
            onClick={() => handleTabClick('suggestions')}
          >
            Suggestions
          </TabsTrigger>
        </TabsList>
      </div>

      <Outlet />
    </div>
  );
};

export default ProductsLayout;
