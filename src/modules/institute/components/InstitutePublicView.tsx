import { MapPin, Phone, BookOpen } from "lucide-react";
import Image from "next/image";
import PublicEnquiryForm from "@/modules/institute/components/PublicEnquiryForm";

type Course = {
    id: string;
    name: string;
    banner?: string | null;
    duration?: string | null;
    defaultFees?: number | null;
    description?: string | null;
};

type Teacher = {
    id: string;
    name: string;
    subject?: string | null;
};

type InstitutePublicViewProps = {
    slug: string;
    institute: {
        name?: string | null;
        description?: string | null;
        logo?: string | null;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        courses: Course[];
        teachers?: Teacher[];
    };
};

export default function InstitutePublicView({ slug, institute }: InstitutePublicViewProps) {
    const initials = (institute.name || "I").slice(0, 1).toUpperCase();

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
            <section className="space-y-2">
                <div className="mb-3">
                    {institute.logo ? (
                        <Image
                            src={institute.logo}
                            alt={`${institute.name || "Institute"} logo`}
                            width={64}
                            height={64}
                            unoptimized
                            className="h-16 w-16 rounded-xl border object-cover"
                        />
                    ) : null}
                    <div
                        style={{ display: institute.logo ? "none" : "flex" }}
                        className="h-16 w-16 items-center justify-center rounded-xl border bg-linear-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/20 text-lg font-semibold"
                    >
                        {initials}
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{institute.name || "Institute"}</h1>
                <p className="text-muted-foreground">{institute.description || "Admissions open now"}</p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">About</h2>
                <p className="text-sm text-muted-foreground">{institute.description || "No description available."}</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5" /> Courses</h2>
                {institute.courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No courses listed yet.</p>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {institute.courses.map((course) => (
                            <div key={course.id} className="rounded-lg border p-4">
                                {course.banner ? (
                                    <Image
                                        src={course.banner}
                                        alt={`${course.name} banner`}
                                        width={900}
                                        height={200}
                                        unoptimized
                                        className="mb-3 h-24 w-full rounded-md border object-cover"
                                    />
                                ) : null}
                                <div
                                    style={{ display: course.banner ? "none" : "block" }}
                                    className="mb-3 h-24 w-full rounded-md border bg-linear-to-r from-indigo-500/20 via-violet-500/20 to-sky-500/20"
                                />
                                <p className="font-medium">{course.name}</p>
                                <p className="text-sm text-muted-foreground">{course.description || "-"}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {course.duration || "Duration N/A"}
                                    {course.defaultFees != null ? ` • ₹${course.defaultFees.toLocaleString("en-IN")}` : ""}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {institute.teachers?.length ? (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Teachers</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                        {institute.teachers.map((teacher) => (
                            <div key={teacher.id} className="rounded-lg border p-4">
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm text-muted-foreground">{teacher.subject || "Teacher"}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Contact</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> {institute.phone || "-"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> {[institute.address, institute.city, institute.state].filter(Boolean).join(", ") || "-"}</p>
            </section>

            <section>
                <PublicEnquiryForm slug={slug} />
            </section>
        </main>
    );
}
