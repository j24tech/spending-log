import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, FileText, List } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Statistics {
    total_expenses: number;
    number_of_expenses: number;
    number_of_expense_details: number;
}

interface ChartData {
    expenses_by_day: Array<{ date: string; total: number }>;
    expense_details_by_percentage: Array<{ name: string; value: number; percentage: number }>;
    expenses_by_category: Array<{ name: string; value: number }>;
    expenses_by_payment_method: Array<{ name: string; value: number }>;
    expenses_by_discount: Array<{ name: string; value: number }>;
}

interface Filters {
    start_date: string;
    end_date: string;
}

interface Props {
    statistics: Statistics;
    charts: ChartData;
    filters: Filters;
}

const expensesByDayConfig: ChartConfig = {
    total: {
        label: 'Total',
        color: 'hsl(217, 91%, 60%)', // Azul
    },
};

// Colores variados para los gráficos de torta
const pieChartColors = [
    'hsl(217, 91%, 60%)', // Azul brillante
    'hsl(142, 76%, 36%)', // Verde esmeralda
    'hsl(280, 100%, 70%)', // Púrpura claro
    'hsl(24, 95%, 53%)', // Naranja
    'hsl(199, 89%, 48%)', // Cian
    'hsl(0, 84%, 60%)', // Rojo
    'hsl(262, 83%, 58%)', // Violeta
    'hsl(47, 96%, 53%)', // Amarillo
    'hsl(158, 64%, 52%)', // Verde turquesa
    'hsl(340, 82%, 52%)', // Rosa
    'hsl(197, 100%, 47%)', // Azul cielo
    'hsl(39, 100%, 50%)', // Amarillo dorado
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

// Crear configuraciones dinámicas para cada gráfico de torta
const createPieChartConfig = (
    data: Array<{ name: string; value: number; percentage?: number }>,
): ChartConfig => {
    const config: ChartConfig = {};
    const total = data.reduce((sum, item) => sum + item.value, 0);
    data.forEach((item, index) => {
        const percentage = item.percentage ?? (total > 0 ? (item.value / total) * 100 : 0);
        config[item.name] = {
            label: `${item.name}: ${formatCurrency(item.value)} (${percentage.toFixed(1)}%)`,
            color: pieChartColors[index % pieChartColors.length],
        };
    });
    return config;
};

export default function Dashboard({
    statistics,
    charts,
    filters: initialFilters,
}: Props) {
    const [filters, setFilters] = useState(initialFilters);

    // Actualizar filtros cuando cambien las props del backend
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const handleFilterChange = useCallback(() => {
        router.get(
            dashboard().url,
            {
                start_date: filters.start_date,
                end_date: filters.end_date,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, [filters]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Filtro por rango de fechas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>
                            Selecciona un rango de fechas para filtrar los datos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="start_date">Fecha Inicio</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            start_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="end_date">Fecha Fin</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={filters.end_date}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            end_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <Button onClick={handleFilterChange} className="md:w-auto">
                                Aplicar Filtros
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Widgets de Estadísticas */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Gastos
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(statistics.total_expenses)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Período seleccionado
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Número de Gastos
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.number_of_expenses}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Gastos reportados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Detalles de Gastos
                            </CardTitle>
                            <List className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.number_of_expense_details}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Detalles reportados
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráfico de Barras: Gastos por Día */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gastos Totales por Día</CardTitle>
                        <CardDescription>
                            Distribución de gastos diarios en el período seleccionado
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={expensesByDayConfig}>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={charts.expenses_by_day}>
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) =>
                                            formatDate(value)
                                        }
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            formatCurrency(value)
                                        }
                                    />
                                    <ChartTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload?.length) {
                                                return (
                                                    <ChartTooltipContent>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                {formatDate(
                                                                    payload[0]
                                                                        .payload
                                                                        .date,
                                                                )}
                                                            </p>
                                                            <p className="text-sm">
                                                                Total:{' '}
                                                                {formatCurrency(
                                                                    payload[0]
                                                                        .value as number,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </ChartTooltipContent>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--color-total)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Diagramas de Torta */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Principales Detalles de Gastos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Principales Detalles de Gastos</CardTitle>
                            <CardDescription>
                                Top 10 detalles con mayor monto (por porcentaje)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={createPieChartConfig(
                                    charts.expense_details_by_percentage,
                                )}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload?.length) {
                                                    const data =
                                                        payload[0].payload;
                                                    return (
                                                        <ChartTooltipContent>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    {data.name}
                                                                </p>
                                                                <p className="text-sm">
                                                                    {formatCurrency(
                                                                        data.value,
                                                                    )}{' '}
                                                                    (
                                                                    {data.percentage}
                                                                    %)
                                                                </p>
                                                            </div>
                                                        </ChartTooltipContent>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Pie
                                            data={charts.expense_details_by_percentage}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={30}
                                            label={({
                                                name,
                                                percentage,
                                                value,
                                            }) => {
                                                if (percentage > 5) {
                                                    return `${percentage.toFixed(1)}%`;
                                                }
                                                return '';
                                            }}
                                            labelLine={false}
                                        >
                                            {charts.expense_details_by_percentage.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            pieChartColors[
                                                                index %
                                                                    pieChartColors.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="name" />
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Por Categorías */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gastos por Categoría</CardTitle>
                            <CardDescription>
                                Distribución de gastos por categoría
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={createPieChartConfig(
                                    charts.expenses_by_category,
                                )}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload?.length) {
                                                    const data =
                                                        payload[0].payload;
                                                    const total = charts.expenses_by_category.reduce(
                                                        (sum, item) =>
                                                            sum + item.value,
                                                        0,
                                                    );
                                                    const percentage =
                                                        total > 0
                                                            ? (
                                                                  (data.value /
                                                                      total) *
                                                                  100
                                                              ).toFixed(1)
                                                            : '0';
                                                    return (
                                                        <ChartTooltipContent>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    {data.name}
                                                                </p>
                                                                <p className="text-sm">
                                                                    {formatCurrency(
                                                                        data.value,
                                                                    )}{' '}
                                                                    ({percentage}%)
                                                                </p>
                                                            </div>
                                                        </ChartTooltipContent>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Pie
                                            data={charts.expenses_by_category}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={30}
                                            label={({ name, value, percent }) => {
                                                if (percent > 0.05) {
                                                    return `${(percent * 100).toFixed(1)}%`;
                                                }
                                                return '';
                                            }}
                                            labelLine={false}
                                        >
                                            {charts.expenses_by_category.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            pieChartColors[
                                                                index %
                                                                    pieChartColors.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="name" />
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Por Medio de Pago */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gastos por Medio de Pago</CardTitle>
                            <CardDescription>
                                Distribución de gastos por método de pago
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={createPieChartConfig(
                                    charts.expenses_by_payment_method,
                                )}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload?.length) {
                                                    const data =
                                                        payload[0].payload;
                                                    const total =
                                                        charts.expenses_by_payment_method.reduce(
                                                            (sum, item) =>
                                                                sum + item.value,
                                                            0,
                                                        );
                                                    const percentage =
                                                        total > 0
                                                            ? (
                                                                  (data.value /
                                                                      total) *
                                                                  100
                                                              ).toFixed(1)
                                                            : '0';
                                                    return (
                                                        <ChartTooltipContent>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    {data.name}
                                                                </p>
                                                                <p className="text-sm">
                                                                    {formatCurrency(
                                                                        data.value,
                                                                    )}{' '}
                                                                    ({percentage}%)
                                                                </p>
                                                            </div>
                                                        </ChartTooltipContent>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Pie
                                            data={charts.expenses_by_payment_method}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={30}
                                            label={({ name, value, percent }) => {
                                                if (percent > 0.05) {
                                                    return `${(percent * 100).toFixed(1)}%`;
                                                }
                                                return '';
                                            }}
                                            labelLine={false}
                                        >
                                            {charts.expenses_by_payment_method.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            pieChartColors[
                                                                index %
                                                                    pieChartColors.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="name" />
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Por Descuentos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gastos por Descuentos</CardTitle>
                            <CardDescription>
                                Distribución de descuentos aplicados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={createPieChartConfig(
                                    charts.expenses_by_discount,
                                )}
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload?.length) {
                                                    const data =
                                                        payload[0].payload;
                                                    const total =
                                                        charts.expenses_by_discount.reduce(
                                                            (sum, item) =>
                                                                sum + item.value,
                                                            0,
                                                        );
                                                    const percentage =
                                                        total > 0
                                                            ? (
                                                                  (data.value /
                                                                      total) *
                                                                  100
                                                              ).toFixed(1)
                                                            : '0';
                                                    return (
                                                        <ChartTooltipContent>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    {data.name}
                                                                </p>
                                                                <p className="text-sm">
                                                                    {formatCurrency(
                                                                        data.value,
                                                                    )}{' '}
                                                                    ({percentage}%)
                                                                </p>
                                                            </div>
                                                        </ChartTooltipContent>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Pie
                                            data={charts.expenses_by_discount}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={30}
                                            label={({ name, value, percent }) => {
                                                if (percent > 0.05) {
                                                    return `${(percent * 100).toFixed(1)}%`;
                                                }
                                                return '';
                                            }}
                                            labelLine={false}
                                        >
                                            {charts.expenses_by_discount.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            pieChartColors[
                                                                index %
                                                                    pieChartColors.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="name" />
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
