<?php

declare(strict_types=1);

use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

Route::apiResource('events', EventController::class)->except(['update']);
Route::put('events/{event}', [EventController::class, 'update']);

Route::middleware('throttle:30,1')->group(function () {
    Route::post('events/{event}/register', [EventController::class, 'register']);
    Route::delete('events/{event}/register', [EventController::class, 'cancelRegistration']);
});
