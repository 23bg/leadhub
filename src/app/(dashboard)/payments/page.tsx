"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type PaymentRow = {
    id: string;
    amount: number;
    method?: string | null;
    reference?: string | null;
    paidOn: string;
    student: {
        id: string;
        name: string;
        phone: string;
    };
};

const PAYMENT_METHODS = ["ALL", "CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"] as const;

export default function PaymentsPage() {
    const [rows, setRows] = useState<PaymentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [studentQuery, setStudentQuery] = useState("");
    const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("ALL");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (from) params.set("from", from);
            if (to) params.set("to", to);
            if (method !== "ALL") params.set("method", method);

            const response = await api.get(`${API.INTERNAL.PAYMENTS.ROOT}${params.toString() ? `?${params.toString()}` : ""}`);
            setRows(response.data?.data ?? []);
        } catch {
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    }, [from, to, method]);

    useEffect(() => {
        load();
    }, [load]);

    const filteredRows = studentQuery.trim()
        ? rows.filter((row) => {
            const query = studentQuery.trim().toLowerCase();
            return row.student.name.toLowerCase().includes(query) || row.student.phone.includes(query);
        })
        : rows;

    const totalAmount = filteredRows.reduce((sum, row) => sum + row.amount, 0);

    return (
        <main className="p-6 space-y-4">
            <div>
                <h1 className="font-heading text-2xl font-semibold">Payments</h1>
                <p className="text-sm text-muted-foreground mt-1">Track all fee collections with filters.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-5">
                        <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                        <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                        <Input
                            placeholder="Search student name or phone"
                            value={studentQuery}
                            onChange={(event) => setStudentQuery(event.target.value)}
                        />
                        <Select value={method} onValueChange={(value) => setMethod(value as (typeof PAYMENT_METHODS)[number])}>
                            <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                            <SelectContent>
                                {PAYMENT_METHODS.map((item) => (
                                    <SelectItem key={item} value={item}>{item === "ALL" ? "All Methods" : item}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={load}>Refresh</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-3">
                        Showing {filteredRows.length} payments • Total {`₹${totalAmount.toLocaleString("en-IN")}`}
                    </p>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sr. No.</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No payments found for selected filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRows.map((payment, index) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{payment.student.name}</TableCell>
                                            <TableCell>{payment.student.phone}</TableCell>
                                            <TableCell className="text-right">{`₹${payment.amount.toLocaleString("en-IN")}`}</TableCell>
                                            <TableCell>{new Date(payment.paidOn).toLocaleDateString()}</TableCell>
                                            <TableCell>{payment.method || "-"}</TableCell>
                                            <TableCell>{payment.reference || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
