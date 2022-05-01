import { jsonArrayMember, jsonMember, jsonObject, toJson } from "typedjson";

@toJson
@jsonObject
export class VerificationResult{
    @jsonMember(String)
    verificationHash: string

    @jsonArrayMember(Number)
    failedRequirementIds: number[]

    @jsonMember(String)
    status: 'failed' | 'passed'


    constructor(verificationHash: string,failedRequirements: number[], status: 'failed' | 'passed'){
        this.verificationHash  =verificationHash;
        this.failedRequirementIds = failedRequirements;
        this.status = status;
    }
}