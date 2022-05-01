import type { User } from "$lib/models/user"
import type { Quest } from "$lib/models/quest"
import type { BehaviorSubject } from "rxjs";
export type QuestService = {
    init();

    getActiveQuests(user: User): Promise<Quest[]>;

    getAvailableQuests(user: User): Promise<Quest[]>;

    getCompletedQuests(user: User): Promise<Quest[]>;

    completeQuest(user: User, questId: number,verificationHash: string): Promise<Quest>;

    addQuestToActiveQuests(user: User,questId: number): Promise<Quest>;

    getAvailableQuestsBehaviourSubject(): BehaviorSubject<Quest[]>;
    
    dispose();


}