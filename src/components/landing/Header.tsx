import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingHeader() {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">

                    <Link href="/" className="text-base font-bold tracking-tight">
                        OnCampus
                    </Link>

                    <Link href="/">Home</Link>
                    <Link href="/features">Features</Link>
                    <Link href="/pricing">Pricing</Link>
                    <Link href="/demo-institute">Demo</Link>
                </nav>

                <div className="flex items-center gap-2">

                    <Button asChild variant="ghost" size="sm">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/signup">Start Free Trial</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}