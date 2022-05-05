<script lang="ts">
    import type { ValidationError } from '$lib/models/validation_error';

    export let errors: ValidationError[];
</script>

<header>
    <h1>Export validation error occured</h1>
</header>
<ul class="error-list scroll-shadows-y">
    {#each errors as error, i}
    <li>
        <span class="line-number">{i}.</span>
        <span class="error-str">{error.toString()}</span>
    </li>
    {/each}
</ul>

<style>
    header {
        @apply text-lg font-bold pb-2 mb-4 border-b border-slate-300;
    }

    .error-list {
        @apply max-h-48 overflow-y-auto;
    }

    .error-list > span {
        @apply text-lg w-full;
    }

    .error-list > li {
        @apply p-2 border-x border-x-slate-300;
    }

    .error-list > li:not(:last-child) {
        @apply border-b border-b-slate-200;
    }

    .error-list > li:last-child {
        @apply rounded-b-lg border-b border-b-slate-300;
    }
</style>

