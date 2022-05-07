import questSvelte from "$lib/icons/quest.svelte";
import type { Quest, QuestRequirement } from "$lib/models/quest";
import type { User } from "$lib/models/user";
import { copy } from "$lib/util/common";
import { BehaviorSubject } from "rxjs";
import type { QuestService } from "../quest_service";



const EXAMPLE_QUEST_REQUIREMENT: QuestRequirement = {
    description: "Time to reach steady state, circuit is stable",
    name: "Time To Steady State",
    value: 10
}

const QUEST_TEMPLATE: Quest = {
    id: 1,
    name: "First quest",
    reward: 100,
    description: "This is the first quest",
    requirements: [EXAMPLE_QUEST_REQUIREMENT],
    verificationData: null,
}

const ALL_QUESTS: Map<number, Quest> = new Map();

for (let i = 0; i < 20; i++) {
    const quest: Quest = copy(QUEST_TEMPLATE)
    quest.id = i;
    ALL_QUESTS.set(quest.id, quest);
}




export class MockQuestsService implements QuestService {
    private activeQuestIds: number[] = [];
    private completedQuestsIds: number[] = [];
    private availableQuestsBehaviourSubject: BehaviorSubject<Quest[]> = new BehaviorSubject<Quest[]>(Array.from(ALL_QUESTS.values()));

    init() {
    }

    dispose() {
    }

    async getActiveQuests(user: User): Promise<Quest[]> {
        let activeQuest = [];
        for (const id of this.activeQuestIds) {
            activeQuest.push(ALL_QUESTS.get(id))
        }
        return activeQuest;
    }

    async getAvailableQuests(user: User): Promise<Quest[]> {
        return this.availableQuestsBehaviourSubject.getValue();
    }

    async getCompletedQuests(user: User): Promise<Quest[]> {
        let completedQuests = [];
        for (const id of this.completedQuestsIds) {
            completedQuests.push(ALL_QUESTS.get(id))
        }
        return completedQuests;
    }

    async completeQuest(user: User, questId: number, verificationHash: string): Promise<Quest> {
        this.completedQuestsIds.push(questId)
        return ALL_QUESTS.get(questId);
    }

    async addQuestToActiveQuests(user: User, questId: number): Promise<Quest> {
        this.activeQuestIds.push(questId);
        const availableQuests = this.availableQuestsBehaviourSubject.getValue().filter((q) => q.id != questId);
        this.availableQuestsBehaviourSubject.next(availableQuests);
        return ALL_QUESTS.get(questId);
    }

    getAvailableQuestsBehaviourSubject(): BehaviorSubject<Quest[]> {
        return this.availableQuestsBehaviourSubject;
    }
}