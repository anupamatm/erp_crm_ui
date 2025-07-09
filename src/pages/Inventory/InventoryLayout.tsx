import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const { Content, Sider } = Layout;
import {
  DashboardOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const InventoryLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('dashboard');

  // Update selected key when location changes
  useEffect(() => {
    const path = location.pathname.split('/');
    const currentKey = path[2] || 'dashboard';
    setSelectedKey(currentKey);
  }, [location]);

  // Redirect to /inventory if no matching route
  useEffect(() => {
    if (location.pathname === '/inventory/') {
      navigate('/inventory', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className="site-layout-background">
        <div className="p-4 text-white font-bold text-lg">
          Inventory Management
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/inventory">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="items" icon={<ShoppingOutlined />}>
            <Link to="/inventory/items">Inventory Items</Link>
          </Menu.Item>
          <Menu.Item key="categories" icon={<UnorderedListOutlined />}>
            <Link to="/inventory/categories">Categories</Link>
          </Menu.Item>
          <Menu.Item key="suppliers" icon={<TeamOutlined />}>
            <Link to="/inventory/suppliers">Suppliers</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ padding: '24px' }}>
        <Content
          className="site-layout-background"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 'calc(100vh - 48px)',
            background: '#fff',
            borderRadius: 4,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default InventoryLayout;
