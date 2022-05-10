import type { Quest } from "$lib/models/quest";
import type { User } from "$lib/models/user";
import { copy } from "$lib/util/common";
import { BehaviorSubject } from "rxjs";
import type { QuestService } from "../quest_service";

const AND_GATE_QUEST: Quest = {
    id: 1,
    name: "And gate quest",
    reward: 100,
    description: "This is the first quest, make an AND GATe",
    verificationData: {
        type: 'Combinational',
        restrictions: {
            maxComponents: 3,
            maxRuntime: 10,
            truthTable: {
                inputs: [[false, false], [false, true], [true, false], [true, true]],
                outputs: [[false], [false], [false], [true]]
            }
        }
    },
}

const ALL_QUESTS: Map<number, Quest> = new Map();
ALL_QUESTS.set(AND_GATE_QUEST.id, copy(AND_GATE_QUEST));




export class MockQuestsService implements QuestService {
    private activeQuestsBehaviourSubject: BehaviorSubject<Quest[]> = new BehaviorSubject<Quest[]>([]);
    private completedQuestsBehaviourSubject: BehaviorSubject<Quest[]> = new BehaviorSubject<Quest[]>([]);
    private availableQuestsBehaviourSubject: BehaviorSubject<Quest[]> = new BehaviorSubject<Quest[]>(Array.from(ALL_QUESTS.values()));

    init() {
    }

    dispose() {
    }

    async getActiveQuests(user: User): Promise<Quest[]> {
        return this.activeQuestsBehaviourSubject.getValue();
    }

    async getAvailableQuests(user: User): Promise<Quest[]> {
        return this.availableQuestsBehaviourSubject.getValue();
    }

    async getCompletedQuests(user: User): Promise<Quest[]> {
        return this.completedQuestsBehaviourSubject.getValue();
    }

    async completeQuest(user: User, quest: Quest, verificationHash: string): Promise<Quest> {
        const completedQuests = this.completedQuestsBehaviourSubject.getValue()
        completedQuests.push(quest);
        this.completedQuestsBehaviourSubject.next(completedQuests);
        return quest;
    }

    async addQuestToActiveQuests(user: User, quest: Quest): Promise<Quest> {
        const activeQuests = this.activeQuestsBehaviourSubject.getValue();
        activeQuests.push(quest);
        const availableQuests = this.availableQuestsBehaviourSubject.getValue().filter((q) => q.id != quest.id);
        this.availableQuestsBehaviourSubject.next(availableQuests);
        this.activeQuestsBehaviourSubject.next(activeQuests);
        return quest;
    }

    getAvailableQuestsBehaviourSubject(): BehaviorSubject<Quest[]> {
        return this.availableQuestsBehaviourSubject;
    }

    getActiveQuestsBehaviourSubject(): BehaviorSubject<Quest[]> {
        return this.activeQuestsBehaviourSubject;
    }

    getCompletedQuestsBehaviourSubject(): BehaviorSubject<Quest[]> {
        return this.completedQuestsBehaviourSubject;
    }
}