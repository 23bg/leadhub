"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import InstituteProfileView from "@/modules/institute/components/InstituteProfileView";
import InstituteProfileForm, { InstituteFormState } from "@/modules/institute/components/InstituteProfileForm";

const emptyForm: InstituteFormState = {
    name: "",
    slug: "",
    description: "",
    phone: "",
    whatsapp: "",
    city: "",
    state: "",
    address: "",
    timings: "",
    logo: "",
    banner: "",
    website: "",
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
};

export default function InstitutePage() {
    const [mode, setMode] = useState<"view" | "edit">("view");
    const [form, setForm] = useState<InstituteFormState>(emptyForm);
    const [studentsCount, setStudentsCount] = useState(0);
    const [coursesCount, setCoursesCount] = useState(0);

    const load = async () => {
        const [instituteRes, studentsRes, coursesRes] = await Promise.all([
            api.get(API.INTERNAL.INSTITUTE.ROOT),
            api.get(API.INTERNAL.STUDENTS.ROOT),
            api.get(API.INTERNAL.COURSES.ROOT),
        ]);

        const institute = instituteRes.data?.data ?? {};
        setStudentsCount((studentsRes.data?.data ?? []).length);
        setCoursesCount((coursesRes.data?.data ?? []).length);

        setForm({
            name: institute.name ?? "",
            slug: institute.slug ?? "",
            description: institute.description ?? "",
            phone: institute.phone ?? "",
            whatsapp: institute.whatsapp ?? "",
            city: institute.city ?? "",
            state: institute.state ?? "",
            address: institute.address ?? "",
            timings: institute.timings ?? "",
            logo: institute.logo ?? "",
            banner: institute.banner ?? "",
            website: institute.socialLinks?.website ?? "",
            instagram: institute.socialLinks?.instagram ?? "",
            facebook: institute.socialLinks?.facebook ?? "",
            youtube: institute.socialLinks?.youtube ?? "",
            linkedin: institute.socialLinks?.linkedin ?? "",
        });
    };

    useEffect(() => {
        load();
    }, []);

    if (mode === "edit") {
        return (
            <main className="p-6">
                <InstituteProfileForm
                    form={form}
                    onChange={setForm}
                    onCancel={() => setMode("view")}
                    onSaved={async () => {
                        await load();
                        setMode("view");
                    }}
                />
            </main>
        );
    }

    return (
        <main className="p-6">
            <InstituteProfileView
                data={{
                    name: form.name,
                    slug: form.slug,
                    description: form.description,
                    phone: form.phone,
                    address: form.address,
                    website: form.website,
                    logo: form.logo,
                    banner: form.banner,
                    studentsCount,
                    coursesCount,
                }}
                onEdit={() => setMode("edit")}
            />
        </main>
    );
}
