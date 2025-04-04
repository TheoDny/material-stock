"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { CircleAlert, Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { signUpAction } from "@/actions/user-actions"

type SignUpProps = {
    token: string
}

export function SignUp({ token }: SignUpProps) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const tSignUp = useTranslations("SignUp")

    const handleSignUp = async () => {
        setError("")
        setLoading(true)
        const result = await signUpAction({
            name,
            email,
            password,
            passwordConfirmation,
            token,
        })

        if (result?.bindArgsValidationErrors) {
            return setError("Failed to sign up role")
        } else if (result?.serverError) {
            return setError(result?.serverError)
        } else if (result?.validationErrors) {
            return setError("Failed to  sign up role")
        } else if (!result?.data) {
            return setError("Failed to  sign up role")
        }

        setLoading(false)
        window.location.href = "/sign-in"
    }

    return (
        <Card className="z-50 rounded-md rounded-t-none max-w-md">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">{tSignUp("title")}</CardTitle>
                <CardDescription className="text-xs md:text-sm">{tSignUp("description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="last-name">{tSignUp("lastName")}</Label>
                            <Input
                                id="last-name"
                                placeholder="Robinson"
                                required
                                onChange={(e) => {
                                    setName(e.target.value)
                                }}
                                value={name}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">{tSignUp("email")}</Label>
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
                        <Label htmlFor="password">{tSignUp("password")}</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Password"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">{tSignUp("confirmPassword")}</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            autoComplete="new-password"
                            placeholder="Confirm Password"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        onClick={handleSignUp}
                    >
                        {loading ? (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            tSignUp("createAccount")
                        )}
                    </Button>
                    <div className="p-2 items-center  w-full rounded-md flex flex-row gap-2">
                        {error && (
                            <>
                                <CircleAlert className="text-destructive" />
                                <p className="text-destructive text-xs">{error}</p>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}