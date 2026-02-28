"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

type OnboardingForm = {
    name: string;
    phone: string;
    city: string;
    state: string;
    address: string;
    whatsapp: string;
    description: string;
    website: string;
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
};

type FieldError = Partial<Record<keyof OnboardingForm, string>>;

export default function OnboardingIndexPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<FieldError>({});
    const [form, setForm] = useState<OnboardingForm>({
        name: "",
        phone: "",
        city: "",
        state: "",
        address: "",
        whatsapp: "",
        description: "",
        website: "",
        facebook: "",
        instagram: "",
        youtube: "",
        linkedin: "",
    });

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get(API.INTERNAL.INSTITUTE.ROOT);
                const data = response.data?.data ?? {};

                if (data.isOnboarded) {
                    router.push("/dashboard");
                    return;
                }

                setForm({
                    name: data.name ?? "",
                    phone: data.phone ?? "",
                    city: data.city ?? "",
                    state: data.state ?? "",
                    address: data.address ?? "",
                    whatsapp: data.whatsapp ?? "",
                    description: data.description ?? "",
                    website: data.socialLinks?.website ?? "",
                    facebook: data.socialLinks?.facebook ?? "",
                    instagram: data.socialLinks?.instagram ?? "",
                    youtube: data.socialLinks?.youtube ?? "",
                    linkedin: data.socialLinks?.linkedin ?? "",
                });
                setLoading(false);
            } catch {
                router.push("/login");
            }
        };
        load();
    }, [router]);

    const setValue = (key: keyof OnboardingForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const next: FieldError = {};
        if (!form.name.trim()) next.name = "Institute name is required";
        if (!form.phone.trim()) next.phone = "Phone number is required";
        else if (!/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, "")))
            next.phone = "Enter a valid Indian mobile number";
        if (!form.city.trim()) next.city = "City is required";
        if (!form.state.trim()) next.state = "State is required";
        if (!form.address.trim()) next.address = "Address is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            await api.post(API.INTERNAL.INSTITUTE.ONBOARDING, form);

            toast.success("Institute setup complete!");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-3xl space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-primary">Step 1 of 1 — Institute Setup</p>
                    <h1 className="text-3xl font-bold tracking-tight">Setup Your Institute</h1>
                    <p className="text-muted-foreground">Fill in the details below to start managing admissions.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Fields marked with * are required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Institute Name *</Label>
                                <Input id="name" value={form.name} onChange={(e) => setValue("name", e.target.value)} placeholder="e.g. Pinnacle Academy" />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input id="phone" value={form.phone} onChange={(e) => setValue("phone", e.target.value)} placeholder="e.g. 9876543210" />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input id="city" value={form.city} onChange={(e) => setValue("city", e.target.value)} placeholder="e.g. Jaipur" />
                                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input id="state" value={form.state} onChange={(e) => setValue("state", e.target.value)} placeholder="e.g. Rajasthan" />
                                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address *</Label>
                                <Textarea id="address" value={form.address} onChange={(e) => setValue("address", e.target.value)} placeholder="Full address" rows={3} />
                                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setValue("whatsapp", e.target.value)} placeholder="WhatsApp number" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={form.description} onChange={(e) => setValue("description", e.target.value)} placeholder="Short description" />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-3">Social Links (optional)</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Input value={form.website} onChange={(e) => setValue("website", e.target.value)} placeholder="Website URL" />
                                <Input value={form.facebook} onChange={(e) => setValue("facebook", e.target.value)} placeholder="Facebook URL" />
                                <Input value={form.instagram} onChange={(e) => setValue("instagram", e.target.value)} placeholder="Instagram URL" />
                                <Input value={form.youtube} onChange={(e) => setValue("youtube", e.target.value)} placeholder="YouTube URL" />
                                <Input value={form.linkedin} onChange={(e) => setValue("linkedin", e.target.value)} placeholder="LinkedIn URL" />
                            </div>
                        </div>

                        <Button onClick={submit} disabled={saving} className="w-full" size="lg">
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save & Continue →"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
