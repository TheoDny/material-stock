import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
    // Can also be an async function.
    handleServerError(e) {
    // Log to console.
        console.error("Action error:", e.message);

        // Rethrow all server errors:
    throw e;
    },
});