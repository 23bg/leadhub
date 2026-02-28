"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

type Lead = {
    id: string;
    name: string;
    primaryPhone?: string | null;
    category?: string | null;
    city?: string | null;
    source?: string;
    status: string;
    leadProducts?: Array<{ id: string; product?: { name: string } | null }>;
    createdAt: string;
};

type PagedResult = {
    items: Lead[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "INTERESTED", "TRIAL", "CUSTOMER", "REJECTED"] as const;
const STATUS_COLORS: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CONTACTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    INTERESTED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    TRIAL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    CUSTOMER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [status, setStatus] = useState("all");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(true);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        if (status && status !== "all") params.set("status", status);
        if (query) params.set("search", query);
        if (category) params.set("category", category);
        if (city) params.set("city", city);
        return params.toString();
    }, [status, query, category, city, page, pageSize]);

    const loadLeads = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/leads${queryString ? `?${queryString}` : ""}`);
            const data = (response.data?.data ?? { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }) as PagedResult;
            setLeads(data.items);
            setTotal(data.total);
        } catch {
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    }, [queryString]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    const updateStatus = async (leadId: string, nextStatus: string) => {
        try {
            await api.put(`/api/leads/${leadId}`, { status: nextStatus });
            toast.success("Lead updated");
            await loadLeads();
        } catch {
            toast.error("Failed to update lead status");
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-semibold">Leads</h1>
                    <p className="text-muted-foreground text-sm mt-1">{total} total leads</p>
                </div>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-6">
                        <Input placeholder="Search name or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                        <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                        <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 / page</SelectItem>
                                <SelectItem value="20">20 / page</SelectItem>
                                <SelectItem value="50">50 / page</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadLeads} variant="outline">Refresh</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-4 rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : leads.map((lead, index) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/lead/${lead.id}`} className="hover:underline">
                                        {lead.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{lead.primaryPhone || "-"}</TableCell>
                                <TableCell>{lead.category || "-"}</TableCell>
                                <TableCell>{lead.city || "-"}</TableCell>
                                <TableCell>{lead.source || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={STATUS_COLORS[lead.status] ?? ""}>
                                        {lead.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-60 truncate text-xs text-muted-foreground">
                                    {lead.leadProducts?.length
                                        ? lead.leadProducts.map((item) => item.product?.name).filter(Boolean).join(", ")
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                                        <SelectTrigger className="h-8 w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1 || loading}>
                    Previous
                </Button>
                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                <Button variant="outline" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages || loading}>
                    Next
                </Button>
            </div>
        </main>
    );
}
