import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export const IMPLEMENTED_LOCALE = ["en", "fr"]

export default getRequestConfig(async () => {
    let locale = (await cookies()).get("NEXT_LOCALE")?.value || "en"

    if (!IMPLEMENTED_LOCALE.includes(locale)) {
        locale = "en"
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    }
})
