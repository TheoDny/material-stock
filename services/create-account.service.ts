import { prisma } from '@/lib/prisma';
import { TokenCreateAccount } from '@prisma/client';
import { isPast,addDays } from 'date-fns';


export async function checkToken(token?: string): Promise<boolean> {
    try {
        // If no token is provided, return false
        if (!token) {
            return false;
        }

        // Check if the token is present in the model TokenCreateAccount
        const tokenRecord = await prisma.tokenCreateAccount.findFirst({
            where: {
                token: token
            }
        });

        // If token doesn't exist, return false
        if (!tokenRecord) {
            return false;
        }

        // Check if the token is expired
        const isExpired = isPast(tokenRecord.expiresAt);
        
        // If token is expired, return false
        if (isExpired) {
            return false;
        }

        // Token exists and is not expired
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function generateRandomToken(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const tokenLength = 64;
    let token = '';
    
    for (let i = 0; i < tokenLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }
    
    return token;
}

export async function createToken(email: string, token: string): Promise<TokenCreateAccount> {
    const expiresAt = addDays(new Date(), 7);
    
    const created = await prisma.tokenCreateAccount.create({
        data: {
            token,
            email,
            expiresAt
        }
    });

    return created;
}