<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\EventData;
use App\Data\EventInput;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::orderBy('date')->get();

        return response()->json([
            'data' => $events->map(fn (Event $event): EventData => EventData::fromModel($event)),
        ]);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $input = EventInput::fromValidated($request->validated());

        $event = Event::create([
            'name' => $input->name,
            'date' => $input->date,
        ]);

        return response()->json(['data' => EventData::fromModel($event->refresh())], 201);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json(['data' => EventData::fromModel($event)]);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $input = EventInput::fromValidated($request->validated());

        $event->update([
            'name' => $input->name,
            'date' => $input->date,
        ]);

        return response()->json(['data' => EventData::fromModel($event)]);
    }

    public function destroy(Event $event): Response
    {
        $event->delete();

        return response()->noContent();
    }

    public function register(Event $event): JsonResponse
    {
        $event->increment('registrations');
        $event->refresh();

        return response()->json(['data' => EventData::fromModel($event)]);
    }

    public function cancelRegistration(Event $event): JsonResponse
    {
        Event::where('id', $event->id)
            ->where('registrations', '>', 0)
            ->decrement('registrations');

        $event->refresh();

        return response()->json(['data' => EventData::fromModel($event)]);
    }
}
