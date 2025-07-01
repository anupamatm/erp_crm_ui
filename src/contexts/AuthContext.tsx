import React, { createContext, useContext, ReactNode, useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: Partial<User>) => void;
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // For demo purposes, we'll use mock user data
  // In a real app, this would come from your authentication system
  const [user, setUser] = useState<User | null>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    employeeId: 'EMP001',
    role: 'employee',
  });

  const login = (userData: Partial<User>) => {
    // In a real app, this would validate credentials with your backend
    console.log('Login with:', userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
