"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ScraperPage() {
    const [query, setQuery] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("");
    const [result, setResult] = useState<string>("");

    const runImport = async () => {
        try {
            const res = await api.post("/api/maps-import", {
                query,
                city,
                category,
            });
            setResult(res.data?.data?.message ?? "Import request accepted.");
            toast.success("Maps import request submitted");
        } catch {
            toast.error("Failed to submit maps import request");
        }
    };

    return (
        <main className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Scraper</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-2xl">
                    <Input placeholder="Search Query" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                    <Button onClick={runImport}>Run Import</Button>
                    {result ? <p className="text-sm text-muted-foreground">{result}</p> : null}
                </CardContent>
            </Card>
        </main>
    );
}
