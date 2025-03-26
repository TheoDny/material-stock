import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {    
        enabled: true,
        minPasswordLength: 16,
        maxPasswordLength: 128,
        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
        },
    } 
});