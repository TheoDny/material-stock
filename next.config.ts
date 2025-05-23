import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
    experimental: {
        nodeMiddleware: true,
        authInterrupts: true,
        serverActions: {
            bodySizeLimit: "55mb",
        },
        turbo: {},
    },
}

export default withNextIntl(nextConfig)
