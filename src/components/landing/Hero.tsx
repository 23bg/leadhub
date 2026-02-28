import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 lg:py-24">
                <div className="space-y-6">
                    <p className="font-sans text-sm font-semibold uppercase tracking-wide text-muted-foreground">OnCampus</p>
                    <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                        Admission CRM for Coaching Institutes
                    </h1>
                    <div className="font-sans space-y-2 text-lg text-muted-foreground">
                        <p>Capture enquiries.</p>
                        <p>Track leads.</p>
                        <p>Convert students.</p>
                        <p>All in one simple system.</p>
                    </div>
                    <p className="font-heading text-2xl font-bold">₹999/month</p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg">
                            <Link href="/signup">Start Free Trial</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/demo-institute">View Demo Institute</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-3">
                    <Image
                        src="/landing/dashboard-mock.svg"
                        alt="OnCampus dashboard preview"
                        width={900}
                        height={620}
                        priority
                        className="h-auto w-full rounded-lg"
                    />
                </div>
            </div>
        </section>
    );
}

