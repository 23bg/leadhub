"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2, AlertTriangle } from "lucide-react";

type Defaulter = {
    studentId: string;
    studentName: string;
    phone: string;
    courseName: string;
    totalFees: number;
    totalPaid: number;
    pending: number;
    dueDate?: string | null;
};

export default function DefaultersPage() {
    const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get(API.INTERNAL.DASHBOARD.DEFAULTERS);
                setDefaulters(response.data?.data ?? []);
            } catch {
                toast.error("Failed to load defaulters");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

    const totalPending = defaulters.reduce((s, d) => s + d.pending, 0);

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" /> Fee Defaulters
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {defaulters.length} students with pending fees • Total outstanding: {formatCurrency(totalPending)}
                    </p>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Students with Pending Fees</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : defaulters.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No fee defaulters. All fees are up to date!</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sr. No.</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="text-right">Total Fees</TableHead>
                                    <TableHead className="text-right">Paid</TableHead>
                                    <TableHead className="text-right">Pending</TableHead>
                                    <TableHead>Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {defaulters.map((d, index) => (
                                    <TableRow key={d.studentId}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{d.studentName}</TableCell>
                                        <TableCell>{d.phone}</TableCell>
                                        <TableCell>{d.courseName}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(d.totalFees)}</TableCell>
                                        <TableCell className="text-right text-green-600">{formatCurrency(d.totalPaid)}</TableCell>
                                        <TableCell className="text-right font-medium text-red-600">{formatCurrency(d.pending)}</TableCell>
                                        <TableCell>{d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
