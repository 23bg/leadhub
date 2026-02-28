import { readSessionFromCookie } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await readSessionFromCookie();
    if (!session) redirect("/login");

    return (
        <main className="p-6 max-w-2xl">
            <h1 className="font-heading text-2xl font-semibold">My Profile</h1>
            <div className="mt-4 rounded-lg border p-4 space-y-2 text-sm">
                <p><span className="font-medium">Email:</span> {session.email}</p>
                <p><span className="font-medium">Role:</span> {session.role}</p>
                <p><span className="font-medium">Institute:</span> {session.instituteId}</p>
            </div>
        </main>
    );
}
