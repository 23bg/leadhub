"use client";

import Link from "next/link";
import { DashboardAppSidebar } from "@/components/dashboard/side-bar";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider className="rounded overflow-hidden h-screen">
            <DashboardAppSidebar />

            <SidebarInset className="border shadow-xl bg-background ">
                <DashboardHeader />

                {/* MAIN CONTENT */}
                <main className="overflow-hidden">
                    <div className="h-screen">
                        <ScrollArea className="h-full">
                            {children}
                        </ScrollArea>
                    </div>
                </main>

                {/* FOOTER */}
                <footer className="
                    border-t bg-background dark:bg-zinc-900/40
                    backdrop-blur-sm rounded-b-2xl
                ">
                    <div className="
                        flex flex-col sm:flex-row justify-between items-center
                        gap-2 px-6 py-3 text-xs text-muted-foreground
                    ">
                        <span>©2026 LeadHub, universal lead intelligence platform.</span>

                        <div className="flex gap-3">
                            <Link href="#" className="hover:text-primary transition">License</Link>
                            <Link href="#" className="hover:text-primary transition">More Themes</Link>
                            <Link href="#" className="hover:text-primary transition">Documentation</Link>
                            <Link href="#" className="hover:text-primary transition">Support</Link>
                        </div>
                    </div>
                </footer>
            </SidebarInset>
        </SidebarProvider>
    );
}

