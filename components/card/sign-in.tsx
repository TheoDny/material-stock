"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, CircleAlert } from "lucide-react"
import { signIn } from "@/lib/auth-client"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function SignIn() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const tSignIn = useTranslations("SignIn")

    const handleSignIn = async () => {
        setLoading(true)
        setError("")
        const res = await signIn.email({
            email,
            password,
            fetchOptions: {
                onResponse: () => {
                    setLoading(false)
                },
                onRequest: () => {
                    setLoading(true)
                },
                onError: (ctx) => {
                    setError(ctx.error.message || ctx.error.statusText)
                },
                onSuccess: async () => {
                    window.location.href = "/"
                },
            },
        })
    }

    return (
        <Card className="w-xs md:w-md">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">{tSignIn("title")}</CardTitle>
                <CardDescription className="text-xs md:text-sm">{tSignIn("description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">{tSignIn("email")}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            onChange={(e) => {
                                setEmail(e.target.value)
                            }}
                            value={email}
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">{tSignIn("password")}</Label>
                            <Link
                                href="/forgot-password"
                                className="ml-auto inline-block text-sm underline"
                            >
                                {tSignIn("forgotPassword")}
                            </Link>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            placeholder="password"
                            autoComplete="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        onClick={handleSignIn}
                    >
                        {loading ? (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            tSignIn("login")
                        )}
                    </Button>
                    <div className="p-2 items-center w-full rounded-md flex flex-row gap-2">
                        {error && (
                            <>
                                <CircleAlert className="text-destructive" />
                                <p className="text-destructive text-xs">{error}</p>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex justify-center w-full border-t py-4">
                    <p className="text-center text-xs text-neutral-500">
                        Powered by <span className="underline dark:text-orange-200/90">better-auth.</span>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}
