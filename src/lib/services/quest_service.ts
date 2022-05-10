import type { User } from "$lib/models/user"
import type { Quest } from "$lib/models/quest"
import type { BehaviorSubject } from "rxjs";
export type QuestService = {
    init();

    getActiveQuests(user: User): Promise<Quest[]>;

    getAvailableQuests(user: User): Promise<Quest[]>;

    getCompletedQuests(user: User): Promise<Quest[]>;

    completeQuest(user: User, quest: Quest,verificationHash: string): Promise<Quest>;

    addQuestToActiveQuests(user: User,quest: Quest): Promise<Quest>;

    getAvailableQuestsBehaviourSubject(): BehaviorSubject<Quest[]>;

    getActiveQuestsBehaviourSubject(): BehaviorSubject<Quest[]>;

    getCompletedQuestsBehaviourSubject(): BehaviorSubject<Quest[]>;
    
    dispose();


}