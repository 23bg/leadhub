"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { Loader2, CreditCard } from "lucide-react";
import { PLAN_CONFIG, PlanType } from "@/config/plans";

type BillingSummary = {
    planType: PlanType;
    planName?: string;
    planAmount: number;
    currency: string;
    userLimit: number;
    usersUsed: number;
    status: string;
    nextBillingDate?: string | null;
    razorpaySubId?: string | null;
    lastPaymentAmount?: number | null;
    lastPaymentDate?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
    TRIAL: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    INACTIVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function BillingPage() {
    const [summary, setSummary] = useState<BillingSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanType>("SOLO");

    const loadSummary = async () => {
        try {
            const response = await api.get(API.INTERNAL.BILLING.ROOT);
            const data = response.data?.data ?? null;
            setSummary(data);
            if (data?.planType) {
                setSelectedPlan(data.planType);
            }
        } catch {
            toast.error("Failed to load billing info");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSummary(); }, []);

    const createSubscription = async (planType: PlanType) => {
        setCreating(true);
        try {
            await api.post(API.INTERNAL.BILLING.ROOT, { action: "create-subscription", planType });
            toast.success(planType === "TEAM" ? "Team plan initiated" : "Solo plan initiated");
            await loadSummary();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Network error");
        } finally {
            setCreating(false);
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
        <main className="p-6 max-w-2xl">
            <h1 className="font-heading text-2xl font-semibold">Billing</h1>
            <p className="mt-1 text-muted-foreground">Manage your subscription and billing.</p>

            {summary?.status === "INACTIVE" ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                    Trial has expired. Choose a plan below to continue full access.
                </div>
            ) : null}

            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Subscription Plan
                            </CardTitle>
                            <CardDescription className="mt-1">{summary?.planName ?? "Solo"} — ₹{summary?.planAmount ?? 499}/month</CardDescription>
                        </div>
                        <Badge variant="secondary" className={STATUS_COLORS[summary?.status ?? "TRIAL"] ?? ""}>
                            {summary?.status ?? "TRIAL"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{summary?.status ?? "TRIAL"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Users</span>
                        <span className="font-medium">{summary?.usersUsed ?? 0}/{summary?.userLimit ?? 1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next billing date</span>
                        <span className="font-medium">
                            {summary?.nextBillingDate ? new Date(summary.nextBillingDate).toLocaleDateString() : "Not set"}
                        </span>
                    </div>
                    {summary?.razorpaySubId ? (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Razorpay ID</span>
                            <span className="font-mono text-xs">{summary.razorpaySubId}</span>
                        </div>
                    ) : null}

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last payment</span>
                        <span className="font-medium">
                            {summary?.lastPaymentDate && summary?.lastPaymentAmount
                                ? `${new Date(summary.lastPaymentDate).toLocaleDateString()} • ₹${summary.lastPaymentAmount}`
                                : "No payment history yet"}
                        </span>
                    </div>

                    <div className="grid gap-2 pt-2 sm:grid-cols-2">
                        <Button
                            variant={selectedPlan === "SOLO" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => {
                                setSelectedPlan("SOLO");
                                void createSubscription("SOLO");
                            }}
                        >
                            {creating && selectedPlan === "SOLO" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Choose Solo (₹${PLAN_CONFIG.SOLO.priceMonthly})`}
                        </Button>
                        <Button
                            variant={selectedPlan === "TEAM" ? "default" : "outline"}
                            disabled={creating}
                            onClick={() => {
                                setSelectedPlan("TEAM");
                                void createSubscription("TEAM");
                            }}
                        >
                            {creating && selectedPlan === "TEAM" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Upgrade Team (₹${PLAN_CONFIG.TEAM.priceMonthly})`}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
