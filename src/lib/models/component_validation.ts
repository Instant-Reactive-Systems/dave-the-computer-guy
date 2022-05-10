export type VerificationKind = "incorrect-outputs" | "max-components-execeeded" | "invalid-component-inputs" | "empty-truth-table"


export type ComponentValidationError = {
    kind: VerificationKind,
    data: any
}

export type ValidationReport = {
    errors: ComponentValidationError[]
}