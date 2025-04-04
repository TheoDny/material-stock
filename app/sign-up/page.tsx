"use server"
import { SignUp } from "@/components/card/sign-up"
import { auth } from "@/lib/auth"
import { checkToken } from "@/services/user.service"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

type SignUpPageProps = {
    params: Promise<{
        token?: string
    }>
}

export default async function SignUpPage(props: SignUpPageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session) {
        redirect("/")
    }
    const { token } = await props.params

    //check the param "token" in the URL
    if (!token) {
        redirect("/sign-in")
    }

    return <SignUp token={token} />
}
