export type VerificationResult = {
    verificationHash: string;
    failedRequirementIds: number[];
    status: 'failed' | 'passed';
}
