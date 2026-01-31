export function Background() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Light modern background base */}
            <div className="absolute inset-0 bg-slate-50" />

            {/* Grid Pattern - using SVG directly to avoid dependencies */}
            <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(51 65 85 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`
                }}
            />

            {/* Radial Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-slate-50/90 to-red-50/40" />

            {/* Subtle top light source */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-red-200/20 blur-[120px] rounded-full" />
        </div>
    );
}
