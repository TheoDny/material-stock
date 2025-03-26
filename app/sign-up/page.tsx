"use server";
import { SignUp } from '@/components/card/sign-up';
import { checkToken } from '@/services/create-account.service';
import { redirect } from 'next/navigation'

type SignUpPageProps = {
    params : {
        token?: string
    }
}

export default async function SignUpPage(props: SignUpPageProps) {
    //check the param "token" in the URL
    //if it exists, return the SignUp component
    //if it doesn't, redirect to  the SignIn page with redirect("/sign-in")
    if (!(await checkToken(props.params.token))){
        redirect("/sign-in")
    }

    return <SignUp/>
}