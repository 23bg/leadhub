"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2, Pencil, Trash2, Plus, BookOpen, Eye } from "lucide-react";

type Course = {
    id: string;
    name: string;
    banner?: string | null;
    duration?: string | null;
    defaultFees?: number | null;
    description?: string | null;
};

type CourseForm = { name: string; banner: string; duration: string; defaultFees: string; description: string };
const emptyForm: CourseForm = { name: "", banner: "", duration: "", defaultFees: "", description: "" };

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [form, setForm] = useState<CourseForm>(emptyForm);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(API.INTERNAL.COURSES.ROOT);
            setCourses(response.data?.data ?? []);
        } catch {
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (course: Course) => {
        setEditingId(course.id);
        setForm({
            name: course.name,
            banner: course.banner ?? "",
            duration: course.duration ?? "",
            defaultFees: course.defaultFees?.toString() ?? "",
            description: course.description ?? "",
        });
        setDialogOpen(true);
    };

    const saveCourse = async () => {
        if (!form.name.trim()) {
            toast.error("Course name is required");
            return;
        }
        setSaving(true);
        try {
            const url = editingId ? API.INTERNAL.COURSES.BY_ID(editingId) : API.INTERNAL.COURSES.ROOT;
            const method = editingId ? "PATCH" : "POST";
            const body: Record<string, unknown> = { name: form.name };
            if (form.banner) body.banner = form.banner;
            if (form.duration) body.duration = form.duration;
            if (form.defaultFees) body.defaultFees = parseFloat(form.defaultFees);
            if (form.description) body.description = form.description;

            await api.request({ method, url, data: body });
            toast.success(editingId ? "Course updated" : "Course added");
            setDialogOpen(false);
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        } finally {
            setSaving(false);
        }
    };

    const deleteCourse = async (id: string) => {
        try {
            await api.delete(API.INTERNAL.COURSES.BY_ID(id));
            toast.success("Course deleted");
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const openView = (course: Course) => {
        setSelectedCourse(course);
        setViewDialogOpen(true);
    };

    const formatCurrency = (value: number | null | undefined) => {
        if (value == null) return "-";
        return `₹${value.toLocaleString("en-IN")}`;
    };

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-6 w-6" /> Courses
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">{courses.length} total courses</p>
                </div>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Course</Button>
            </div>

            <div className="mt-4 rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sr. No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Banner</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Default Fees</TableHead>
                            <TableHead className="max-w-[200px]">Description</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No courses yet. Add your first course.
                                </TableCell>
                            </TableRow>
                        ) : courses.map((course, index) => (
                            <TableRow key={course.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium">{course.name}</TableCell>
                                <TableCell>{course.banner ? "Added" : "-"}</TableCell>
                                <TableCell>{course.duration || "-"}</TableCell>
                                <TableCell>{formatCurrency(course.defaultFees)}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{course.description || "-"}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(course)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openView(course)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteCourse(course.id)}>
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
                        <DialogTitle>{editingId ? "Edit Course" : "Add Course"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. NEET 2026, JEE Foundation" />
                        </div>
                        <div className="space-y-2">
                            <Label>Banner URL</Label>
                            <Input value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 months, 1 year" />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Fees (₹)</Label>
                            <Input type="number" value={form.defaultFees} onChange={(e) => setForm({ ...form, defaultFees: e.target.value })} placeholder="e.g. 50000" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the course" rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveCourse} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingId ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Course Details</DialogTitle>
                    </DialogHeader>
                    {selectedCourse ? (
                        <div className="space-y-3 py-2 text-sm">
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Name</span><span className="font-medium">{selectedCourse.name}</span></div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Banner</p>
                                {selectedCourse.banner ? (
                                    <Image
                                        src={selectedCourse.banner}
                                        alt={selectedCourse.name}
                                        width={800}
                                        height={160}
                                        unoptimized
                                        className="h-20 w-full rounded-md border object-cover"
                                    />
                                ) : (
                                    <div className="h-20 w-full rounded-md border bg-linear-to-r from-indigo-500/20 via-violet-500/20 to-sky-500/20" />
                                )}
                            </div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Duration</span><span>{selectedCourse.duration || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Default Fees</span><span>{formatCurrency(selectedCourse.defaultFees)}</span></div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Description</p>
                                <p>{selectedCourse.description || "-"}</p>
                            </div>
                        </div>
                    ) : null}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
