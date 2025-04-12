import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
    DataLog,
    DataLogUserCreate,
    DataLogUserUpdate,
    DataLogUserSetRole,
    DataLogUserSetEntity,
    DataLogUserDisable,
    DataLogUserEmailVerified,
    DataLogRoleCreate,
    DataLogRoleUpdate,
    DataLogRoleDelete,
    DataLogRoleSetPermission,
    DataLogTagCreate,
    DataLogTagUpdate,
    DataLogCharacteristicCreate,
    DataLogCharacteristicUpdate,
    DataLogCharacteristicDelete,
    DataLogMaterialCreate,
    DataLogMaterialUpdate,
    DataLogEntityUpdate,
    DataLogEntityDisable,
} from "@/types/log.type"

import { headers } from "next/headers"

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

export const addUserUpdateLog = async (userUpdated: { id: string }, userId?: string): Promise<boolean> => {
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

export const addUserSetRoleLog = async (userTarget: { id: string }, userId?: string): Promise<boolean> => {
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

export const addUserSetEntityLog = async (userTarget: { id: string }, userId?: string): Promise<boolean> => {
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

export const addUserDisableLog = async (userTarget: { id: string }, userId?: string): Promise<boolean> => {
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

export const addUserEmailVerifiedLog = async (userTarget: { id: string }, userId?: string): Promise<boolean> => {
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

export const addRoleCreateLog = async (roleCreated: { id: string }, userId?: string): Promise<boolean> => {
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

export const addRoleUpdateLog = async (roleUpdated: { id: string }, userId?: string): Promise<boolean> => {
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

export const addRoleDeleteLog = async (roleDeleted: { id: string }, userId?: string): Promise<boolean> => {
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

export const addRoleSetPermissionLog = async (roleTarget: { id: string }, userId?: string): Promise<boolean> => {
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
    tagCreated: { id: string },
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
    tagUpdated: { id: string },
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
    characteristicCreated: { id: string },
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
    characteristicUpdated: { id: string },
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
    characteristicDeleted: { id: string },
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
    materialCreated: { id: string },
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
    materialUpdated: { id: string },
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

export const addEntityUpdateLog = async (entityId: string, userId?: string): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogEntityUpdate = {
            type: "entity_update",
            info: {},
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

export const addEntityDisableLog = async (entityId: string, userId?: string): Promise<boolean> => {
    try {
        if (!userId) {
            const session = await auth.api.getSession({
                headers: await headers(),
            })
            if (!session?.user) {
                throw new Error("User session not found")
            }

            if (!userId) {
                userId = session?.user.id
            }
        }
        const dataLog: DataLogEntityDisable = {
            type: "entity_disable",
            info: {},
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
