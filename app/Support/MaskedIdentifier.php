<?php

namespace App\Support;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use JsonException;

class MaskedIdentifier
{
    public const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 365;

    public static function encode(string $value, ?int $ttlSeconds = null): string
    {
        $payload = [
            'value' => $value,
            'exp' => $ttlSeconds !== null ? time() + $ttlSeconds : null,
        ];

        $encrypted = Crypt::encryptString((string) json_encode($payload, JSON_THROW_ON_ERROR));

        return self::encodeBase64Url($encrypted);
    }

    public static function decode(string $value): ?string
    {
        try {
            $payload = json_decode(Crypt::decryptString(self::decodeBase64Url($value)), true, 512, JSON_THROW_ON_ERROR);
        } catch (DecryptException|JsonException) {
            return null;
        }

        if (! is_array($payload) || ! isset($payload['value']) || ! is_string($payload['value'])) {
            return null;
        }

        if (isset($payload['exp']) && is_int($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload['value'];
    }

    private static function encodeBase64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function decodeBase64Url(string $value): string
    {
        $padding = strlen($value) % 4;

        if ($padding > 0) {
            $value .= str_repeat('=', 4 - $padding);
        }

        return base64_decode(strtr($value, '-_', '+/'), true) ?: '';
    }
}
