interface PageHeaderProps {
    title: string;
    description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <header className="animate-in fade-in slide-in-from-top-4 duration-400">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                {title}
            </h1>
            <p className="text-slate-600 mt-1">{description}</p>
        </header>
    );
}
