import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { instituteService } from "@/features/institute/services/institute.service";

export const metadata: Metadata = {
    title: "Dashboard",
    description:
        "LeadHub Dashboard - Manage universal leads, products, outreach, and billing.",
};

export default async function AppLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await readSessionFromCookie();
    if (!session) {
        redirect("/login");
    }

    const institute = await instituteService.getOverview(session.instituteId);
    if (!institute.isOnboarded) {
        redirect("/onboarding");
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}

