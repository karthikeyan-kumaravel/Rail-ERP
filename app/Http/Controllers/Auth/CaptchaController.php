<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class CaptchaController extends Controller
{
    public function image(Request $request): Response
    {
        $length = 5;
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $text = '';

        for ($i = 0; $i < $length; $i++) {
            $text .= $chars[random_int(0, strlen($chars) - 1)];
        }

        $request->session()->put('login_captcha.answer', $text);

        $lines = '';
        for ($i = 0; $i < 6; $i++) {
            $lines .= sprintf(
                '<line x1="%d" y1="%d" x2="%d" y2="%d" />',
                random_int(0, 300),
                random_int(0, 80),
                random_int(0, 300),
                random_int(0, 80),
            );
        }

        $letters = '';
        foreach (str_split($text) as $index => $character) {
            $x = 28 + ($index * 52);
            $y = random_int(50, 62);
            $angle = random_int(-18, 18);
            $letters .= sprintf(
                '<text x="%d" y="%d" transform="rotate(%d %d %d)">%s</text>',
                $x,
                $y,
                $angle,
                $x,
                $y,
                $character,
            );
        }

        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80" viewBox="0 0 300 80" role="img" aria-label="Captcha challenge">
  <rect width="300" height="80" fill="#e4f6f6"/>
  <g stroke="#b8c4c4" stroke-width="1">{$lines}</g>
  <g fill="#023b87" font-family="Arial, sans-serif" font-size="36" font-weight="700">{$letters}</g>
</svg>
SVG;

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml; charset=UTF-8',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
