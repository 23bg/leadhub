"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import TeamForm, { TeamFormState } from "@/modules/team/components/TeamForm";
import TeamTable, { TeamRow } from "@/modules/team/components/TeamTable";

const emptyForm: TeamFormState = {
    name: "",
    phone: "",
    email: "",
    role: "MANAGER",
    active: true,
    subjects: "",
    experience: "",
    bio: "",
};

export default function TeamPage() {
    const [rows, setRows] = useState<TeamRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<TeamRow | null>(null);
    const [form, setForm] = useState<TeamFormState>(emptyForm);
    const [sessionRole, setSessionRole] = useState<"OWNER" | "MANAGER" | "VIEWER" | null>(null);

    const canManage = useMemo(() => sessionRole === "OWNER", [sessionRole]);

    const load = async () => {
        setLoading(true);
        try {
            const [sessionRes, teamsRes, teachersRes] = await Promise.all([
                api.get(API.INTERNAL.AUTH.ME),
                api.get(API.INTERNAL.TEAMS.ROOT),
                api.get(API.INTERNAL.TEACHERS.ROOT),
            ]);

            setSessionRole(sessionRes.data?.data?.user?.role ?? null);

            const teamRows: TeamRow[] = (teamsRes.data?.data ?? []).map((member: any) => ({
                id: member.id,
                name: member.name ?? member.email ?? "Unknown",
                phone: "",
                email: member.email ?? "",
                role: member.role,
                active: true,
                source: "team",
            }));

            const teacherRows: TeamRow[] = (teachersRes.data?.data ?? []).map((teacher: any) => ({
                id: teacher.id,
                name: teacher.name,
                phone: "",
                email: "",
                role: "TEACHER",
                active: true,
                subjects: teacher.subject ?? "",
                experience: "",
                bio: teacher.bio ?? "",
                source: "teacher",
            }));

            setRows([...teamRows, ...teacherRows]);
        } catch {
            toast.error("Failed to load team");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEdit = (member: TeamRow) => {
        setEditing(member);
        setForm({
            name: member.name,
            phone: member.phone,
            email: member.email,
            role: member.role,
            active: member.active,
            subjects: member.subjects ?? "",
            experience: member.experience ?? "",
            bio: member.bio ?? "",
        });
        setOpen(true);
    };

    const save = async () => {
        if (!form.name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (form.role !== "TEACHER" && !form.email.trim()) {
            toast.error("Email is required for team members");
            return;
        }

        setSaving(true);
        try {
            if (form.role === "TEACHER") {
                const payload = {
                    name: form.name,
                    subject: form.subjects || undefined,
                    bio: form.bio || undefined,
                };

                if (editing?.source === "teacher") {
                    await api.patch(API.INTERNAL.TEACHERS.BY_ID(editing.id), payload);
                } else {
                    await api.post(API.INTERNAL.TEACHERS.ROOT, payload);
                }
            } else {
                const mappedRole = form.role === "VIEWER" ? "VIEWER" : "MANAGER";

                if (editing?.source === "team") {
                    await api.patch(API.INTERNAL.TEAMS.BY_ID(editing.id), { role: mappedRole });
                } else {
                    await api.post(API.INTERNAL.TEAMS.ROOT, {
                        name: form.name,
                        email: form.email,
                        role: mappedRole,
                    });
                }
            }

            toast.success(editing ? "Team member updated" : "Team member created");
            setOpen(false);
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to save member");
        } finally {
            setSaving(false);
        }
    };

    const remove = async (member: TeamRow) => {
        try {
            if (member.source === "teacher") {
                await api.delete(API.INTERNAL.TEACHERS.BY_ID(member.id));
            } else {
                await api.delete(API.INTERNAL.TEAMS.BY_ID(member.id));
            }
            toast.success("Team member removed");
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to remove member");
        }
    };

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold">Team</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage owners, managers, counselors, teachers, and viewers.</p>
                </div>
                {canManage ? <Button onClick={openCreate}>Add Team Member</Button> : null}
            </div>

            <div className="mt-4 rounded-md border p-3 text-sm">
                <p className="font-medium mb-2">Role Access</p>
                <p><span className="font-medium">OWNER</span> — Full control over team, data, and billing.</p>
                <p><span className="font-medium">EDITOR</span> — Manage leads, students, courses, batches, and fees.</p>
                <p><span className="font-medium">VIEWER</span> — Read-only access.</p>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-muted-foreground">Loading team...</p>
            ) : (
                <TeamTable rows={rows} canManage={canManage} onEdit={openEdit} onDelete={remove} />
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
                    </DialogHeader>
                    <TeamForm form={form} onChange={setForm} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button disabled={saving} onClick={save}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
