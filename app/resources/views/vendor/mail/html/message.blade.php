<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header>
<img src="{{ 'data:image/svg+xml;base64,'.base64_encode(file_get_contents(storage_path('app/public/img/logos/chiorino-logo.svg'))) }}" style="width:200px;">
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{{ $slot }}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{{ $subcopy }}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
© {{ date('Y') }} {{ config('app.name') }}. @lang('All rights reserved.')
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
