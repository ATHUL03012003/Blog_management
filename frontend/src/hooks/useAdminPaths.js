import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { createAdminPaths, getAdminBaseFromPath } from '../constants/adminPaths';

export function useAdminPaths() {
  const { pathname } = useLocation();
  const base = getAdminBaseFromPath(pathname);
  return useMemo(() => createAdminPaths(base), [base]);
}

export function useAdminBase() {
  const { pathname } = useLocation();
  return getAdminBaseFromPath(pathname);
}
