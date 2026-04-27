// frontend/src/context/EmployeeAuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { employeeAPI } from '../api/employeeAPI';

const EmployeeAuthContext = createContext(null);

export const useEmployeeAuth = () => {
  const context = useContext(EmployeeAuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within EmployeeAuthProvider');
  }
  return context;
};

export const EmployeeAuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('employeeToken');
    const employeeData = localStorage.getItem('employeeData');
    
    console.log("EmployeeAuth: Checking authentication...");
    console.log("Token exists:", !!token);
    
    if (token && employeeData) {
      try {
        const response = await employeeAPI.getProfile();
        if (response.success && response.employee) {
          setEmployee(response.employee);
          localStorage.setItem('employeeData', JSON.stringify(response.employee));
          console.log("EmployeeAuth: Authenticated as", response.employee.username);
        } else {
          setEmployee(JSON.parse(employeeData));
          console.log("EmployeeAuth: Using stored employee data");
        }
      } catch (err) {
        console.error("EmployeeAuth: Auth check failed", err);
        if (err.response?.status === 401) {
          logout();
        } else {
          setEmployee(JSON.parse(employeeData));
        }
      }
    } else {
      console.log("EmployeeAuth: Not authenticated");
    }
    setLoading(false);
    setIsInitialized(true);
  };

  const login = async (credentials) => {
    setError(null);
    setLoading(true);
    
    try {
      console.log("EmployeeAuth: Attempting login for", credentials.email);
      const response = await employeeAPI.login(credentials);
      
      if (response.success && response.token) {
        localStorage.setItem('employeeToken', response.token);
        localStorage.setItem('employeeData', JSON.stringify(response.employee));
        setEmployee(response.employee);
        
        console.log("EmployeeAuth: Login successful for", response.employee.username);
        return { success: true, employee: response.employee };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      console.error("EmployeeAuth: Login error", err);
      const errorMessage = err.message || err.error || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setError(null);
    setLoading(true);
    
    try {
      console.log("EmployeeAuth: Attempting registration");
      const response = await employeeAPI.register(formData);
      
      if (response.success && response.token) {
        localStorage.setItem('employeeToken', response.token);
        localStorage.setItem('employeeData', JSON.stringify(response.employee));
        setEmployee(response.employee);
        
        console.log("EmployeeAuth: Registration successful for", response.employee.username);
        return { success: true, employee: response.employee };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (err) {
      console.error("EmployeeAuth: Registration error", err);
      const errorMessage = err.message || err.error || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("EmployeeAuth: Logging out");
    
    try {
      await employeeAPI.logout();
    } catch (err) {
      console.error("EmployeeAuth: Logout API error", err);
    } finally {
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employeeData');
      sessionStorage.clear();
      setEmployee(null);
      setError(null);
      console.log("EmployeeAuth: Logout complete, storage cleared");
    }
  };

  const updateEmployee = async (formData) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await employeeAPI.updateProfile(formData);
      
      if (response.success && response.employee) {
        const updatedEmployee = { ...employee, ...response.employee };
        setEmployee(updatedEmployee);
        localStorage.setItem('employeeData', JSON.stringify(updatedEmployee));
        
        console.log("EmployeeAuth: Profile updated successfully");
        return { success: true, employee: updatedEmployee };
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (err) {
      console.error("EmployeeAuth: Update error", err);
      const errorMessage = err.message || err.error || "Update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshEmployee = async () => {
    try {
      const response = await employeeAPI.getProfile();
      if (response.success && response.employee) {
        setEmployee(response.employee);
        localStorage.setItem('employeeData', JSON.stringify(response.employee));
        return response.employee;
      }
      return null;
    } catch (err) {
      console.error("EmployeeAuth: Refresh error", err);
      return null;
    }
  };

  const value = {
    employee,
    loading,
    error,
    isAuthenticated: !!employee,
    isAdmin: employee?.isAdmin === true || employee?.userType === 'admin',
    isInitialized,
    login,      // Make sure this is included
    register,   // Make sure this is included
    logout,     // Make sure this is included
    updateEmployee,
    refreshEmployee,
    getToken: () => localStorage.getItem('employeeToken'),
    getEmployee: () => employee,
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};