"use server"
import { SignIn } from "@/components/card/sign-in"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function SignInPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session) {
        redirect("/")
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <SignIn />
        </div>
    )
}
