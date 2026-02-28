import { redirect } from "next/navigation";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { instituteService } from "@/features/institute/services/institute.service";
import LandingPage from "@/modules/marketing/LandingPage";
import DashboardHome from "@/modules/dashboard/DashboardHome";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

export default async function Page() {
    const session = await readSessionFromCookie();

    if (!session) {
        return <LandingPage />;
    }

    const institute = await instituteService.getOverview(session.instituteId);
    if (!institute.isOnboarded) {
        redirect("/onboarding");
    }

    return (
        <DashboardLayout>
            <DashboardHome />
        </DashboardLayout>
    );
}
