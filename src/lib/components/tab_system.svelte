<script lang="ts">
    import type { Tab } from "$lib/components/tab";

    export let tabs: Tab[];

    let activeTab = 0;
    
    function onTabClick(index: number) {
        activeTab = index;
        console.log(tabs[activeTab]);
    }
</script>

<nav class="shadow-sm border-b border-slate-200">
    <ul class="scroll-shadows-x">
        {#each tabs as tab, i}
        <li>
            <button on:click={() => onTabClick(i)} class:active={i == activeTab}>
                {tab.title}
            </button>
        </li>
        {/each}
    </ul>
</nav>
<div class="content">
    <svelte:component this={tabs[activeTab].innerComponent} />
</div>


<style>
    .active {
        --tab-active-color: theme(colors.blue.500);
        border-color: var(--tab-active-color);
    }

    nav > ul {
        --tab-nav-height: theme(height.8);
        height: var(--tab-nav-height);
        @apply inline-flex w-full min-w-full max-w-full overflow-x-auto;
    }

    nav > ul > li {
        @apply flex items-center w-max;
    }

    nav > ul > li > button {
        @apply px-2 h-full border-b-2 border-b-white;
    }

    nav > ul > li > button:hover {
        @apply opacity-75;
    }

    .content {
        --tab-nav-height: theme(height.8);
        --hgt: calc(theme(height.full) - var(--tab-nav-height) - 1px);
        height: var(--hgt);
        max-height: var(--hgt);
        min-height: var(--hgt);
    }
</style>

