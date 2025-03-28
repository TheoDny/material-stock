"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createRole, updateRole } from "@/actions/role-actions"
import { Role } from "@prisma/client"
import { RolePermissions } from "@/types/role.type"

const roleSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
    onClose: (role?: RolePermissions) => void
}

export function RoleDialog({ open, onOpenChange, role, onClose }: RoleDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: role?.name || "",
            description: role?.description || "",
        },
    })

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
        onClose()
    }

    const onSubmit = async (values: RoleFormValues) => {
        setIsSubmitting(true)

        try {
            let result

            if (role) {
                // Update existing role
                const result = await updateRole({
                    id: role.id,
                    name: values.name,
                    description: values.description || "",
                })
                toast.success("Role updated successfully")
            } else {
                // Create new role
                result = await createRole({
                    name: values.name,
                    description: values.description || "",
                })
                toast.success("Role created successfully")
            }

            if (result?.bindArgsValidationErrors) {
                return toast.error("Failed to update role")
            } else if (result?.serverError) {
                return toast.error("Failed to update role")
            } else if (result?.validationErrors) {
                return toast.error("Failed to update role")
            } else if (!result?.data) {
                return toast.error("Failed to update role")
            }

            form.reset()
            onOpenChange(false)
            onClose(result.data)
        } catch (error) {
            toast.error(role ? "Failed to update role" : "Failed to create role")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
                    <DialogDescription>
                        {role ? "Update the role details below." : "Fill in the details to create a new role."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Role name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Role description"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : role ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
