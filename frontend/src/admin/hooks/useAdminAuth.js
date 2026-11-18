import { useContext } from 'react';
import AuthContext from '../../context/AuthContext.jsx';

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be within AuthProvider');
  return ctx; // { user, token, login, logout, isLoading }
}
