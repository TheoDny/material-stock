import { PrismaClient } from "@/prisma/generated"
import { permissions, PermissionSeed } from "./permission"

const prisma = new PrismaClient()

const seedPermissions = async (permissionsArray: PermissionSeed[]) => {
    await Promise.all(
        permissionsArray.map((permission) =>
            prisma.permission
                .upsert({
                    where: {
                        code: permission.code,
                    },
                    create: {
                        code: permission.code,
                    },
                    update: {},
                })
                .then(() => console.log(`Permission "${permission.code}" seeded`)),
        ),
    )
}

const seedAdminRole = async () => {
    await prisma.role.upsert({
        where: {
            id: "cm8q88831000008jo38u2f5os",
        },
        create: {
            id: "cm8q88831000008jo38u2f5os",
            name: "Super Admin",
            description: "Role administreur with every permission",
            Permissions: {
                connect: permissions.map((permission) => {
                    return { code: permission.code }
                }),
            },
        },
        update: {
            name: "Super Admin",
            description: "Role administreur with every permission",
            Permissions: {
                set: permissions.map((permission) => {
                    return { code: permission.code }
                }),
            },
        },
    })
    console.log(`Role "Super Admin" seeded`)
}

const seedEntityAdmin = async () => {
    await prisma.entity.upsert({
        where: {
            id: "cm8skzpbi0001e58ge65z1rkz",
        },
        create: {
            id: "cm8skzpbi0001e58ge65z1rkz",
            name: "Admin Entity",
        },
        update: {
            name: "Admin Entity",
        },
    })
    console.log(`Entity "admin" seeded`)
}

const seedAdminUser = async () => {
    const allEntities = await prisma.entity.findMany()

    await prisma.user.upsert({
        where: {
            id: "UOOl0OSwsUWelQZxSOK8RxaOtb5dS71b",
        },
        create: {
            id: "UOOl0OSwsUWelQZxSOK8RxaOtb5dS71b",
            name: "Super Admin",
            email: "admin@admin.com",
            emailVerified: true,
            active: true,
            entitySelectedId: "cm8skzpbi0001e58ge65z1rkz",
            Entities: {
                connect: allEntities.map((entity) => {
                    return { id: entity.id }
                }),
            },
            Roles: {
                connect: {
                    id: "cm8q88831000008jo38u2f5os",
                },
            },
            accounts: {
                create: {
                    id: "UOOl0ORrsVWalQUxSOK8RxaKtd8dT41b",
                    accountId: "UOOl0OSwsUWelQZxSOK8RxaOtb5dS71b",
                    providerId: "credential",
                    password:
                        "ddfad631b8c1c7613ed20706c8bc12f1:5d3774c2344797da1eb1675bd01eaf3462d6c04ca57f1b862d80f930c005c782dcfa8e9d8190828b00aff68ddcd3edde410cdd87e3c2c0829102ed9fbcdda6c7",
                },
            },
        },
        update: {
            name: "Super Admin",
            emailVerified: true,
            active: true,
            entitySelectedId: "cm8skzpbi0001e58ge65z1rkz",
            Roles: {
                set: {
                    id: "cm8q88831000008jo38u2f5os",
                },
            },
            Entities: {
                set: allEntities.map((entity) => {
                    return { id: entity.id }
                }),
            },
            accounts: {
                upsert: {
                    where: {
                        id: "UOOl0ORrsVWalQUxSOK8RxaKtd8dT41b",
                    },
                    create: {
                        id: "UOOl0ORrsVWalQUxSOK8RxaKtd8dT41b",
                        accountId: "UOOl0OSwsUWelQZxSOK8RxaOtb5dS71b",
                        providerId: "credential",
                        password:
                            "ddfad631b8c1c7613ed20706c8bc12f1:5d3774c2344797da1eb1675bd01eaf3462d6c04ca57f1b862d80f930c005c782dcfa8e9d8190828b00aff68ddcd3edde410cdd87e3c2c0829102ed9fbcdda6c7",
                    },
                    update: {
                        accountId: "UOOl0OSwsUWelQZxSOK8RxaOtb5dS71b",
                        providerId: "credential",
                        password:
                            "ddfad631b8c1c7613ed20706c8bc12f1:5d3774c2344797da1eb1675bd01eaf3462d6c04ca57f1b862d80f930c005c782dcfa8e9d8190828b00aff68ddcd3edde410cdd87e3c2c0829102ed9fbcdda6c7",
                    },
                },
            },
        },
    })

    console.log(`User "Super Admin" seeded`)
}

async function main() {
    console.log(" ===== Start Seeding ===== \n")
    console.log(" == Seeding Permission == \n")
    await seedPermissions(permissions)
    console.log("\n == Seeding Admin Role == \n")
    await seedAdminRole()
    console.log("\n == Seeding Admin Entity == \n")
    await seedEntityAdmin()
    console.log("\n == Seeding Admin User == \n")
    await seedAdminUser()
    console.log("\n ===== End Seeding ===== \n")
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e)
        prisma.$disconnect()
        // process.exit(1);
    })

