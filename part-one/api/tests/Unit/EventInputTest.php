<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Data\EventInput;
use Tests\TestCase;

class EventInputTest extends TestCase
{
    public function test_from_validated_constructs_with_correct_types(): void
    {
        $input = EventInput::fromValidated(['name' => 'Team Lunch', 'date' => '2026-06-20']);

        $this->assertSame('Team Lunch', $input->name);
        $this->assertSame('2026-06-20', $input->date->toDateString());
    }

    public function test_from_validated_throws_when_name_is_not_a_string(): void
    {
        $this->expectException(\UnexpectedValueException::class);

        EventInput::fromValidated(['name' => 123, 'date' => '2026-06-20']);
    }

    public function test_from_validated_throws_when_date_is_not_a_string(): void
    {
        $this->expectException(\UnexpectedValueException::class);

        EventInput::fromValidated(['name' => 'Test', 'date' => false]);
    }
}
