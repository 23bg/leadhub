import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        title: "Institute Website",
        description: "Professional institute page with courses and teachers.",
    },
    {
        title: "QR Lead Capture",
        description: "Students scan QR and submit enquiry.",
    },
    {
        title: "Lead Management",
        description: "Track enquiry status easily.",
    },
    {
        title: "Student Records",
        description: "Manage admitted students.",
    },
    {
        title: "Teacher Profiles",
        description: "Showcase faculty expertise.",
    },
    {
        title: "Excel Upload",
        description: "Import students easily.",
    },
];

export default function Features() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Features</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Card key={feature.title}>
                            <CardHeader>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">{feature.description}</CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

