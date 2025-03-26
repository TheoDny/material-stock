import { PrismaClient } from "@prisma/client"
import { permissions, PermissionSeed } from "./permission"

const prisma = new PrismaClient()

const seedPermissions = (permissionsArray: PermissionSeed[]) => {
    permissionsArray.forEach(async (permission) => {
        await prisma.permission.upsert({
            where: {
                code: permission.code,
            },
            create: {
                code: permission.code,
            },
            update: {},
        })
        console.log(`Permission "${permission.code}" seeded`)
    })
}

const seedAdminRole = async () => {
    await prisma.role.upsert({
        where: {
            id: "cm8q88831000008jo38u2f5os",
        },
        create: {
            name: "Admin",
            description: "Role administreur with every permission",
            Permissions: {
                connect: permissions.map((permission) => {
                    return { code: permission.code }
                }),
            },
        },
        update: {
            Permissions: {
                set: permissions.map((permission) => {
                    return { code: permission.code }
                }),
            },
        },
    })
    console.log(`Role "admin" seeded`)
}

async function main() {
    console.log(" === Start Seeding === \n")
    seedPermissions(permissions)
    console.log("\n === End Seeding === \n")
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        // process.exit(1);
    })

