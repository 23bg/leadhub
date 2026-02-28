"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

type InstituteProfile = {
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

export default function DashboardProfilePage() {
    const [form, setForm] = useState<InstituteProfile>({
        name: "", slug: "", description: "", phone: "", whatsapp: "",
        city: "", state: "", address: "", timings: "", logo: "", banner: "",
        website: "", instagram: "", facebook: "", youtube: "", linkedin: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const response = await api.get(API.INTERNAL.INSTITUTE.ROOT);
            const d = response.data?.data ?? {};
            setForm({
                name: d.name ?? "",
                slug: d.slug ?? "",
                description: d.description ?? "",
                phone: d.phone ?? "",
                whatsapp: d.whatsapp ?? "",
                city: d.city ?? "",
                state: d.state ?? "",
                address: d.address ?? "",
                timings: d.timings ?? "",
                logo: d.logo ?? "",
                banner: d.banner ?? "",
                website: d.socialLinks?.website ?? "",
                instagram: d.socialLinks?.instagram ?? "",
                facebook: d.socialLinks?.facebook ?? "",
                youtube: d.socialLinks?.youtube ?? "",
                linkedin: d.socialLinks?.linkedin ?? "",
            });
            setLoading(false);
        };
        load();
    }, []);

    const setValue = (key: keyof InstituteProfile, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
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
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="p-6 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </main>
        );
    }

    return (
        <main className="p-6 max-w-4xl">
            <h1 className="font-heading text-2xl font-semibold">Institute Profile</h1>
            <p className="mt-1 text-muted-foreground">Update your institute details. Changes are visible on your public page.</p>

            <div className="mt-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Info</CardTitle>
                        <CardDescription>Institute name, contact, and location.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Institute Name</Label>
                            <Input value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="Institute Name" />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input value={form.slug} onChange={(e) => setValue("slug", e.target.value)} placeholder="URL slug" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={form.phone} onChange={(e) => setValue("phone", e.target.value)} placeholder="Phone" />
                        </div>
                        <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input value={form.whatsapp} onChange={(e) => setValue("whatsapp", e.target.value)} placeholder="WhatsApp" />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input value={form.city} onChange={(e) => setValue("city", e.target.value)} placeholder="City" />
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <Input value={form.state} onChange={(e) => setValue("state", e.target.value)} placeholder="State" />
                        </div>
                        <div className="space-y-2">
                            <Label>Timings</Label>
                            <Input value={form.timings} onChange={(e) => setValue("timings", e.target.value)} placeholder="e.g. Mon-Sat 9AM-6PM" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Address</Label>
                            <Textarea value={form.address} onChange={(e) => setValue("address", e.target.value)} placeholder="Full address" rows={3} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea value={form.description} onChange={(e) => setValue("description", e.target.value)} placeholder="Brief description of your institute" rows={4} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                        <CardDescription>Add website and social media links.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Website</Label>
                            <Input value={form.website} onChange={(e) => setValue("website", e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Instagram</Label>
                            <Input value={form.instagram} onChange={(e) => setValue("instagram", e.target.value)} placeholder="https://instagram.com/..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Facebook</Label>
                            <Input value={form.facebook} onChange={(e) => setValue("facebook", e.target.value)} placeholder="https://facebook.com/..." />
                        </div>
                        <div className="space-y-2">
                            <Label>YouTube</Label>
                            <Input value={form.youtube} onChange={(e) => setValue("youtube", e.target.value)} placeholder="https://youtube.com/..." />
                        </div>
                        <div className="space-y-2">
                            <Label>LinkedIn</Label>
                            <Input value={form.linkedin} onChange={(e) => setValue("linkedin", e.target.value)} placeholder="https://linkedin.com/..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Media</CardTitle>
                        <CardDescription>Logo and banner image URLs.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <Input value={form.logo} onChange={(e) => setValue("logo", e.target.value)} placeholder="Logo image URL" />
                        </div>
                        <div className="space-y-2">
                            <Label>Banner URL</Label>
                            <Input value={form.banner} onChange={(e) => setValue("banner", e.target.value)} placeholder="Banner image URL" />
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={save} disabled={saving} size="lg">
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Profile"}
                </Button>
            </div>
        </main>
    );
}
