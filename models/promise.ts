
export interface ModelPromise<T> {
    then(func : (doc : T[]) => void) : ModelPromise<T>
}