<script lang="ts">
    import { getContext, onDestroy, onMount } from 'svelte';
    import CoinIcon from '$lib/icons/coin.svelte';
    import ProfileIcon from '$lib/icons/profile.svelte';
    import AvailableQuestsIcon from '$lib/icons/available_quests.svelte';
    import ActiveQuestsIcon from '$lib/icons/active_quests.svelte';
    import { assert, todo } from '$lib/util/common';
    import type { QuestService } from "$lib/services/quest_service";
    import type { UserService } from "$lib/services/user_service";
	import { USER_SERVICE, QUEST_SERVICE } from '$lib/services/service';
    import type { Subscription } from 'rxjs';
    import type { User } from '$lib/models/user';

    // Services
    const userService: UserService = getContext(USER_SERVICE);
    const questService: QuestService = getContext(QUEST_SERVICE);

    // Variables
    let subs: Subscription[] = [];
    let user: User = null;
    let activeQuests: number = null;
    let availableQuests: number = null;

    // Logic
    function openProfile() {
        todo();
    }

    function buyCoins() {
        todo();
    }

    // Component lifetime
    onMount(() => {
        subs.push(
            userService.getUserBehaviourSubject().subscribe((user_) => {
                user = user_;
            }),
            questService.getActiveQuestsBehaviourSubject().subscribe((quests) => {
                activeQuests = quests.length;
            }),
            questService.getAvailableQuestsBehaviourSubject().subscribe((quests) => {
                availableQuests = quests.length;
            }),
        );
    });

    onDestroy(() => {
        subs.forEach((sub) => sub.unsubscribe());
    });
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
                <span>{user?.balance}</span>
            </button>
        </li>
        <li class="profile" title="Profile">
            <button on:click={openProfile}>
                <span><ProfileIcon color={'#CBD5E1'}/></span>
                <span>{user?.username}</span>
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

