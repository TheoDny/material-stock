import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { sendResetPassword } from "@/services/mail.service";
import { nextCookies } from "better-auth/next-js";

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
            sendResetPassword(data.user.email, data.url);
        },
    },
    plugins: [nextCookies()] 
});