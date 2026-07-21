<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="app-base-path" content="{{ request()->getBaseUrl() }}">

        <script>
            (function () {
                try {
                    var stored = JSON.parse(localStorage.getItem('rail-erp-preferences') || 'null') || {};
                    var mode = ['light', 'dark', 'system'].indexOf(stored.theme) !== -1 ? stored.theme : 'system';
                    var resolved = mode === 'system'
                        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                        : mode;

                    var root = document.documentElement;
                    root.setAttribute('data-theme', resolved);
                    root.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
                    root.setAttribute('data-accent', stored.accent || 'orange');
                    root.setAttribute('data-bg-style', stored.backgroundStyle || 'solid');
                    root.setAttribute('data-gradient', stored.gradientPreset || 'orange');
                    root.setAttribute('data-font-size', stored.fontSize || 'medium');
                    root.setAttribute('data-radius', stored.borderRadius || 'medium');
                    root.setAttribute('data-animations', stored.animations === false ? 'off' : 'on');

                    if (stored.gradientPreset === 'custom' && stored.customGradient) {
                        root.style.setProperty('--gradient-from', stored.customGradient.from);
                        root.style.setProperty('--gradient-to', stored.customGradient.to);
                    }
                } catch (error) {}
            })();
        </script>

        <link rel="icon" href="{{ request()->getBaseUrl() }}/favicon.ico" sizes="any">
        <link rel="icon" href="{{ request()->getBaseUrl() }}/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="{{ request()->getBaseUrl() }}/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
