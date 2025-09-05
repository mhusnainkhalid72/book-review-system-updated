// src/lib/RBAC.ts


export function permissionMatches(granted: string, required: string): boolean {
  
  if (granted === '*') return true;

  const gParts = granted.split('.');
  const rParts = required.split('.');

  for (let i = 0; i < Math.max(gParts.length, rParts.length); i++) {
    const gp = gParts[i];
    const rp = rParts[i];

    if (!gp) return false;
    if (gp === '*') return true;
    if (!rp) return false;
    if (gp === rp) continue;
   
    if (gp.endsWith('*')) {
      const prefix = gp.slice(0, -1);
      return rp.startsWith(prefix);
    }
  
    return false;
  }
 
  return gParts.join('.') === rParts.join('.');
}


export function anyPermissionMatches(grantedList: string[], required: string): boolean {
  for (const g of grantedList) {
    if (permissionMatches(g, required)) return true;
  }
  return false;
}
