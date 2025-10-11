<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Symfony\Component\HttpFoundation\Request;

class TrustProxies extends Middleware
{
    /**
     * Confiar en todos los proxies (Cloudflare incluido).
     * Si prefieres, reemplaza '*' por el listado de IPs de Cloudflare.
     */
    protected $proxies = '*';

    /**
     * Encabezados estándar reenviados por proxies (Cloudflare).
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO;
}
