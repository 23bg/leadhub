"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2, Pencil, Trash2, Plus, Upload, CheckCircle2, AlertCircle, Eye } from "lucide-react";

type Course = { id: string; name: string; defaultFees?: number | null };
type Batch = { id: string; courseId: string; name: string };
type FeeSummary = { totalFees: number; totalPaid: number; totalPending: number };
type Student = {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    courseId?: string | null;
    batchId?: string | null;
    admissionDate?: string | null;
};

type StudentForm = { name: string; phone: string; email: string; courseId: string; batchId: string; admissionDate: string; fees: string };
const emptyForm: StudentForm = { name: "", phone: "", email: "", courseId: "", batchId: "", admissionDate: "", fees: "" };
type UploadResult = {
    inserted: number;
    errors: Array<{ row: number; message: string }>;
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [feeSummaries, setFeeSummaries] = useState<Record<string, FeeSummary>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [form, setForm] = useState<StudentForm>(emptyForm);
    const [uploading, setUploading] = useState(false);
    const [uploadFileName, setUploadFileName] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [studentRes, courseRes, batchRes] = await Promise.all([
                api.get(API.INTERNAL.STUDENTS.ROOT),
                api.get(API.INTERNAL.COURSES.ROOT),
                api.get(API.INTERNAL.BATCHES.ROOT),
            ]);
            const studentList: Student[] = studentRes.data?.data ?? [];
            setStudents(studentList);
            setCourses(courseRes.data?.data ?? []);
            setBatches(batchRes.data?.data ?? []);

            // Load fee summaries for all students
            const summaries: Record<string, FeeSummary> = {};
            await Promise.all(
                studentList.map(async (s) => {
                    try {
                        const response = await api.get(API.INTERNAL.FEES.WITH_STUDENT(s.id));
                        const feeData = response.data?.data;
                        if (feeData) {
                            summaries[s.id] = {
                                totalFees: feeData.totalFees ?? 0,
                                totalPaid: feeData.totalPaid ?? 0,
                                totalPending: feeData.totalPending ?? 0,
                            };
                        }
                    } catch {
                        // ignore
                    }
                })
            );
            setFeeSummaries(summaries);
        } catch {
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
    const batchMap = Object.fromEntries(batches.map((b) => [b.id, b.name]));
    const filteredBatches = form.courseId ? batches.filter((b) => b.courseId === form.courseId) : batches;

    const handleCourseChange = (courseId: string) => {
        const course = courseMap[courseId];
        setForm({
            ...form,
            courseId,
            batchId: "",
            fees: course?.defaultFees ? course.defaultFees.toString() : "",
        });
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (student: Student) => {
        setEditingId(student.id);
        setForm({
            name: student.name,
            phone: student.phone,
            email: student.email ?? "",
            courseId: student.courseId ?? "",
            batchId: student.batchId ?? "",
            admissionDate: student.admissionDate ? student.admissionDate.slice(0, 10) : "",
            fees: "",
        });
        setDialogOpen(true);
    };

    const saveStudent = async () => {
        if (!form.name.trim() || !form.phone.trim()) {
            toast.error("Name and phone are required");
            return;
        }
        setSaving(true);
        try {
            const url = editingId ? API.INTERNAL.STUDENTS.BY_ID(editingId) : API.INTERNAL.STUDENTS.ROOT;
            const method = editingId ? "PATCH" : "POST";
            const body: Record<string, unknown> = { name: form.name, phone: form.phone };
            if (form.email) body.email = form.email;
            if (form.courseId) body.courseId = form.courseId;
            if (form.batchId) body.batchId = form.batchId;
            if (form.admissionDate) body.admissionDate = form.admissionDate;
            if (!editingId && form.fees) body.fees = parseFloat(form.fees);

            await api.request({ method, url, data: body });
            toast.success(editingId ? "Student updated" : "Student added");
            setDialogOpen(false);
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        } finally {
            setSaving(false);
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            await api.delete(API.INTERNAL.STUDENTS.BY_ID(id));
            toast.success("Student deleted");
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        }
    };

    const openView = (student: Student) => {
        setSelectedStudent(student);
        setViewDialogOpen(true);
    };

    const onUpload = async (file: File) => {
        setUploadFileName(file.name);
        setUploadResult(null);
        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const response = await api.post(API.INTERNAL.STUDENTS.UPLOAD, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const data = response.data?.data as UploadResult;
            setUploadResult(data);
            toast.success(`${data.inserted} students imported`);
            await load();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error during upload");
        } finally {
            setUploading(false);
        }
    };

    const formatCurrency = (v: number) => v > 0 ? `₹${v.toLocaleString("en-IN")}` : "-";

    const downloadSampleCsv = () => {
        const sample = "name,phone,email,course,batch,fees\nRahul Sharma,9876543210,rahul@example.com,NEET,Batch A,50000\nPriya Singh,9123456789,priya@example.com,JEE,Weekend Batch,42000\n";
        const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "students-sample.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold">Students</h1>
                    <p className="text-muted-foreground text-sm mt-1">{students.length} total students</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Upload CSV
                    </Button>
                    <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
                </div>
            </div>

            <div className="mt-4 rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sr. No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Batch</TableHead>
                            <TableHead className="text-right">Total Fees</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-right">Pending</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No students yet. Add your first student.
                                </TableCell>
                            </TableRow>
                        ) : students.map((student, index) => {
                            const fee = feeSummaries[student.id];
                            return (
                                <TableRow key={student.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.phone}</TableCell>
                                    <TableCell>{student.courseId ? (courseMap[student.courseId]?.name ?? "-") : "-"}</TableCell>
                                    <TableCell>{student.batchId ? (batchMap[student.batchId] ?? "-") : "-"}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(fee?.totalFees ?? 0)}</TableCell>
                                    <TableCell className="text-right text-green-600">{formatCurrency(fee?.totalPaid ?? 0)}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(fee?.totalPending ?? 0)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openView(student)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteStudent(student.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone *</Label>
                            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" />
                        </div>
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select value={form.courseId} onValueChange={handleCourseChange}>
                                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Batch</Label>
                            <Select value={form.batchId} onValueChange={(v) => setForm({ ...form, batchId: v })} disabled={!form.courseId}>
                                <SelectTrigger><SelectValue placeholder={form.courseId ? "Select batch" : "Select course first"} /></SelectTrigger>
                                <SelectContent>
                                    {filteredBatches.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Admission Date</Label>
                            <Input type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} />
                        </div>
                        {!editingId ? (
                            <div className="space-y-2">
                                <Label>Fees (₹)</Label>
                                <Input type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} placeholder="Auto-filled from course" />
                                <p className="text-xs text-muted-foreground">Auto-filled from course default fees. A fee plan will be created automatically.</p>
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveStudent} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingId ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Students CSV</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Required columns: <span className="font-medium">name</span>, <span className="font-medium">phone</span>. Optional: email, course, batch, fees.
                        </p>
                        <Button variant="outline" size="sm" onClick={downloadSampleCsv}>Download Sample CSV</Button>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            <Upload className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {uploadFileName ? uploadFileName : "Click to select a CSV file"}
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) onUpload(file);
                                }}
                            />
                        </div>

                        {uploading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                            </div>
                        ) : null}

                        {uploadResult ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">{uploadResult.inserted} students imported • {uploadResult.errors.length} failed</span>
                                </div>
                                {uploadResult.errors.length > 0 ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                            <span className="text-sm font-medium">{uploadResult.errors.length} row errors</span>
                                        </div>
                                        <ul className="text-xs text-muted-foreground space-y-1 pl-6 max-h-32 overflow-auto">
                                            {uploadResult.errors.map((error) => (
                                                <li key={`${error.row}-${error.message}`}>
                                                    Row {error.row}: {error.message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">All rows imported successfully.</p>
                                )}
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    {selectedStudent ? (
                        <div className="space-y-3 py-2 text-sm">
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Name</span><span className="font-medium">{selectedStudent.name}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Phone</span><span>{selectedStudent.phone || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Email</span><span>{selectedStudent.email || "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Course</span><span>{selectedStudent.courseId ? (courseMap[selectedStudent.courseId]?.name ?? "-") : "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Batch</span><span>{selectedStudent.batchId ? (batchMap[selectedStudent.batchId] ?? "-") : "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Admission Date</span><span>{selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString() : "-"}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Total Fees</span><span>{formatCurrency(feeSummaries[selectedStudent.id]?.totalFees ?? 0)}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Paid</span><span className="text-green-600">{formatCurrency(feeSummaries[selectedStudent.id]?.totalPaid ?? 0)}</span></div>
                            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Pending</span><span className="text-red-600">{formatCurrency(feeSummaries[selectedStudent.id]?.totalPending ?? 0)}</span></div>
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
