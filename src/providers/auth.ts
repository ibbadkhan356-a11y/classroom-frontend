import { AuthProvider } from "@refinedev/core";
import { authClient } from "@/lib/auth-client";
import { clearAccessControlCache } from "./accessControl";

export const authProvider: AuthProvider = {
    login: async ({ email, password }: any) => {
        const { data, error } = await authClient.signIn.email({ email, password });
        if (error) {
            return {
                success: false,
                error: {
                    name: "Login Error",
                    message: error.message || "Invalid email or password",
                },
            };
        }
        clearAccessControlCache();
        return {
            success: true,
            redirectTo: "/",
        };
    },
    logout: async () => {
        const { error } = await authClient.signOut();
        if (error) {
            return {
                success: false,
                error: {
                    name: "Logout Error",
                    message: error.message || "Failed to logout",
                },
            };
        }
        clearAccessControlCache();
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const { data } = await authClient.getSession();
        if (!data) {
            return {
                authenticated: false,
            };
        }
        return {
            authenticated: true,
        };
    },
    getPermissions: async () => {
        const { data } = await authClient.getSession();
        return (data?.user as any)?.role || null;
    },
    getIdentity: async () => {
        const { data } = await authClient.getSession();
        if (data?.user) {
            return {
                ...data.user,
                id: data.user.id,
                name: data.user.name,
                avatar: data.user.image,
            };
        }
        return null;
    },
    onError: async (error: any) => {
        console.error(error);
        return { error };
    },
    register: async ({ email, password, name, role = 'student' }: any) => {
        // @ts-ignore
        const { data, error } = await authClient.signUp.email({ email, password, name, role });
        if (error) {
            console.error("Registration Error details:", error);
            return {
                success: false,
                error: {
                    name: "Registration Error",
                    message: error.message || "Failed to register",
                },
            };
        }
        return {
            success: true,
            redirectTo: "/",
        };
    }
};
