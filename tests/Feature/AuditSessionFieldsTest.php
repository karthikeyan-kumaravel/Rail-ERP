<?php

use App\Models\User;
use App\Models\UserType;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

test('creating a user type auto-stamps unique_id, acc_year, created and updated', function () {
    Carbon::setTestNow('2026-07-08 10:00:00');

    $userType = UserType::factory()->create();

    expect(Str::isUuid($userType->getRawOriginal('unique_id')))->toBeTrue()
        ->and($userType->acc_year)->toBe('2026-2027')
        ->and($userType->created)->not->toBeNull()
        ->and($userType->updated)->not->toBeNull();

    Carbon::setTestNow();
});

test('creating a record while authenticated stamps the acting user session fields', function () {
    $actingUserType = UserType::factory()->create();
    $actor = User::factory()->create(['user_type_id' => $actingUserType->id]);

    $this->actingAs($actor);

    $userType = UserType::factory()->create();

    expect($userType->sess_user_id)->toBe($actor->id)
        ->and($userType->sess_user_type)->toBe($actingUserType->id);
});

test('updating a record re-stamps the acting user but keeps unique_id and acc_year immutable', function () {
    $firstActor = User::factory()->create();
    $this->actingAs($firstActor);
    $userType = UserType::factory()->create();

    $originalUniqueId = $userType->getRawOriginal('unique_id');
    $originalAccYear = $userType->acc_year;

    $secondActingType = UserType::factory()->create();
    $secondActor = User::factory()->create(['user_type_id' => $secondActingType->id]);
    $this->actingAs($secondActor);

    $userType->update(['name' => 'Renamed']);

    expect($userType->refresh()->getRawOriginal('unique_id'))->toBe($originalUniqueId)
        ->and($userType->acc_year)->toBe($originalAccYear)
        ->and($userType->sess_user_id)->toBe($secondActor->id)
        ->and($userType->sess_user_type)->toBe($secondActingType->id);
});

test('a user syncs user_type_unique_id from its assigned user type', function () {
    $userType = UserType::factory()->create();

    $user = User::factory()->create(['user_type_id' => $userType->id]);

    expect($user->unique_id)->not->toBeNull()
        ->and($user->user_type_unique_id)->toBe($userType->getRawOriginal('unique_id'));

    $otherType = UserType::factory()->create();
    $user->update(['user_type_id' => $otherType->id]);

    expect($user->refresh()->user_type_unique_id)->toBe($otherType->getRawOriginal('unique_id'));

    $user->update(['user_type_id' => null]);

    expect($user->user_type_unique_id)->toBeNull();
});
