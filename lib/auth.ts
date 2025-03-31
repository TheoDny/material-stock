import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"
import { sendResetPassword } from "@/services/mail.service"
import { nextCookies } from "better-auth/next-js"
import { customSession } from "better-auth/plugins"
import { getUserRolesPermissionsAndEntities } from "@/services/auth.service"

const prisma = new PrismaClient()
export const auth = betterAuth({
    user: {
        additionalFields: {
            // firstname: {
            //     type: "string",
            //     required: true,
            //     input: true,
            // },
            // lastname: {
            //     type: "string",
            //     required: true,
            //     input: true,
            // },
            active: {
                type: "boolean",
                required: false,
                defaultValue: true,
                input: true,
                returned: true,
            },
            entitySelectedId: {
                type: "string",
                required: false,
                defaultValue: "cm8skzpbi0001e58ge65z1rkz", // admin entity
                input: true,
            },
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 16,
        maxPasswordLength: 128,
        async sendResetPassword(data, request) {
            sendResetPassword(data.user.email, data.url)
        },
    },
    plugins: [
        customSession(async ({ user, session }) => {
            const userInfer = user as typeof user & { entitySelectedId: string }
            const rolesPermissionAndEntities = await getUserRolesPermissionsAndEntities(session.userId)
            return {
                user: {
                    Roles: rolesPermissionAndEntities.Roles,
                    Permissions: rolesPermissionAndEntities.Permissions,
                    Entities: rolesPermissionAndEntities.Entities,
                    ...userInfer,
                },
                session,
            }
        }),
        nextCookies(),
    ],
})

export type Session = typeof auth.$Infer.Session