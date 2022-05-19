<script lang="ts">
    import { goto } from "$app/navigation";
    import { Router } from "$lib/router";

    function switchRoom(route: string) {
        goto(route);
    }
</script>

<nav class="navigation-main">
    <header>
        <h1>Rooms</h1>
    </header>
    <main>
        <ul class="room-list">
            <li>
                <button on:click={() => switchRoom(Router.HOME_ROUTE)}>
                    <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M21.66,10.25l-9-8a1,1,0,0,0-1.32,0l-9,8a1,1,0,0,0-.27,1.11A1,1,0,0,0,3,12H4v9a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V12h1a1,1,0,0,0,.93-.64A1,1,0,0,0,21.66,10.25ZM13,20H11V17a1,1,0,0,1,2,0Zm5,0H15V17a3,3,0,0,0-6,0v3H6V12H18ZM5.63,10,12,4.34,18.37,10Z"/>
                        </svg>
                    </div>
                    <h2>Home</h2>
                </button>
            </li>
            <li>
                <button on:click={() => switchRoom(Router.OFFICE_ROUTE)}>
                    <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M19,6H16V5a2,2,0,0,0-2-2H10A2,2,0,0,0,8,5V6H5A3,3,0,0,0,2,9v9a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V9A3,3,0,0,0,19,6ZM10,5h4V6H10ZM20,18a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V12.39L8.68,14A1.19,1.19,0,0,0,9,14h6a1.19,1.19,0,0,0,.32-.05L20,12.39Zm0-7.72L14.84,12H9.16L4,10.28V9A1,1,0,0,1,5,8H19a1,1,0,0,1,1,1Z"/>
                        </svg>
                    </div>
                    <h2>Office</h2>
                </button>
            </li>
            <li>
                <button on:click={() => switchRoom(Router.SHOP_ROUTE)} disabled title="Not available in demo">
                    <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M21.08 7a2 2 0 0 0-1.7-1H6.58L6 3.74A1 1 0 0 0 5 3H3a1 1 0 0 0 0 2h1.24L7 15.26A1 1 0 0 0 8 16h9a1 1 0 0 0 .89-.55l3.28-6.56A2 2 0 0 0 21.08 7zm-4.7 7H8.76L7.13 8h12.25z"/>
                            <circle cx="7.5" cy="19.5" r="1.5"/>
                            <circle cx="17.5" cy="19.5" r="1.5"/>
                        </svg>
                    </div>
                    <h2>Shop</h2>
                </button>
            </li>
        </ul>
    </main>
</nav>

<style>
    .navigation-main > header {
        @apply text-2xl font-bold pb-2 mb-4 border-b border-slate-300;
    }
    
    h2 {
        @apply text-lg font-bold;
    }

    .room-list {
        @apply px-8 py-4 w-full inline-flex space-x-4;
    }

    .room-list > li {
        @apply flex-1 flex flex-col;
    }

    .room-list > li > button {
        @apply p-4 py-2 rounded-lg border border-slate-300 aspect-square hover:border-blue-400 hover:shadow-md transition-shadow duration-100;
    }
    
    .room-list > li > button svg {
        @apply w-[75%] h-[100%];
    }

    .room-list > li > button > h2 {
        @apply py-2 text-center select-none;
    }

    .room-list > li > button:hover svg {
        @apply fill-blue-500;
    }

    .room-list > li > button:hover > h2 {
        @apply text-blue-500;
    }

    .icon {
        @apply flex justify-center;
    }

    button:disabled {
        @apply cursor-not-allowed;
    }
</style>

