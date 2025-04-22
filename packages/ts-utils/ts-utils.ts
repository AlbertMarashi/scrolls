export type DeepPartial<T> =
    T extends number | string | boolean | null ? T :
        T extends unknown[] ? Array<DeepPartial<T[number]>> :
            T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } :
                T

// A helper type to extract keys with non-undefined values
export type NonNullableKeys<T> = {
    [K in keyof T]-?: T[K] extends undefined ? never : K
}[keyof T]

export type FilterKeysByValueType<ValueType, T> = {
    [K in keyof T]: T[K] extends ValueType ? K : never
}[keyof T]

export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

export type PrimitiveToString<T extends null | undefined | boolean | number | bigint | string> = `${T}`

export type Override<T, NewProps> = Omit<T, keyof NewProps> & NewProps

export type MaybePromise<T> = T | Promise<T>

/// Path overriding

/// Splits a string into an array of strings at the given delimiter
type Split<S extends string, D extends string> =
    string extends S ? string[] :
        S extends "" ? [] :
            S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S]

/// Replaces the value at the given path with the given value
type DeepReplace<T, Path extends string[], V> = Path extends [infer First, ...infer Rest]
    ? Rest["length"] extends 0 // is the path empty?
        ? T extends (infer _U)[] // is the type an array?
            // yes, the type is an array, so replace U with V
            ? V[]
            // nope, it's an object, so replace First with V
            : {
                [K in keyof T]: K extends First ? V : T[K]
            }
        // there is more to the path
        : T extends (infer U)[] // is the type an array?
        // yes, the type is an array, so replace U with DeepReplace<U, Rest, V>
            ? DeepReplace<U, Rest extends string[] ? Rest : [], V>[]
            : {
            // nope, it's an object, so replace First with DeepReplace<T[First], Rest, V>
                [K in keyof T]: K extends First ? DeepReplace<T[K], Rest extends string[] ? Rest : [], V> : T[K]
            }
    : never

/// Replaces the value at the given path with the given value
export type ReplacePath<T, Path extends string, V> = DeepReplace<T, Split<Path, ".">, V>

/// Replaces a map of paths with the given value for that path
export type ReplacePaths<T, P extends Record<string, unknown>> = {
    [K in keyof P]: K extends keyof P
        ? ReplacePaths<ReplacePath<T, K & string, P[K]>, Omit<P, K>>
        : never
}[keyof P] extends infer R
    ? [R] extends [never]
        ? T
        : R
    : never

export type Coordinate2D = {
    x: number,
    y: number
}
