const solutions = [
    "Institute website included",
    "QR code lead capture",
    "Admission CRM",
    "Student database",
    "Teacher profiles",
];

export default function Solution() {
    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">One System For Admissions</h2>
                <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {solutions.map((item) => (
                        <li key={item} className="rounded-lg border p-4 text-muted-foreground">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

