import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const logoClassName = isCollapsed
        ? 'h-8 w-auto object-contain'
        : 'h-10 w-auto object-contain';

    return (
        <>
            <div className="flex min-w-[40px] items-center justify-center">
                <img
                    src="/logo.png"
                    alt="Registro de Gastos"
                    className={logoClassName}
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
