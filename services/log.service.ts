import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
    DataLog,
    DataLogCharacteristicCreate,
    DataLogCharacteristicDelete,
    DataLogCharacteristicUpdate,
    DataLogEntityDisable,
    DataLogEntityUpdate,
    DataLogMaterialCreate,
    DataLogMaterialUpdate,
    DataLogRoleCreate,
    DataLogRoleDelete,
    DataLogRoleSetPermission,
    DataLogRoleUpdate,
    DataLogTagCreate,
    DataLogTagDelete,
    DataLogTagUpdate,
    DataLogUserCreate,
    DataLogUserDisable,
    DataLogUserEmailVerified,
    DataLogUserSetEntity,
    DataLogUserSetRole,
    DataLogUserUpdate,
    LogEntry,
} from "@/types/log.type"

import { headers } from "next/headers"

export const getLogs = async (
    entityIds: string[],
    startDate: Date,
    endDate: Date = new Date(),
): Promise<LogEntry[]> => {
    const logs = await prisma.log.findMany({
        where: {
            OR: [
                {
                    entityId: {
                        in: entityIds,
                    },
                },
                {
                    entityId: null,
                },
            ],
            actionDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                },
            },
            Entity: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            actionDate: "desc",
        },
    })

    return logs.map((log) => ({
        id: log.id,
        type: log.actionType,
        info: log.actionDetail,
        userId: log.userId,
        entityId: log.entityId || undefined,
        createdAt: log.actionDate,
        user: {
            id: log.User.id,
            name: log.User.name || "",
        },
        entity: log.Entity
            ? {
                  id: log.Entity.id,
                  name: log.Entity.name,
              }
            : undefined,
    }))
}

export const addLog = async (dataLog: DataLog): Promise<boolean> => {
    try {
        const log = await prisma.log.create({
            data: {
                actionType: dataLog.type,
                actionDetail: dataLog.info,
                userId: dataLog.userId,
                entityId: dataLog.entityId,
            },
        })
        return true
    } catch (error) {
        console.error("Error adding log:", error)
        return true
    }
}

export const addUserCreateLog = async (
    userCreated: { name: string; id: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogUserCreate = {
            type: "user_create",
            info: {
                user: {
                    id: userCreated.id,
                    name: userCreated.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding user create log:", error)
        return false
    }
}

export const addUserUpdateLog = async (
    userUpdated: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogUserUpdate = {
            type: "user_update",
            info: {
                user: {
                    id: userUpdated.id,
                    name: userUpdated.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding user update log:", error)
        return false
    }
}

export const addUserSetRoleLog = async (
    userTarget: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogUserSetRole = {
            type: "user_set_role",
            info: {
                user: {
                    id: userTarget.id,
                    name: userTarget.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding user set role log:", error)
        return false
    }
}

export const addUserSetEntityLog = async (
    userTarget: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogUserSetEntity = {
            type: "user_set_entity",
            info: {
                user: {
                    id: userTarget.id,
                    name: userTarget.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding user set entity log:", error)
        return false
    }
}

export const addUserDisableLog = async (
    userTarget: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogUserDisable = {
            type: "user_disable",
            info: {
                user: {
                    id: userTarget.id,
                    name: userTarget.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding user disable log:", error)
        return false
    }
}

export const addUserEmailVerifiedLog = async (
    userTarget: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogUserEmailVerified = {
            type: "user_email_verified",
            info: {
                user: {
                    id: userTarget.id,
                    name: userTarget.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding user email verified log:", error)
        return false
    }
}

export const addRoleCreateLog = async (
    roleCreated: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogRoleCreate = {
            type: "role_create",
            info: {
                role: {
                    id: roleCreated.id,
                    name: roleCreated.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding role create log:", error)
        return false
    }
}

export const addRoleUpdateLog = async (
    roleUpdated: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogRoleUpdate = {
            type: "role_update",
            info: {
                role: {
                    id: roleUpdated.id,
                    name: roleUpdated.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding role update log:", error)
        return false
    }
}

export const addRoleDeleteLog = async (
    roleDeleted: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogRoleDelete = {
            type: "role_delete",
            info: {
                role: {
                    id: roleDeleted.id,
                    name: roleDeleted.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding role delete log:", error)
        return false
    }
}

export const addRoleSetPermissionLog = async (
    roleTarget: { id: string; name: string },
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            userId = session?.user.id
        }
        const dataLog: DataLogRoleSetPermission = {
            type: "role_set_permission",
            info: {
                role: {
                    id: roleTarget.id,
                    name: roleTarget.name,
                },
            },
            userId: userId ?? "",
            entityId: undefined,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding role set permission log:", error)
        return false
    }
}

export const addTagCreateLog = async (
    tagCreated: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogTagCreate = {
            type: "tag_create",
            info: {
                tag: {
                    id: tagCreated.id,
                    name: tagCreated.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding tag create log:", error)
        return false
    }
}

export const addTagUpdateLog = async (
    tagUpdated: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogTagUpdate = {
            type: "tag_update",
            info: {
                tag: {
                    id: tagUpdated.id,
                    name: tagUpdated.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding tag update log:", error)
        return false
    }
}

export const addCharacteristicCreateLog = async (
    characteristicCreated: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogCharacteristicCreate = {
            type: "characteristic_create",
            info: {
                characteristic: {
                    id: characteristicCreated.id,
                    name: characteristicCreated.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding characteristic create log:", error)
        return false
    }
}

export const addCharacteristicUpdateLog = async (
    characteristicUpdated: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogCharacteristicUpdate = {
            type: "characteristic_update",
            info: {
                characteristic: {
                    id: characteristicUpdated.id,
                    name: characteristicUpdated.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding characteristic update log:", error)
        return false
    }
}

export const addCharacteristicDeleteLog = async (
    characteristicDeleted: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogCharacteristicDelete = {
            type: "characteristic_delete",
            info: {
                characteristic: {
                    id: characteristicDeleted.id,
                    name: characteristicDeleted.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding characteristic delete log:", error)
        return false
    }
}

export const addMaterialCreateLog = async (
    materialCreated: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogMaterialCreate = {
            type: "material_create",
            info: {
                material: {
                    id: materialCreated.id,
                    name: materialCreated.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding material create log:", error)
        return false
    }
}

export const addMaterialUpdateLog = async (
    materialUpdated: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogMaterialUpdate = {
            type: "material_update",
            info: {
                material: {
                    id: materialUpdated.id,
                    name: materialUpdated.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding material update log:", error)
        return false
    }
}

export const addEntityUpdateLog = async (
    entity: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogEntityUpdate = {
            type: "entity_update",
            info: {
                entity: {
                    id: entity.id,
                    name: entity.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding entity update log:", error)
        return false
    }
}

export const addEntityDisableLog = async (
    entity: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogEntityDisable = {
            type: "entity_disable",
            info: {
                entity: {
                    id: entity.id,
                    name: entity.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding entity disable log:", error)
        return false
    }
}

export const addTagDeleteLog = async (
    tagDeleted: { id: string; name: string },
    entityId?: string,
    userId?: string,
): Promise<boolean> => {
    try {
        if (!userId || !entityId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!entityId) {
                entityId = session?.user.entitySelectedId
            }
            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogTagDelete = {
            type: "tag_delete",
            info: {
                tag: {
                    id: tagDeleted.id,
                    name: tagDeleted.name,
                },
            },
            userId: userId,
            entityId: entityId,
        }

        await addLog(dataLog)

        return true
    } catch (error) {
        console.error("Error adding tag delete log:", error)
        return false
    }
}
