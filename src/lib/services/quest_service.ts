import type { Quest } from "$lib/models/quest"
import type { BehaviorSubject } from "rxjs";
export type QuestService = {
    init();

    getActiveQuests(): Promise<Quest[]>;

    getAvailableQuests(): Promise<Quest[]>;

    getCompletedQuests(): Promise<Quest[]>;

    completeQuest(quest: Quest,verificationHash: string): Promise<Quest>;

    addQuestToActiveQuests(quest: Quest): Promise<Quest>;

    disbandQuest(quest: Quest): Promise<void>;

    getAvailableQuestsBehaviourSubject(): BehaviorSubject<Quest[]>;

    getActiveQuestsBehaviourSubject(): BehaviorSubject<Quest[]>;

    getCompletedQuestsBehaviourSubject(): BehaviorSubject<Quest[]>;
    
    dispose();


}
