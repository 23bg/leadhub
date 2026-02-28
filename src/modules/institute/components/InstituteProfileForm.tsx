"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { API } from "@/constants/api";

export type InstituteFormState = {
    name: string;
    slug: string;
    description: string;
    phone: string;
    whatsapp: string;
    city: string;
    state: string;
    address: string;
    timings: string;
    logo: string;
    banner: string;
    website: string;
    instagram: string;
    facebook: string;
    youtube: string;
    linkedin: string;
};

type InstituteProfileFormProps = {
    form: InstituteFormState;
    onChange: (value: InstituteFormState) => void;
    onCancel: () => void;
    onSaved: () => Promise<void>;
};

export default function InstituteProfileForm({ form, onChange, onCancel, onSaved }: InstituteProfileFormProps) {
    const [saving, setSaving] = useState(false);

    const setValue = (key: keyof InstituteFormState, value: string) => {
        onChange({ ...form, [key]: value });
    };

    const save = async () => {
        setSaving(true);
        try {
            await api.put(API.INTERNAL.INSTITUTE.ROOT, {
                ...form,
                socialLinks: {
                    website: form.website,
                    instagram: form.instagram,
                    facebook: form.facebook,
                    youtube: form.youtube,
                    linkedin: form.linkedin,
                },
            });
            toast.success("Profile updated successfully");
            await onSaved();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Institute Name</Label>
                    <Input value={form.name} onChange={(event) => setValue("name", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={(event) => setValue("slug", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(event) => setValue("phone", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input value={form.whatsapp} onChange={(event) => setValue("whatsapp", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={form.city} onChange={(event) => setValue("city", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={form.state} onChange={(event) => setValue("state", event.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Textarea rows={2} value={form.address} onChange={(event) => setValue("address", event.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea rows={4} value={form.description} onChange={(event) => setValue("description", event.target.value)} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input value={form.logo} onChange={(event) => setValue("logo", event.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                    <Label>Banner URL</Label>
                    <Input value={form.banner} onChange={(event) => setValue("banner", event.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={form.website} onChange={(event) => setValue("website", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input value={form.instagram} onChange={(event) => setValue("instagram", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input value={form.facebook} onChange={(event) => setValue("facebook", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input value={form.youtube} onChange={(event) => setValue("youtube", event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input value={form.linkedin} onChange={(event) => setValue("linkedin", event.target.value)} />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button disabled={saving} onClick={save}>{saving ? "Saving..." : "Save Profile"}</Button>
            </div>
        </div>
    );
}
