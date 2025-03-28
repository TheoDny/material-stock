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
import { Switch } from "@/components/ui/switch"
import { createUserAction, updateUserAction } from "@/actions/user-actions"
import { UserRolesAndEntities } from "@/types/user.type"

const userSchema = z.object({
    name: z.string().min(2, "First name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    active: z.boolean().default(true),
    entities: z.array(z.string()).min(1, "At least one entity must be selected"),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserRolesAndEntities | null
    onClose: (user?: UserRolesAndEntities) => void
}

export function UserDialog({ open, onOpenChange, user, onClose }: UserDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            active: user?.active ?? true,
            entities: user?.Entities.map((entity) => entity.id) || [],
        },
    })

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
        onClose()
    }

    const onSubmit = async (values: UserFormValues) => {
        setIsSubmitting(true)

        try {
            const entities = values.entities ? values.entities.map((entity) => entity.trim()) : []

            let result

            if (user) {
                // Update existing user
                result = await updateUserAction({
                    id: user.id,
                    name: values.name,
                    email: values.email,
                    active: values.active,
                    entities,
                })
                toast.success("User updated successfully")
            } else {
                // Create new user
                result = await createUserAction({
                    name: values.name,
                    email: values.email,
                    active: values.active,
                    entities,
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
                        <FormField
                            control={form.control}
                            name="entities"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entities (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Entity1, Entity2, ..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
