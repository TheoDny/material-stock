"use client"

import { Label } from "@radix-ui/react-label"
import { error } from "console"
import { Loader2 } from "lucide-react"
import { Button } from "react-day-picker"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { toast } from "sonner"

type ForgotPasswordProps = {
    token: string
}

export default function ForgotPasswordPage({ token }: ForgotPasswordProps) {
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
                        const email = formData.get("email")

                        await authClient.forgetPassword({
                            email: email as string,
                            redirectTo: "/sign-in",
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
                    }}
                >
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="email"
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
                                "Envoi du mail de réinitialisation"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
