export enum Role {
  ADMIN = 'admin',
  SALES = 'sales',
  VIEWER = 'viewer',
}

// Permissions för varje roll
export const RolePermissions = {
  [Role.ADMIN]: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewAll: true, // Kan se alla användares data i teamet
    canManageUsers: true,
    canManageTeam: true,
  },
  [Role.SALES]: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canViewAll: false, // Kan bara se egen data (om inte teamet tillåter)
    canManageUsers: false,
    canManageTeam: false,
  },
  [Role.VIEWER]: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canViewAll: true, // Kan se data men inte ändra
    canManageUsers: false,
    canManageTeam: false,
  },
};
