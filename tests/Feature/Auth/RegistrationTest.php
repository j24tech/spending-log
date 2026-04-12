<?php

use Illuminate\Support\Facades\Route;

test('el registro tradicional está deshabilitado (solo acceso invitado vía Google)', function () {
    expect(Route::has('register'))->toBeFalse();
    expect(Route::has('register.store'))->toBeFalse();
});
