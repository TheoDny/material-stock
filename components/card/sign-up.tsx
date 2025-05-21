"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { CircleAlert, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { signUpAction } from "@/actions/user-actions"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

type SignUpProps = {
    token: string
}

const signUpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirmation: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>

export function SignUp({ token }: SignUpProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const tSignUp = useTranslations("SignUp")

    const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            passwordConfirmation: "",
        },
    })

    const onSubmit = async (data: SignUpFormValues) => {
        setError("")
        setLoading(true)
        const result = await signUpAction({
            name: data.name,
            email: data.email,
            password: data.password,
            passwordConfirmation: data.passwordConfirmation,
            token,
        })

        if (result?.bindArgsValidationErrors) {
            setLoading(false)
            return setError("Failed to sign up role")
        } else if (result?.serverError) {
            setLoading(false)
            return setError(result?.serverError)
        } else if (result?.validationErrors) {
            setLoading(false)
            return setError("Failed to sign up role")
        } else if (!result?.data) {
            setLoading(false)
            return setError("Failed to sign up role")
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
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{tSignUp("name")}</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">{tSignUp("email")}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">{tSignUp("password")}</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Password"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="passwordConfirmation">{tSignUp("confirmPassword")}</Label>
                        <Input
                            id="passwordConfirmation"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirm Password"
                            {...register("passwordConfirmation")}
                        />
                        {errors.passwordConfirmation && (
                            <p className="text-destructive text-xs mt-1">{errors.passwordConfirmation.message}</p>
                        )}
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
                            tSignUp("createAccount")
                        )}
                    </Button>
                    {error && (
                        <div className="p-2 items-center w-full rounded-md flex flex-row gap-2">
                            <CircleAlert className="text-destructive" />
                            <p className="text-destructive text-xs">{error}</p>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}