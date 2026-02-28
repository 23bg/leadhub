"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { API } from "@/constants/api";

type DashboardSettings = {
    compactTables: boolean;
    autoRefreshDashboard: boolean;
    showAmountsInLakh: boolean;
};

type NotificationSettings = {
    desktopAlerts: boolean;
    paymentReminders: boolean;
    leadActivityAlerts: boolean;
};

type AppSettings = {
    dashboard: DashboardSettings;
    notifications: NotificationSettings;
};

const SETTINGS_STORAGE_KEY = "oncampus:settings";

const defaultSettings: AppSettings = {
    dashboard: {
        compactTables: false,
        autoRefreshDashboard: true,
        showAmountsInLakh: false,
    },
    notifications: {
        desktopAlerts: true,
        paymentReminders: true,
        leadActivityAlerts: true,
    },
};

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [dataCounts, setDataCounts] = useState({ leads: 0, products: 0, team: 0, billing: 0 });
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as AppSettings;
            setSettings({
                dashboard: { ...defaultSettings.dashboard, ...parsed.dashboard },
                notifications: { ...defaultSettings.notifications, ...parsed.notifications },
            });
        } catch {
            setSettings(defaultSettings);
        }

        const loadCounts = async () => {
            try {
                const [leadsRes, productsRes, teamRes, billingRes] = await Promise.all([
                    api.get(API.LEADHUB.LEADS),
                    api.get(API.LEADHUB.PRODUCTS),
                    api.get(API.INTERNAL.TEAMS.ROOT),
                    api.get(API.INTERNAL.BILLING.ROOT),
                ]);

                setDataCounts({
                    leads: leadsRes.data?.data?.total ?? 0,
                    products: (productsRes.data?.data ?? []).length,
                    team: (teamRes.data?.data ?? []).length,
                    billing: Number(Boolean(billingRes.data?.data)),
                });
            } catch {
                // Keep defaults silently
            }
        };

        loadCounts();
    }, []);

    const saveSettings = () => {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        toast.success("Settings saved");
    };

    const exportData = async () => {
        setExporting(true);
        try {
            const [studentsRes, leadsRes, coursesRes, feesRes, paymentsRes] = await Promise.all([
                api.get(API.INTERNAL.STUDENTS.ROOT),
                api.get(API.INTERNAL.LEADS.ROOT),
                api.get(API.INTERNAL.COURSES.ROOT),
                api.get(API.INTERNAL.FEES.ROOT),
                api.get(API.INTERNAL.PAYMENTS.ROOT),
            ]);

            const payload = {
                exportedAt: new Date().toISOString(),
                data: {
                    students: studentsRes.data?.data ?? [],
                    leads: leadsRes.data?.data ?? [],
                    courses: coursesRes.data?.data ?? [],
                    fees: feesRes.data?.data ?? [],
                    payments: paymentsRes.data?.data ?? [],
                },
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `oncampus-export-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success("Data export downloaded");
        } catch {
            toast.error("Failed to export data");
        } finally {
            setExporting(false);
        }
    };

    return (
        <main className="p-6 space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-semibold">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage appearance, notifications, and dashboard behavior.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Choose how OnCampus looks for your workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-w-xs">
                        <Label>Theme</Label>
                        <Select
                            value={mounted ? (theme ?? "system") : "system"}
                            onValueChange={(value) => setTheme(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Preferences</CardTitle>
                    <CardDescription>Control table density and dashboard behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Compact tables</p>
                            <p className="text-xs text-muted-foreground">Reduce table spacing to fit more rows.</p>
                        </div>
                        <Switch
                            checked={settings.dashboard.compactTables}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    dashboard: { ...prev.dashboard, compactTables: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Auto refresh dashboard</p>
                            <p className="text-xs text-muted-foreground">Refresh summary cards and key metrics automatically.</p>
                        </div>
                        <Switch
                            checked={settings.dashboard.autoRefreshDashboard}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    dashboard: { ...prev.dashboard, autoRefreshDashboard: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Show large amounts in lakh format</p>
                            <p className="text-xs text-muted-foreground">Display values like ₹1,50,000 as ₹1.5L where applicable.</p>
                        </div>
                        <Switch
                            checked={settings.dashboard.showAmountsInLakh}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    dashboard: { ...prev.dashboard, showAmountsInLakh: checked },
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Choose what updates you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Desktop alerts</p>
                            <p className="text-xs text-muted-foreground">Show browser alerts for important activity.</p>
                        </div>
                        <Switch
                            checked={settings.notifications.desktopAlerts}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, desktopAlerts: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Fee payment reminders</p>
                            <p className="text-xs text-muted-foreground">Notify when pending fee reminders are due.</p>
                        </div>
                        <Switch
                            checked={settings.notifications.paymentReminders}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, paymentReminders: checked },
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Lead activity alerts</p>
                            <p className="text-xs text-muted-foreground">Notify when leads are added or status changes.</p>
                        </div>
                        <Switch
                            checked={settings.notifications.leadActivityAlerts}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    notifications: { ...prev.notifications, leadActivityAlerts: checked },
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Products Management</CardTitle>
                    <CardDescription>Manage LeadHub products used for lead targeting and tracking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/products">Open Products</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data</CardTitle>
                    <CardDescription>Review usage and export your LeadHub data anytime.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Leads</p><p className="text-lg font-semibold">{dataCounts.leads}</p></div>
                        <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Products</p><p className="text-lg font-semibold">{dataCounts.products}</p></div>
                        <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Team Members</p><p className="text-lg font-semibold">{dataCounts.team}</p></div>
                        <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Billing Profile</p><p className="text-lg font-semibold">{dataCounts.billing ? "Configured" : "Pending"}</p></div>
                    </div>

                    <Button variant="outline" onClick={exportData} disabled={exporting}>
                        {exporting ? "Exporting..." : "Export Data"}
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={saveSettings}>Save Settings</Button>
            </div>
        </main>
    );
}
