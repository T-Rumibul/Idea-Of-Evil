/**
 * @param time - time in seconds
 */
export const sleep = (time: number) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time * 1000)
    })
}