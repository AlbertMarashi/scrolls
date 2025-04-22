
export default async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms))
}

export class PromiseQueue {
    public queue: Promise<void> = Promise.resolve()

    /**
     * Adds a task to the promise queue
     * @param task A function that returns a promise
     * @returns A promise that resolves with the task result or rejects with the task error
     */
    public enqueue<T>(task: () => Promise<T>): Promise<T> {
        // Create a new promise that will resolve/reject based on the task's outcome
        const taskPromise = new Promise<T>((resolve, reject) => {
            this.queue = this.queue
                .then(() => task())
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    // Continue the queue regardless of success/failure
                    return Promise.resolve()
                })
        })

        return taskPromise
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupBy<T>(values: T[], keyFinder: ((value: T) => any) | keyof T): Record<string, T[]> {
    return values.reduce((a: Record<string, T[]>, b: T) => {
        const key = typeof keyFinder === "function" ? keyFinder(b) : b[keyFinder]

        if (!a[key]) {
            a[key] = [b]
        } else {
            a[key] = [...a[key], b]
        }

        return a
    }, {})
}

export function groupContiguous<T, K>(array: T[], keyFinder: (item: T) => K): T[][] {
    if (array.length === 0) {
        return []
    }

    const result: T[][] = []
    let currentGroup: T[] = [array[0]]
    let lastKey = keyFinder(array[0])

    for (let i = 1; i < array.length; i++) {
        const currentKey = keyFinder(array[i])

        if (currentKey === lastKey) {
            currentGroup.push(array[i])
        } else {
            result.push(currentGroup)
            currentGroup = [array[i]]
            lastKey = currentKey
        }
    }

    // Don't forget to add the last group
    result.push(currentGroup)

    return result
}

export function get_value_at_path(obj: unknown, path: string): unknown {
    if (path === "/") return obj

    // Split the path into keys using slash notation
    const keys: Array<string | number> = path.split("/").slice(1)

    // Traverse the object/array using the keys
    let result: unknown = obj
    for (let key of keys) {
        if (result !== null && typeof result === "object") {
            // If the current key is a number, convert it to an integer
            const index = parseInt(String(key), 10)
            if (!isNaN(index) && Array.isArray(result)) {
                key = index
            }
            // Move to the next nested object/array
            result = (result as Record<string, unknown>)[key]
        } else {
            return undefined
        }
    }

    return result
}

export function replace_value_at_path(obj: unknown, path: string, value: unknown): unknown {
    // Split the path into keys using slash notation
    const keys: Array<string | number> = path.split("/").slice(1)

    // Traverse the object/array using the keys, except for the last key
    let result: unknown = obj
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (result !== null && typeof result === "object") {
            // If the current key is a number, convert it to an integer
            const index = parseInt(String(key), 10)
            if (!isNaN(index) && Array.isArray(result)) {
                result = (result as Array<unknown>)[index]
            } else {
                result = (result as Record<string, unknown>)[key]
            }
        } else {
            return undefined // Path is invalid
        }
    }

    // Handle the last key
    const lastKey = keys[keys.length - 1]
    if (result !== null && typeof result === "object") {
        const index = parseInt(String(lastKey), 10)
        let oldValue: unknown
        if (!isNaN(index) && Array.isArray(result)) {
            oldValue = (result as Array<unknown>)[index];
            (result as Array<unknown>)[index] = value
        } else {
            oldValue = (result as Record<string, unknown>)[lastKey];
            (result as Record<string, unknown>)[lastKey] = value
        }
        return oldValue // Return the old value
    } else {
        return undefined // Path is invalid
    }
}

export type StatusPromise<T> = Promise<T> & {
    status: "pending" | "fulfilled" | "rejected";
    value: T | null;
    error: Error | null;
}

export function status_promise<T>(promise: Promise<T>): StatusPromise<T> {
    // Create a status object
    const status = promise as StatusPromise<T>

    status.status = "pending"
    status.value = null
    status.error = null
  
    // Create a new promise
    status
        .then(value => {
            status.status = "fulfilled"
            status.value = value
            return value
        })
        .catch(error => {
            status.status = "rejected"
            status.error = error instanceof Error ? error : new Error(String(error))
            throw error // Re-throw to maintain the original promise behavior
        })
  
    // Return the enhanced promise
    return status as StatusPromise<T>
}

/**
 * Creates a generator function that produces a sequence of pseudo-random numbers
 * based on the provided seed
 * @param initialSeed The initial seed value to use
 * @returns A generator function that yields pseudo-random numbers between 0 and 1
 */
export function* random_generator(seed: number): Generator<number> {
    while (true) {
        const x = Math.sin(seed++) * 10000
        yield x - Math.floor(x)
    }
}

type EventMap = {
    // args need to be any because the parameters can be different for each event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: (...args: any[]) => void
}

export class TypedEventEmitter<T extends EventMap> {
    private listeners: {
        [K in keyof T]?: T[K][]
    } = {}

    on<K extends keyof T>(event: K, listener: T[K]) {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        this.listeners[event]?.push(listener)
    }

    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>) {
        this.listeners[event]?.forEach(listener => listener(...args))
    }
}

export const log_ret = {
    info<T>(msg: string, value: T) {
        console.info(msg, value)
        return value
    },
    warn<T>(msg: string, value: T) {
        console.warn(msg, value)
        return value
    },
    error<T>(msg: string, value: T) {
        console.error(msg, value)
        return value
    },
}

export class GenericAsyncPeekableIterator<T> {
    private generator: AsyncGenerator<T>
    private peeked: T | null = null
    in_escape = false

    constructor(generator: AsyncGenerator<T>) {
        this.generator = generator
    }

    async next(): Promise<T | null> {
        if (this.peeked) {
            const value = this.peeked
            this.peeked = null
            return value
        }

        const result = await this.generator.next()
        if (result.done) return null

        return result.value
    }

    async peek(): Promise<T | null> {
        if (this.peeked) return this.peeked
        const result = await this.generator.next()
        if (result.done) return null
        this.peeked = result.value
        return this.peeked
    }
}
