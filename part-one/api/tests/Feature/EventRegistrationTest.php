<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_increments_count_by_one(): void
    {
        $event = Event::factory()->withRegistrations(4)->create();

        $this->postJson("/api/events/{$event->id}/register")
            ->assertOk()
            ->assertJsonPath('data.registrations', 5);

        $this->assertDatabaseHas('events', ['id' => $event->id, 'registrations' => 5]);
    }

    public function test_register_returns_full_event_resource(): void
    {
        $event = Event::factory()->create();

        $this->postJson("/api/events/{$event->id}/register")
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'date', 'registrations', 'created_at', 'updated_at']]);
    }

    public function test_register_returns_404_for_missing_event(): void
    {
        $this->postJson('/api/events/999/register')->assertNotFound();
    }

    public function test_cancel_decrements_count_by_one(): void
    {
        $event = Event::factory()->withRegistrations(5)->create();

        $this->deleteJson("/api/events/{$event->id}/register")
            ->assertOk()
            ->assertJsonPath('data.registrations', 4);

        $this->assertDatabaseHas('events', ['id' => $event->id, 'registrations' => 4]);
    }

    public function test_cancel_does_not_decrement_below_zero(): void
    {
        $event = Event::factory()->withRegistrations(0)->create();

        $this->deleteJson("/api/events/{$event->id}/register")
            ->assertOk()
            ->assertJsonPath('data.registrations', 0);

        $this->assertDatabaseHas('events', ['id' => $event->id, 'registrations' => 0]);
    }

    public function test_cancel_returns_full_event_resource(): void
    {
        $event = Event::factory()->withRegistrations(1)->create();

        $this->deleteJson("/api/events/{$event->id}/register")
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'date', 'registrations', 'created_at', 'updated_at']]);
    }

    public function test_cancel_returns_404_for_missing_event(): void
    {
        $this->deleteJson('/api/events/999/register')->assertNotFound();
    }
}
