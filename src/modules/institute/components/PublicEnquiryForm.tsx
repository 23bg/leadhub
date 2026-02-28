"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { API } from "@/constants/api";

type PublicEnquiryFormProps = {
    slug: string;
};

export default function PublicEnquiryForm({ slug }: PublicEnquiryFormProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", email: "", course: "", message: "" });

    const submit = async () => {
        if (!form.name.trim() || !form.phone.trim()) {
            toast.error("Name and phone are required");
            return;
        }

        setLoading(true);
        try {
            await api.post(API.INTERNAL.PUBLIC.LEAD(slug), {
                name: form.name,
                phone: form.phone,
                email: form.email || undefined,
                course: form.course || undefined,
                message: form.message || undefined,
            });
            toast.success("Enquiry submitted successfully");
            setForm({ name: "", phone: "", email: "", course: "", message: "" });
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to submit enquiry");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-semibold">Enquiry Form</h3>
            <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </div>
            <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="space-y-2">
                <Label>Course</Label>
                <Input value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })} />
            </div>
            <div className="space-y-2">
                <Label>Message</Label>
                <Textarea rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
            </div>
            <Button disabled={loading} onClick={submit} className="w-full">{loading ? "Submitting..." : "Submit Enquiry"}</Button>
        </div>
    );
}
