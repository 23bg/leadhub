"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function LeadImportPage() {
    const [csv, setCsv] = useState("name,phone,email,city,category\n");

    const importCsv = async () => {
        try {
            const rows = csv
                .split(/\r?\n/)
                .map((row) => row.trim())
                .filter(Boolean);

            const records = rows.slice(1).map((row) => {
                const [name, phone, email, city, category] = row.split(",").map((v) => v.trim());
                return {
                    name,
                    primaryPhone: phone,
                    email: email || undefined,
                    city: city || undefined,
                    category: category || undefined,
                    source: "IMPORT",
                };
            });

            await Promise.all(records.map((record) => api.post("/api/leads", record)));
            toast.success(`Imported ${records.length} leads`);
        } catch {
            toast.error("Failed to import CSV");
        }
    };

    return (
        <main className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Import Leads (CSV)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Required CSV fields: name, phone, email, city, category.</p>
                    <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={12} />
                    <Button onClick={importCsv}>Import</Button>
                </CardContent>
            </Card>
        </main>
    );
}
