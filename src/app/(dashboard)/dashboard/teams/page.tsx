"use client";

import { useEffect, useState } from "react";
import { API } from "@/constants/api";
import api from "@/lib/axios";

type TeamMember = {
    id: string;
    email: string;
    name?: string | null;
    role: "OWNER" | "MANAGER" | "VIEWER";
};

type SessionUser = {
    id: string;
    role: "OWNER" | "MANAGER" | "VIEWER";
};

export default function DashboardTeamsPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
    const [form, setForm] = useState({ email: "", name: "", role: "MANAGER" as "MANAGER" | "VIEWER" });
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const [sessionResponse, membersResponse] = await Promise.all([
            api.get(API.INTERNAL.AUTH.ME),
            api.get(API.INTERNAL.TEAMS.ROOT),
        ]);

        setSessionUser(sessionResponse.data?.data?.user ?? null);
        setMembers(membersResponse.data?.data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const canManage = sessionUser?.role === "OWNER";

    const createMember = async () => {
        await api.post(API.INTERNAL.TEAMS.ROOT, form);
        setForm({ email: "", name: "", role: "MANAGER" });
        await load();
    };

    const updateRole = async (id: string, role: "MANAGER" | "VIEWER") => {
        await api.patch(API.INTERNAL.TEAMS.BY_ID(id), { role });
        await load();
    };

    const removeMember = async (id: string) => {
        await api.delete(API.INTERNAL.TEAMS.BY_ID(id));
        await load();
    };

    return (
        <main className="p-6">
            <h1 className="font-heading text-2xl font-semibold">Teams</h1>
            <p className="font-sans mt-2 text-muted-foreground">Manage team members and roles for your institute.</p>

            {canManage ? (
                <div className="mt-6 grid gap-3 rounded border p-4 md:grid-cols-4">
                    <input
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Email"
                        className="rounded border px-3 py-2"
                    />
                    <input
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Name"
                        className="rounded border px-3 py-2"
                    />
                    <select
                        value={form.role}
                        onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as "MANAGER" | "VIEWER" }))}
                        className="rounded border px-3 py-2"
                    >
                        <option value="MANAGER">Manager</option>
                        <option value="VIEWER">Viewer</option>
                    </select>
                    <button onClick={createMember} className="rounded bg-primary px-4 py-2 text-primary-foreground">
                        Add Member
                    </button>
                </div>
            ) : null}

            {loading ? (
                <p className="mt-6 text-sm text-muted-foreground">Loading team...</p>
            ) : (
                <div className="mt-6 overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-3 py-2">Sr. No.</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Role</th>
                                {canManage ? <th className="px-3 py-2">Actions</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member, index) => (
                                <tr key={member.id} className="border-t">
                                    <td className="px-3 py-2">{index + 1}</td>
                                    <td className="px-3 py-2">{member.name || "-"}</td>
                                    <td className="px-3 py-2">{member.email}</td>
                                    <td className="px-3 py-2">{member.role}</td>
                                    {canManage ? (
                                        <td className="px-3 py-2">
                                            {member.role === "OWNER" || member.id === sessionUser?.id ? (
                                                <span className="text-muted-foreground">Protected</span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateRole(member.id, member.role === "MANAGER" ? "VIEWER" : "MANAGER")}
                                                        className="rounded border px-2 py-1"
                                                    >
                                                        Make {member.role === "MANAGER" ? "Viewer" : "Manager"}
                                                    </button>
                                                    <button onClick={() => removeMember(member.id)} className="rounded border px-2 py-1 text-red-600">
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    ) : null}
                                </tr>
                            ))}
                            {members.length === 0 ? (
                                <tr>
                                    <td className="px-3 py-4 text-muted-foreground" colSpan={canManage ? 5 : 4}>
                                        No team members found.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
