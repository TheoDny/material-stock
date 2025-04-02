"use client"

import { useEffect, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { createUserAction, updateUserAction } from "@/actions/user-actions"
import { UserRolesAndEntities } from "@/types/user.type"
import { Entity } from "@prisma/client"

const userSchema = z.object({
    name: z.string().min(2, "First name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    active: z.boolean().default(true),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserRolesAndEntities | null
    entitiesCanUse: Entity[]
    onClose: (user?: UserRolesAndEntities) => void
}

export function UserDialog({ open, onOpenChange, user, entitiesCanUse, onClose }: UserDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [entitiesToAdd, setEntitiesToAdd] = useState<Entity[] | []>([])
    const [entitiesToRemove, setEntitiesToRemove] = useState<Entity[] | []>([])

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            active: user?.active ?? true,
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name ?? "",
                email: user.email,
                active: user.active,
            })
        } else {
            form.reset({
                name: "",
                email: "",
                active: true,
            })
        }
    }, [open, user, form])

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
        onClose()
    }

    const onSubmit = async (values: UserFormValues) => {
        setIsSubmitting(true)

        try {
            let result

            if (user) {
                // Update existing user
                result = await updateUserAction({
                    id: user.id,
                    name: values.name,
                    email: values.email,
                    active: values.active,
                    entitiesToAdd: entitiesToAdd.map((entity) => entity.id),
                    entitiesToRemove: entitiesToRemove.map((entity) => entity.id),
                })
                toast.success("User updated successfully")
            } else {
                // Create new user
                result = await createUserAction({
                    name: values.name,
                    email: values.email,
                    active: values.active,
                    entities: entitiesToAdd.map((entity) => entity.id),
                })
                toast.success("User created successfully")
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
            toast.error(user ? "Failed to update user" : "Failed to create user")
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
                    <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
                    <DialogDescription>
                        {user ? "Update the user details below." : "Fill in the details to create a new user."}
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
                                            placeholder="Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Email address"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Entities</FormLabel>
                            <FormControl>
                                <ScrollArea className="max-h-[150px]">
                                    {entitiesCanUse.map((entity) => (
                                        <div
                                            key={entity.id}
                                            className="flex items-center space-x-2 py-1"
                                        >
                                            <Checkbox
                                                key={entity.id}
                                                checked={
                                                    (user?.Entities.some((e) => e.id === entity.id) &&
                                                        !entitiesToRemove.some((e) => e.id === entity.id)) ||
                                                    entitiesToAdd.some((e) => e.id === entity.id)
                                                }
                                                onClick={(checkboxClick) => {
                                                    //@ts-ignore
                                                    const checked = checkboxClick.target?.ariaChecked === "true"

                                                    if (checked) {
                                                        if (entitiesToAdd.some((e) => e.id === entity.id)) {
                                                            setEntitiesToAdd((prev) =>
                                                                prev.filter((e) => e.id !== entity.id),
                                                            )
                                                        } else {
                                                            setEntitiesToRemove((prev) => [...prev, entity])
                                                        }
                                                    } else {
                                                        if (entitiesToRemove.some((e) => e.id === entity.id)) {
                                                            setEntitiesToRemove((prev) =>
                                                                prev.filter((e) => e.id !== entity.id),
                                                            )
                                                        } else {
                                                            setEntitiesToAdd((prev) => [...prev, entity])
                                                        }
                                                    }
                                                }}
                                            />
                                            <FormLabel>{entity.name}</FormLabel>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            User can login and access the system
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
                                {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
