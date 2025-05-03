// src/components/Layout.tsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ navigation }: { navigation: any[] }) {
  return (
    <div className="flex min-h-screen">
      
      <Sidebar navigation={navigation} />

      <main className="flex-1 p-6">
        {/* **Outlet** renders whichever child <Route> matched */}
        <Outlet />
      </main>
    </div>
  );
}
