import type { User } from "$lib/models/user"
import type { Quest } from "$lib/models/quest"
export type QuestService = {

    getActiveQuests(user: User): Promise<Quest[]>

    getAvailableQuests(user: User): Promise<Quest[]>

    completeQuest(user: User, questId: number,verificationHash: string): Promise<Quest>

    addQuestToActiveQuests(user: User,questId: number): Promise<Quest>

}