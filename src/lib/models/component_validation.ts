export type VerificationType = "IncorrectOutputs" | "MaxComponentsExceeded" | "InvalidComponentInterface" | "EmptyTruthTable"


export type ComponentValidationError = {
    type: VerificationType,
    data: any,
}

export type ValidationReport = {
    errors: ComponentValidationError[],
    passed: boolean,
}

