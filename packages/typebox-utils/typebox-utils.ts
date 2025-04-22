import type {
    Static,
    TSchema,
    TString, 
} from "@sinclair/typebox"
import {
    Type,
} from "@sinclair/typebox"
import { type ValueError } from "@sinclair/typebox/errors"
import { Value } from "@sinclair/typebox/value"

const format_error = (error: ValueError) => {
    const {
        path,
        message, 
    } = error
    console.error(error)
    return `'${path}': ${message}`
}

class ValidationError extends Error {
    code = "schema_validation_error"
    message = ""

    constructor(errors: ValueError[]) {
        super(errors.map(format_error).join("\n"))
        this.code = "schema_validation_error"
        this.name = "ValidationError"
        this.message = errors.map(format_error).join("\n")
    }
}

export function parse_or_error<T extends TSchema>(schema: T, value: unknown): Static<T> {
    if (Value.Check(schema, value)) {
        return Value.Parse(schema, value)
    } else {
        throw new ValidationError([...Value.Errors(schema, value)])
    }
}

export const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()])

export const StringEnum = <T extends string[]>(values: [...T]) => Type.String({
    type: "string",
    enum: values,
}) as TString & {
    static: T[number]
}
