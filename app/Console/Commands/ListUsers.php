<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:list {--admin : Mostrar solo administradores} {--unauthorized : Mostrar solo usuarios no autorizados}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Listar todos los usuarios de la aplicación';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $query = User::query();

        // Filtrar por administradores si se especifica
        if ($this->option('admin')) {
            $query->where('is_admin', true);
        }

        // Filtrar por no autorizados si se especifica
        if ($this->option('unauthorized')) {
            $query->where('authorized', false);
        }

        $users = $query->orderBy('is_admin', 'desc')
            ->orderBy('authorized', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($users->isEmpty()) {
            $this->warn('No se encontraron usuarios.');

            return Command::SUCCESS;
        }

        // Preparar datos para la tabla
        $tableData = $users->map(function ($user) {
            return [
                $user->id,
                $user->name,
                $user->email,
                $user->is_admin ? '✓ Admin' : '',
                $user->authorized ? '✓' : '✗',
                $user->google_id ? '✓' : '✗',
                $user->created_at->format('Y-m-d H:i'),
            ];
        });

        $this->newLine();
        $this->table(
            ['ID', 'Nombre', 'Email', 'Rol', 'Autorizado', 'Google', 'Creado'],
            $tableData
        );

        $this->newLine();
        $this->line('Total de usuarios: '.$users->count());
        $this->line('Administradores: '.$users->where('is_admin', true)->count());
        $this->line('Autorizados: '.$users->where('authorized', true)->count());
        $this->line('No autorizados: '.$users->where('authorized', false)->count());

        return Command::SUCCESS;
    }
}
