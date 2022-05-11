import type { Quest } from "$lib/models/quest";
import type { User } from "$lib/models/user";
import { copy } from "$lib/util/common";
import { BehaviorSubject } from "rxjs";
import type {UserService } from "../auth_service";
import type { QuestService } from "../quest_service";

const AND_GATE_QUEST: Quest = {
    id: 1,
    name: "And gate quest",
    reward: 100,
    description: "This is the first quest, make an AND GATE from NAND gates",
    verificationData: {
        type: 'Combinational',
        restrictions: {
            maxComponents: 2,
            maxRuntime: 10,
            truthTable: {
                inputs: [[false, false], [false, true], [true, false], [true, true]],
                outputs: [[false], [false], [false], [true]]
            }
        }
    },
}

const NOT_GATE_QUEST: Quest = {
    id: 2,
    name: "Not gate quest",
    reward: 150,
    description: "This is the second quest, make an NOT GATE from NAND gates",
    verificationData: {
        type: 'Combinational',
        restrictions: {
            maxComponents: 1,
            maxRuntime: 4,
            truthTable: {
                inputs: [[false], [true]],
                outputs: [[true], [false]]
            }
        }
    }
}


const OR_GATE_QUEST: Quest = {
    id: 3,
    name: "Or gate quest",
    reward: 200,
    description: "This is the third quest, make an OR gate from NAND gates",
    verificationData: {
        type: "Combinational",
        restrictions: {
            maxComponents: 3,
            maxRuntime: 6,
            truthTable: {
                inputs: [[false, false], [false, true], [true, false], [true, true]],
                outputs: [[false], [true], [true], [true]]
            }
        }
    }
}

const XOR_GATE_QUEST: Quest = {
    id: 4,
    name: "XOR gate quest",
    reward: 250,
    description: "This is the fourth quest, make an XOR gate from NAND gates",
    verificationData: {
        type: "Combinational",
        restrictions: {
            maxComponents: 3,
            maxRuntime: 8,
            truthTable: {
                inputs: [[false, false], [false, true], [true, false], [true, true]],
                outputs: [[false], [true], [true], [false]]
            }
        }
    }
}


const NOR_GATE_QUEST: Quest = {
    id: 5,
    name: "NOR gate quest",
    reward: 300,
    description: "This is the fifth quest, make an NOR gate from NAND gates",
    verificationData: {
        type: "Combinational",
        restrictions: {
            maxComponents: 4,
            maxRuntime: 8,
            truthTable: {
                inputs: [[false, false], [false, true], [true, false], [true, true]],
                outputs: [[true], [false], [false], [true]]
            }
        }
    }
}

const ALL_QUESTS: Map<number, Quest> = new Map();
ALL_QUESTS.set(AND_GATE_QUEST.id, copy(AND_GATE_QUEST));
ALL_QUESTS.set(OR_GATE_QUEST.id, copy(OR_GATE_QUEST));
ALL_QUESTS.set(NOR_GATE_QUEST.id, copy(NOR_GATE_QUEST));
ALL_QUESTS.set(NOT_GATE_QUEST.id, copy(NOT_GATE_QUEST));
ALL_QUESTS.set(XOR_GATE_QUEST.id, copy(XOR_GATE_QUEST));




export class MockQuestsService implements QuestService {
    private activeQuestsBehaviourSubject: BehaviorSubject<Quest[]> = new BehaviorSubject<Quest[]>([]);
    private completedQuestsBehaviourSubject: BehaviorSubject<Quest[]> = new BehaviorSubject<Quest[]>([]);
    private availableQuestsBehaviourSubject: BehaviorSubject<Quest[]> = new BehaviorSubject<Quest[]>(Array.from(ALL_QUESTS.values()));
    private userService: UserService;

    init() {
    }

    dispose() {
    }

    constructor(userService: UserService){
        this.userService = userService;
    }

    async getActiveQuests(): Promise<Quest[]> {
        return this.activeQuestsBehaviourSubject.getValue();
    }

    async getAvailableQuests(): Promise<Quest[]> {
        return this.availableQuestsBehaviourSubject.getValue();
    }

    async getCompletedQuests(): Promise<Quest[]> {
        return this.completedQuestsBehaviourSubject.getValue();
    }

    async completeQuest(quest: Quest, verificationHash: string): Promise<Quest> {
        const completedQuests = this.completedQuestsBehaviourSubject.getValue()
        const activeQuests = this.activeQuestsBehaviourSubject.getValue().filter((q) => q.id != quest.id);
        completedQuests.push(quest);
        this.completedQuestsBehaviourSubject.next(completedQuests);
        this.activeQuestsBehaviourSubject.next(activeQuests);
        const user = copy(this.userService.getUserBehaviourSubject().getValue());
        user.balance += quest.reward;
        this.userService.getUserBehaviourSubject().next(user);
        return quest;
    }

    async addQuestToActiveQuests(quest: Quest): Promise<Quest> {
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