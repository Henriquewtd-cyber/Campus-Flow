import { cookies } from "next/headers";

export type CurrentUser = {
    id: number;
    email: string;
    name: string;
    role: "admin" | "user";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return null;
        }

        const apiUrl = process.env.API_URL ?? "http://api:8000";

        const response = await fetch(`${apiUrl}/users/me`, {
            method: "GET",
            headers: {
                Cookie: `access_token=${token}`,
            },
            cache: "no-store",
        });

        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error("Falha no fetch:", error);
        return null;
    }
}