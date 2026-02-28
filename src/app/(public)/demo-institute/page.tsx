import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Demo Institute - OnCampus",
    description: "Preview how an institute profile looks on OnCampus.",
};

export default function DemoInstitutePage() {
    return (
        <>
            <LandingHeader />
            <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 lg:py-16">
                <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Demo</p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Every institute gets their own page.</h1>
                    <p className="max-w-3xl text-muted-foreground">
                        This is a sample institute profile layout your coaching center can publish instantly.
                    </p>
                </div>

                <div className="mt-8 rounded-xl border bg-muted/20 p-3">
                    <Image
                        src="/landing/demo-mock.svg"
                        alt="Demo institute profile page"
                        width={1200}
                        height={760}
                        priority
                        className="h-auto w-full rounded-lg"
                    />
                </div>

                <div className="mt-8 flex gap-3">
                    <Button asChild>
                        <Link href="/signup">Start Free Trial</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </main>
            <Footer />
        </>
    );
}

