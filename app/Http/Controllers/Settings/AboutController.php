<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\File;

class AboutController extends Controller
{
    /**
     * Show the about page with version information.
     */
    public function index(Request $request): Response
    {
        $versionInfo = $this->getVersionInfo();

        return Inertia::render('settings/about', [
            'versionInfo' => $versionInfo,
        ]);
    }

    /**
     * Get version information from package.json and composer.json.
     *
     * @return array<string, mixed>
     */
    protected function getVersionInfo(): array
    {
        $packageJsonPath = base_path('package.json');
        $composerJsonPath = base_path('composer.json');

        $packageJson = [];
        $composerJson = [];

        if (File::exists($packageJsonPath)) {
            $packageJson = json_decode(File::get($packageJsonPath), true) ?? [];
        }

        if (File::exists($composerJsonPath)) {
            $composerJson = json_decode(File::get($composerJsonPath), true) ?? [];
        }

        // Get Laravel version
        $laravelVersion = app()->version();

        // Get PHP version
        $phpVersion = PHP_VERSION;

        // Get React version from package.json
        $reactVersion = $packageJson['dependencies']['react'] ?? 'N/A';
        $reactVersion = str_replace('^', '', $reactVersion);

        // Get Inertia version
        $inertiaVersion = $packageJson['dependencies']['@inertiajs/react'] ?? 'N/A';
        $inertiaVersion = str_replace('^', '', $inertiaVersion);

        // Get Laravel Framework version from composer.json
        $laravelFrameworkVersion = $composerJson['require']['laravel/framework'] ?? 'N/A';
        $laravelFrameworkVersion = str_replace('^', '', $laravelFrameworkVersion);

        // Get Node version (if available via environment)
        $nodeVersion = $_ENV['NODE_VERSION'] ?? null;

        // Product version - from package.json or config
        $productVersion = $packageJson['version'] ?? config('app.version', '1.0.0');

        return [
            'product_name' => 'Spending Log',
            'product_version' => $productVersion,
            'description' => 'Sistema de gestión de gastos personales',
            'laravel_version' => $laravelVersion,
            'laravel_framework_version' => $laravelFrameworkVersion,
            'php_version' => $phpVersion,
            'react_version' => $reactVersion,
            'inertia_version' => $inertiaVersion,
            'node_version' => $nodeVersion,
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'license' => $composerJson['license'] ?? 'MIT',
        ];
    }
}
