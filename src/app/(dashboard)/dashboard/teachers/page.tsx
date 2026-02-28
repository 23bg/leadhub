"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

type Teacher = {
    id: string;
    name: string;
    subject?: string | null;
    bio?: string | null;
};

type TeacherForm = { name: string; subject: string; bio: string };
const emptyForm: TeacherForm = { name: "", subject: "", bio: "" };

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<TeacherForm>(emptyForm);

    const load = async () => {
        setLoading(true);
        try {
            const response = await api.get(API.INTERNAL.TEACHERS.ROOT);
            setTeachers(response.data?.data ?? []);
        } catch {
            toast.error("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (teacher: Teacher) => {
        setEditingId(teacher.id);
        setForm({ name: teacher.name, subject: teacher.subject ?? "", bio: teacher.bio ?? "" });
        setDialogOpen(true);
    };

    const saveTeacher = async () => {
        if (!form.name.trim()) {
            toast.error("Name is required");
            return;
        }
        setSaving(true);
        try {
            const url = editingId ? API.INTERNAL.TEACHERS.BY_ID(editingId) : API.INTERNAL.TEACHERS.ROOT;
            const method = editingId ? "PATCH" : "POST";
            await api.request({ method, url, data: { name: form.name, subject: form.subject || undefined, bio: form.bio || undefined } });
            toast.success(editingId ? "Teacher updated" : "Teacher added");
            setDialogOpen(false);
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        } finally {
            setSaving(false);
        }
    };

    const deleteTeacher = async (id: string) => {
        try {
            await api.delete(API.INTERNAL.TEACHERS.BY_ID(id));
            toast.success("Teacher deleted");
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold">Teachers</h1>
                    <p className="text-muted-foreground text-sm mt-1">{teachers.length} total teachers</p>
                </div>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Teacher</Button>
            </div>

            <div className="mt-4 rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sr. No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Bio</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : teachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No teachers yet. Add your first teacher.
                                </TableCell>
                            </TableRow>
                        ) : teachers.map((teacher, index) => (
                            <TableRow key={teacher.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{teacher.name}</TableCell>
                                <TableCell>{teacher.subject || "-"}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{teacher.bio || "-"}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(teacher)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteTeacher(teacher.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Teacher name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject taught" />
                        </div>
                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio" rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveTeacher} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingId ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
