'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

async function getAuthenticatedUserId(expectedUserId?: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    const sessionUserId = session?.user?.id;

    if (!sessionUserId) {
        throw new Error('Unauthorized');
    }

    if (expectedUserId && expectedUserId !== sessionUserId) {
        throw new Error('Forbidden');
    }

    return sessionUserId;
}

export async function createAlert(params: {
    userId: string;
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
}) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId(params.userId);
        await connectToDatabase();
        const newAlert = await Alert.create({
            ...params,
            userId: authenticatedUserId,
            active: true,
        });
        revalidatePath('/watchlist');
        return JSON.parse(JSON.stringify(newAlert));
    } catch (error) {
        console.error('Error creating alert:', error);
        throw new Error('Failed to create alert');
    }
}

export async function getUserAlerts(userId: string) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId(userId);
        await connectToDatabase();
        const alerts = await Alert.find({ userId: authenticatedUserId }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(alerts));
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}

export async function deleteAlert(alertId: string) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId();
        await connectToDatabase();
        await Alert.findOneAndDelete({ _id: alertId, userId: authenticatedUserId });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error deleting alert:', error);
        throw new Error('Failed to delete alert');
    }
}

export async function toggleAlert(alertId: string, active: boolean) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId();
        await connectToDatabase();
        await Alert.findOneAndUpdate({ _id: alertId, userId: authenticatedUserId }, { active });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error toggling alert:', error);
        throw new Error('Failed to update alert');
    }
}
