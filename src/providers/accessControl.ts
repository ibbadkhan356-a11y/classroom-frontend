import { AccessControlProvider } from "@refinedev/core";
import { authClient } from "@/lib/auth-client";

let cachedRole: string | null = null;
let lastCheck = 0;

export const clearAccessControlCache = () => {
    cachedRole = null;
    lastCheck = 0;
};

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }) => {
        if (Date.now() - lastCheck > 60000 || !cachedRole) {
            const { data } = await authClient.getSession();
            cachedRole = (data?.user as any)?.role || 'guest';
            lastCheck = Date.now();
        }
        
        const role = cachedRole;

        if (role === 'admin') {
            return { can: true };
        }

        if (role === 'teacher') {
            if (['users'].includes(resource || '')) {
                return { can: false, reason: "Teachers do not have access to manage this resource." };
            }
            if (['departments', 'subjects'].includes(resource || '')) {
                if (action === 'list' || action === 'show') {
                    return { can: true };
                }
                return { can: false, reason: "Teachers only have view access for this resource." };
            }
            if (resource === 'classes') {
                if (['list', 'show', 'create', 'edit'].includes(action)) {
                    return { can: true };
                }
                return { can: false, reason: "Teachers cannot delete classes." };
            }
            if (resource === 'dashboard') {
                return { can: true };
            }
        }

        if (role === 'student') {
            if (['users'].includes(resource || '')) {
                return { can: false, reason: "Students do not have access to this resource." };
            }
            if (['departments', 'subjects', 'classes'].includes(resource || '')) {
                if (action === 'list' || action === 'show') {
                    return { can: true };
                }
                return { can: false, reason: "Students only have view access." };
            }
            if (resource === 'dashboard') {
                return { can: true };
            }
        }

        return { can: false, reason: "Unauthorized" };
    }
};
