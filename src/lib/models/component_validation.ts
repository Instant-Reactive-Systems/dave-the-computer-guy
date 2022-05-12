export type VerificationType = "incorrectOutputs" | "maxComponentsExceeded" | "invalidComponentInterface";


export type ComponentValidationError = {
    type: VerificationType,
    data: any,
}

export type ValidationReport = {
    errors: ComponentValidationError[],
    passed: boolean,
}

