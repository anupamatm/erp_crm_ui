import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { NavigationItem } from '../constants/navigation';

interface LayoutProps {
  navigation: NavigationItem[];
  children?: ReactNode;
}

export default function Layout({ navigation, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar navigation={navigation} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
