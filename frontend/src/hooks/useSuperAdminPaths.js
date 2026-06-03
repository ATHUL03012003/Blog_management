import { useMemo } from 'react';
import { superadminPaths, SUPERADMIN_NAV_ITEMS } from '../constants/superadminPaths';

export function useSuperAdminPaths() {
  return useMemo(() => superadminPaths, []);
}

export { superadminPaths, SUPERADMIN_NAV_ITEMS };
