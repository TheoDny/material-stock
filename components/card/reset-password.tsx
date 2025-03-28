"use client"

import { Label } from "@radix-ui/react-label"
import { error } from "console"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { toast } from "sonner"

type ResetPasswordProps = {
    token: string
}

export default function ResetPassword({ token }: ResetPasswordProps) {
    const [loading, setLoading] = useState(false)
    return (
        <Card className="z-50 rounded-md rounded-t-none max-w-md">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    action={async (formData) => {
                        setLoading(true)
                        const password = formData.get("password")
                        const passwordConfirmation = formData.get("password_confirmation")
                        if (password && password !== passwordConfirmation) {
                            return error("Passwords do not match")
                        }
                        await authClient.resetPassword({
                            token,
                            newPassword: password as string,
                        },{
                            onSuccess: () => {
                                toast.success("Email sent")
                            },
                            onError: (ctx) => {
                                console.error(ctx)
                                toast.error(ctx.error.message)
                            },
                            onResponse: () => {
                                setLoading(false)
                            },
                            onRequest: () => {
                                setLoading(true)
                            },
                        })
                        setLoading(false)
                    }}
                >
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="Password"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Confirm Password"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                "Change Password"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
