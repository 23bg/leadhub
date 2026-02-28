import { Globe, QrCode, UsersRound, GraduationCap } from "lucide-react";

const items = [
    { icon: Globe, label: "Website" },
    { icon: QrCode, label: "QR Leads" },
    { icon: UsersRound, label: "CRM" },
    { icon: GraduationCap, label: "Students" },
];

export default function Trust() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Built for Indian Coaching Institutes</h2>
                    <p className="text-muted-foreground">Simple â€¢ Affordable â€¢ Powerful</p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {items.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

