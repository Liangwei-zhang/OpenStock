'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
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

export async function addToWatchlist(userId: string, symbol: string, company: string) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId(userId);
        await connectToDatabase();

        const newItem = await Watchlist.findOneAndUpdate(
            { userId: authenticatedUserId, symbol: symbol.toUpperCase() },
            {
                userId: authenticatedUserId,
                symbol: symbol.toUpperCase(),
                company,
                addedAt: new Date()
            },
            { upsert: true, new: true }
        );

        revalidatePath('/watchlist');
        return JSON.parse(JSON.stringify(newItem));
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        throw new Error('Failed to add to watchlist');
    }
}

export async function removeFromWatchlist(userId: string, symbol: string) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId(userId);
        await connectToDatabase();
        await Watchlist.findOneAndDelete({ userId: authenticatedUserId, symbol: symbol.toUpperCase() });
        revalidatePath('/watchlist');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        throw new Error('Failed to remove from watchlist');
    }
}

export async function getUserWatchlist(userId: string) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId(userId);
        await connectToDatabase();
        const watchlist = await Watchlist.find({ userId: authenticatedUserId }).sort({ addedAt: -1 });
        return JSON.parse(JSON.stringify(watchlist));
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
    }
}

export async function isStockInWatchlist(userId: string, symbol: string) {
    try {
        const authenticatedUserId = await getAuthenticatedUserId(userId);
        await connectToDatabase();
        const item = await Watchlist.findOne({ userId: authenticatedUserId, symbol: symbol.toUpperCase() });
        return !!item;
    } catch (error) {
        console.error('Error checking watchlist status:', error);
        return false;
    }
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
} 
