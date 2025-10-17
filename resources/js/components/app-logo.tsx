import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <>
            <div className="flex items-center justify-center min-w-[40px]">
                <img 
                    src="/logo.png" 
                    alt="Registro de Gastos" 
                    className="h-10 w-auto object-contain"
                />
            </div>
            {!isCollapsed && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        Registro de Gastos
                    </span>
                </div>
            )}
        </>
    );
}
