import { dashboard, login } from '@/routes';
import categories from '@/routes/categories';
import expenses from '@/routes/expenses';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bienvenido - Spending Log" />
            <div className="flex min-h-screen flex-col bg-black">
                {/* Header */}
                <header className="border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
                    <div className="container flex h-16 items-center justify-end px-4">
                        {auth.user ? (
                            <Link
                                href={dashboard.url()}
                                className="text-sm font-medium text-white hover:text-white/80"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={login.url()}
                                className="text-sm font-medium text-white hover:text-white/80"
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex flex-1 items-center justify-center">
                    <div className="container grid gap-12 px-4 py-12 lg:grid-cols-2 lg:gap-16 lg:px-8">
                        {/* Left Section - Text Content */}
                        <div className="flex flex-col justify-center space-y-8">
                            <div className="space-y-6">
                                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    Controla Tus Finanzas
                                </h1>
                                <p className="text-lg text-white/80 sm:text-xl">
                                    Registra tus gastos, aplica descuentos,
                                    categoriza cada movimiento y lleva el
                                    control de tus medios de pago.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Link
                                    href={expenses.index.url()}
                                    className="group flex items-center gap-2 text-base font-medium text-orange-500 transition-colors hover:text-orange-400"
                                >
                                    <span>Ver el Tablero de Gastos</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    href={categories.index.url()}
                                    className="group flex items-center gap-2 text-base font-medium text-orange-500 transition-colors hover:text-orange-400"
                                >
                                    <span>Gestionar Categorías y Medios</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>

                            <div className="pt-4">
                                {auth.user ? (
                                    <Link
                                        href={expenses.index.url()}
                                        className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-medium text-black shadow-sm transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                                    >
                                        Comienza Ahora
                                    </Link>
                                ) : (
                                    <Link
                                        href={login.url()}
                                        className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-medium text-black shadow-sm transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
                                    >
                                        Comienza Ahora
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right Section - Illustration */}
                        <div className="relative hidden items-center justify-center lg:flex">
                            <div className="relative w-full max-w-lg">
                                <img
                                    src="/spending-log.png"
                                    alt="Ilustración financiera"
                                    className="relative z-10 h-full w-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
