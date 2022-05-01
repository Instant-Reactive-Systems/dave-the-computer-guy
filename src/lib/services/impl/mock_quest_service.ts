import { Quest, QuestRequirement } from "$lib/models/quest";
import type { User } from "$lib/models/user";
import { BehaviorSubject } from "rxjs";
import { destroy_component } from "svelte/internal";
import type { QuestService } from "../quest_service";



const QUEST_1: Quest = new Quest();
const QUEST_1_TIME_STEADY_STATE: QuestRequirement = new QuestRequirement();
QUEST_1_TIME_STEADY_STATE.description = "Time to reach steady state, circuit is stable"
QUEST_1_TIME_STEADY_STATE.id = 1;
QUEST_1_TIME_STEADY_STATE.name = "Time To Steady State"
QUEST_1_TIME_STEADY_STATE.value = 10
QUEST_1.id = 1;
QUEST_1.description = "This is the first quest";
QUEST_1.requirements = [QUEST_1_TIME_STEADY_STATE];
QUEST_1.verificationData = null;
const ALL_QUESTS: Map<number, Quest> = new Map();
ALL_QUESTS.set(1, QUEST_1);




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
        return Array.from(ALL_QUESTS.values())
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
        return ALL_QUESTS.get(questId);
    }
    getAvailableQuestsBehaviourSubject(): BehaviorSubject<Quest[]> {
        return this.availableQuestsBehaviourSubject;

    }
}