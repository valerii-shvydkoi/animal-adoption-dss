import { useContext } from 'react';
import { AHPContext } from '../context/AHPContext';
export const useAHP = () => {
  const context = useContext(AHPContext);
  if (!context) {
    throw new Error('useAHP повинен використовуватися всередині AHPProvider');
  }
  return context;
};
