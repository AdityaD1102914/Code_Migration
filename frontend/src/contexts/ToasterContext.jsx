import React, { createContext, useContext, useState, useCallback } from 'react';
import Toaster from '../components/toaster/Toaster';

const ToasterContext = createContext();

export const useToasterContext = () => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToasterContext must be used within a ToasterProvider');
  }
  return context;
};

const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, type, message };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    addToast,
    removeToast,
  };

  return (
    <ToasterContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} />
    </ToasterContext.Provider>
  );
};

export default ToasterProvider;