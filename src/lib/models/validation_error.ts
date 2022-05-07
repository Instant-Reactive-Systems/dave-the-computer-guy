
export enum ValidationErrorType {
    PinNotFound,
    PinTypeMismatch,
    ComponentNotFound,
}

export class ValidationError {
    type: ValidationErrorType;
    msg: string;
    tableRow: number;
    tableType: 'input' | 'output';

    constructor(type: ValidationErrorType, msg: string, tableRow: number, tableType: 'input' | 'output') {
        this.type = type;
        this.msg = msg;
        this.tableRow = tableRow;
        this.tableType = tableType;
    }

    toString(): string {
        let typeStr: string;
        switch (this.type) {
            case ValidationErrorType.PinNotFound: typeStr = 'Pin not found'; break;
            case ValidationErrorType.PinTypeMismatch: typeStr = 'Pin type mismatch'; break;
            case ValidationErrorType.ComponentNotFound: typeStr = 'Component not found'; break;
        }

        return `${typeStr}: ${this.msg}\nCheck your entry in ${this.tableType} table row '${this.tableRow}'.`;
    }
}

