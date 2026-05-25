<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Data\EventData;
use App\Models\Event;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class EventDataTest extends TestCase
{
    private function makeEvent(): Event
    {
        $event = new Event;
        $event->id = 1;
        $event->name = 'All-hands Meeting';
        $event->date = Carbon::parse('2026-06-15');
        $event->registrations = 42;
        $event->created_at = Carbon::parse('2026-05-23T09:00:00Z');
        $event->updated_at = Carbon::parse('2026-05-23T10:00:00Z');

        return $event;
    }

    public function test_from_model_maps_all_fields(): void
    {
        $data = EventData::fromModel($this->makeEvent());

        $this->assertSame(1, $data->id);
        $this->assertSame('All-hands Meeting', $data->name);
        $this->assertSame(42, $data->registrations);
    }

    public function test_json_serialises_date_as_yyyy_mm_dd(): void
    {
        $serialised = EventData::fromModel($this->makeEvent())->jsonSerialize();

        $this->assertSame('2026-06-15', $serialised['date']);
    }

    public function test_json_serialises_timestamps_as_iso_8601(): void
    {
        $serialised = EventData::fromModel($this->makeEvent())->jsonSerialize();

        // Matches 2026-05-23T09:00:00+00:00 or 2026-05-23T09:00:00Z etc.
        $pattern = '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/';
        $this->assertMatchesRegularExpression($pattern, (string) $serialised['created_at']);
        $this->assertMatchesRegularExpression($pattern, (string) $serialised['updated_at']);
    }

    public function test_json_serialise_contains_all_spec_keys(): void
    {
        $serialised = EventData::fromModel($this->makeEvent())->jsonSerialize();

        $this->assertArrayHasKey('id', $serialised);
        $this->assertArrayHasKey('name', $serialised);
        $this->assertArrayHasKey('date', $serialised);
        $this->assertArrayHasKey('registrations', $serialised);
        $this->assertArrayHasKey('created_at', $serialised);
        $this->assertArrayHasKey('updated_at', $serialised);
    }
}
