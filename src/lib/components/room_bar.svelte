<script lang="ts">
    import CoinIcon from '$lib/icons/coin.svelte';
    import ProfileIcon from '$lib/icons/profile.svelte';
    import AvailableQuestsIcon from '$lib/icons/available_quests.svelte';
    import ActiveQuestsIcon from '$lib/icons/active_quests.svelte';
    import { assert, todo } from '$lib/util/common';

    // Variables
    let coins = 420;
    let username = 'mscofield0';
    let availableQuests = 11;
    let activeQuests = 2;

    // Logic
    function openProfile() {
        todo();
    }

    function buyCoins() {
        todo();
    }
</script>

<nav class="room-bar">
    <ul class="user-info">
        <li class="available-quests" title="Available quests">
            <span><AvailableQuestsIcon/></span>
            <span>{availableQuests}</span>
        </li>
        <li class="active-quests" title="Active quests">
            <span><ActiveQuestsIcon/></span>
            <span>{activeQuests}</span>
        </li>
        <li class="coin-info" title="Money">
            <button on:click={buyCoins}>
                <span><CoinIcon color={'#FBBF24'}/></span>
                <span>{coins}</span>
            </button>
        </li>
        <li class="profile" title="Profile">
            <button on:click={openProfile}>
                <span><ProfileIcon color={'#CBD5E1'}/></span>
                <span>{username}</span>
            </button>
        </li>
    </ul>
</nav>

<style>
    .room-bar {
        @apply h-10 shadow-md;
    }

    .room-bar > ul {
        @apply flex flex-row;
    }

    .user-info {
        @apply mr-4 justify-end space-x-2;
    }

    .available-quests {
        @apply p-2 inline-flex space-x-1;
    }

    .active-quests {
        @apply p-2 inline-flex space-x-1;
    }

    .coin-info > button {
        @apply p-2 inline-flex space-x-1;
    }

    .profile {
        @apply w-32 text-center hover:bg-blue-400 hover:text-white;
    }

    .profile > button {
        @apply p-2 inline-flex space-x-2;
    }
</style>

