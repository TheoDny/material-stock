"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { RoleDialog } from "./role-dialog"
import { getRolesAction } from "@/actions/role-actions"
import { getPermissionsAction } from "@/actions/permission-actions"
import { assignPermissionsToRoleAction } from "@/actions/role-actions"
import { RolePermissions } from "@/types/role.type"
import { Role, Permission } from "@prisma/client"

export function RoleManagement() {
    const router = useRouter()
    const [roles, setRoles] = useState<RolePermissions[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [selectedRole, setSelectedRole] = useState<RolePermissions | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const t = useTranslations("RoleManagement")
    const tPermissions = useTranslations("Permissions")

    useEffect(() => {
        const loadData = async () => {
            try {
                const rolesData = await getRolesAction()
                setRoles(rolesData)

                const permissionsData = await getPermissionsAction()
                setPermissions(permissionsData)
            } catch (error) {
                toast.error("Failed to load data")
            }
        }

        loadData()
    }, [])

    useEffect(() => {
        if (selectedRole) {
            setSelectedPermissions(selectedRole.Permissions.map((permission) => permission.code))
        } else {
            setSelectedPermissions([])
        }
    }, [selectedRole])

    const handleRoleSelect = (role: RolePermissions) => {
        setSelectedRole(role)
    }

    const handleCreateRole = () => {
        setEditingRole(null)
        setIsDialogOpen(true)
    }

    const handleEditRole = (role: Role) => {
        setEditingRole(role)
        setIsDialogOpen(true)
    }

    const handleRoleDialogClose = (newRole?: RolePermissions) => {
        setIsDialogOpen(false)

        if (newRole) {
            // If we're editing the currently selected role, update the selection
            if (selectedRole && selectedRole.id === newRole.id) {
                setSelectedRole(newRole)
            }

            // Refresh the roles list
            getRolesAction().then(setRoles)
        }
    }

    const handlePermissionToggle = (permissionCode: string) => {
        setSelectedPermissions((current) => {
            if (current.includes(permissionCode)) {
                return current.filter((id) => id !== permissionCode)
            } else {
                return [...current, permissionCode]
            }
        })
    }

    const handleSavePermissions = async () => {
        if (!selectedRole) return

        setIsSubmitting(true)

        try {
            await assignPermissionsToRoleAction({
                roleId: selectedRole.id,
                permissionCodes: selectedPermissions,
            })

            toast.success("Permissions updated successfully")

            // Refresh the roles list
            const updatedRoles = await getRolesAction()
            setRoles(updatedRoles)

            // Update the selected role with the new permissions
            const updatedRole = updatedRoles.find((r) => r.id === selectedRole.id)
            if (updatedRole) {
                setSelectedRole(updatedRole)
            }
        } catch (error) {
            toast.error("Failed to update permissions")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancelPermissions = () => {
        if (selectedRole) {
            setSelectedPermissions(selectedRole.Permissions.map((permission) => permission.code))
        }
    }

    const hasPermissionsChanged = () => {
        if (!selectedRole) return false

        const currentpermissionCodes = selectedRole.Permissions.map((p) => p.code).sort()
        const newpermissionCodes = [...selectedPermissions].sort()

        return (
            currentpermissionCodes.length !== newpermissionCodes.length ||
            currentpermissionCodes.some((id, index) => id !== newpermissionCodes[index])
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roles Panel */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>{t("roles")}</CardTitle>
                    <Button
                        size="sm"
                        onClick={handleCreateRole}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("newRole")}
                    </Button>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
                                        selectedRole?.id === role.id ? "bg-primary/10" : "hover:bg-muted"
                                    }`}
                                    onClick={() => handleRoleSelect(role)}
                                >
                                    <Checkbox
                                        checked={selectedRole?.id === role.id}
                                        onCheckedChange={() => handleRoleSelect(role)}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{role.name}</div>
                                        <div className="text-sm text-muted-foreground">{role.description}</div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditRole(role)
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {roles.length === 0 && (
                                <div className="text-center py-4 text-muted-foreground">{t("noRolesFound")}</div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Permissions Panel */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>{t("permissions")}</CardTitle>
                    {selectedRole && hasPermissionsChanged() && (
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelPermissions}
                                disabled={isSubmitting}
                            >
                                <X className="h-4 w-4 mr-2" />
                                {t("cancel")}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSavePermissions}
                                disabled={isSubmitting}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                {t("save")}
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {selectedRole ? (
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                <div className="text-sm font-medium">
                                    {t("assignPermissionsTo")}{" "}
                                    <span className="font-bold">{selectedRole.name}</span>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    {permissions.map((permission) => (
                                        <div
                                            key={permission.code}
                                            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                                            onClick={() => handlePermissionToggle(permission.code)}
                                        >
                                            <Checkbox
                                                id={`permission-${permission.code}`}
                                                checked={selectedPermissions.includes(permission.code)}
                                                onCheckedChange={() => handlePermissionToggle(permission.code)}
                                                className="cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`permission-${permission.code}`}
                                                    className="font-medium cursor-pointer"
                                                >
                                                    {permission.code}
                                                </label>
                                                <div className="text-sm text-muted-foreground">
                                                    {tPermissions(permission.code)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {permissions.length === 0 && (
                                        <div className="text-center py-4 text-muted-foreground">
                                            {t("noPermissionsFound")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                            {t("selectRoleToManagePermissions")}
                        </div>
                    )}
                </CardContent>
            </Card>

            <RoleDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                role={editingRole}
                onClose={handleRoleDialogClose}
            />
        </div>
    )
}
