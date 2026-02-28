'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body>
                <div className="h-screen flex flex-col items-center justify-center px-4">
                    <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
                    <p className="text-gray-600 mt-2 text-center">{error.message || 'Unexpected application error'}</p>
                    <button
                        onClick={() => reset()}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
