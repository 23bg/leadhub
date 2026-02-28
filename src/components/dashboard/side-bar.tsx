"use client"

import {
    CreditCard,
    Settings,
    Home,
    Package,
    Users,
    MessageCircle,
    Twitter,
    Linkedin,
    Download,
    ScanSearch,
    Globe,
    UserRound,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
    SidebarFooter,
} from "@/components/ui/sidebar"

import Link from "next/link"
import ROUTES from "@/constants/routes"
import { NavMain } from "@/components/dashboard/nav-main"
import { usePathname } from "next/navigation"

export function DashboardAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const pathname = usePathname();
    const { state } = useSidebar();

    const withActiveFlag = (items: any[]) =>
        items.map((item) => {
            const isRoot = item.url === "/";

            return {
                ...item,
                isActive: isRoot
                    ? pathname === "/"
                    : pathname === item.url || pathname.startsWith(item.url + "/"),
            };
        });

    const navItems = [
        {
            title: "Dashboard",
            url: ROUTES.DASHBOARD.ROOT,
            icon: Home,
        },
        {
            title: "Leads",
            url: ROUTES.DASHBOARD.LEADS,
            icon: UserRound,
        },
        {
            title: "Products",
            url: ROUTES.DASHBOARD.PRODUCTS,
            icon: Package,
        },
        {
            title: "Import",
            url: ROUTES.DASHBOARD.IMPORT,
            icon: Download,
        },
        {
            title: "Scraper",
            url: ROUTES.DASHBOARD.SCRAPER,
            icon: ScanSearch,
        },
        {
            title: "Directory",
            url: ROUTES.DASHBOARD.DIRECTORY("business", "mumbai"),
            icon: Globe,
        },
        {
            title: "Team",
            url: ROUTES.DASHBOARD.TEAM,
            icon: Users,
        },
        {
            title: "Settings",
            url: ROUTES.DASHBOARD.SETTINGS,
            icon: Settings,
        },
        {
            title: "Billing",
            url: ROUTES.DASHBOARD.BILLING,
            icon: CreditCard,
        },
    ];

    const data = {
        navMain: navItems,
    };

    const socialItems = [
        {
            title: "WhatsApp",
            url: process.env.NEXT_PUBLIC_WHATSAPP || "", // Replace with actual WhatsApp link
            icon: MessageCircle,
        },
        {
            title: "X (Twitter)",
            url: process.env.NEXT_PUBLIC_X || "", // Replace with actual X/Twitter link
            icon: Twitter,
        },
        {
            title: "LinkedIn",
            url: process.env.NEXT_PUBLIC_LINKEDIN || "", // Replace with actual LinkedIn link
            icon: Linkedin,
        },
    ];

    return (
        <Sidebar collapsible="icon" {...props} variant="inset" className="h-screen overflow-hidden " >
            <SidebarHeader className="mx-0 px-0 ">
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem >
                            <SidebarMenuButton >
                                <Link href={ROUTES.DASHBOARD.ROOT} className="flex items-center gap-2">
                                    {state === "collapsed" ? (
                                        <span className="text-xl font-semibold text-primary"></span>) : (
                                        <div className="flex items-center gap-2">

                                            <span className="text-xl font-semibold text-primary">LeadHub</span>
                                        </div>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent className="">
                <NavMain menuTitle="Menus" items={withActiveFlag(data.navMain)} />
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarMenu>
                        {socialItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link href={item.url} target="_blank" rel="noopener noreferrer">
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    );
}

