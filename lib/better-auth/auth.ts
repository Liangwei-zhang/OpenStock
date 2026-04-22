import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies } from 'better-auth/next-js';
import { connectToDatabase } from '@/database/mongoose';

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
    if (authInstance) {
        return authInstance;
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection;

    if (!db) {
        throw new Error('MongoDB connection not found!');
    }

    authInstance = betterAuth({
        database: mongodbAdapter(db as any),
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        plugins: [nextCookies()],
    });

    return authInstance;
};

const apiProxy = new Proxy(
    {},
    {
        get(_target, prop) {
            return async (...args: any[]) => {
                const instance = await getAuth();
                const apiMember = (instance.api as Record<string, unknown>)[prop as string];

                if (typeof apiMember !== 'function') {
                    return apiMember;
                }

                return (apiMember as (...fnArgs: any[]) => unknown)(...args);
            };
        },
    }
);

export const auth = {
    api: apiProxy,
} as Awaited<ReturnType<typeof getAuth>>;
