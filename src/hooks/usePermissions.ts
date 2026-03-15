import { useStore } from '../store/useStore'

export type AppModule = 'supplies' | 'products' | 'customers' | 'sales' | 'production' | 'crm'

interface RolePerms {
  edit:   AppModule[]
  delete: AppModule[]
}

// Only Administrador can delete. Other roles can edit within their scope.
const ROLE_PERMS: Record<string, RolePerms> = {
  Administrador: {
    edit:   ['supplies','products','customers','sales','production','crm'],
    delete: ['supplies','products','customers','sales','production','crm'],
  },
  Producción: {
    edit:   ['production','supplies'],
    delete: [],
  },
  Ventas: {
    edit:   ['sales','customers','crm'],
    delete: ['crm'],
  },
  Inventario: {
    edit:   ['supplies','products'],
    delete: [],
  },
  Contabilidad: {
    edit:   [],
    delete: [],
  },
}

export function usePermissions() {
  const { user } = useStore()
  const role = user?.role ?? 'Contabilidad'
  const perms = ROLE_PERMS[role] ?? { edit: [], delete: [] }

  return {
    role,
    canEdit:   (module: AppModule) => perms.edit.includes(module),
    canDelete: (module: AppModule) => perms.delete.includes(module),
    // Expose full map for the settings matrix
    allRoles: ROLE_PERMS,
  }
}
