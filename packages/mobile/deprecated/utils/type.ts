
/*
 * Type identification function
 * @param {any} perm - The input to be checked
 * @param {string} type - The expected type
 * @param {string} error - Error message to be returned if the input type does not match
 * @returns {any} The input if type matches, or error message if not
 */
export const typeIdenf = <T>(perm: unknown, type: string, error: T): T => {
    return typeof perm === type ? perm as T : error;
}

/*
 * Type checking function
 * @param {any} perm - The input to be checked
 * @returns {string} The type of the input
 */
export const typeCheck = (perm: any) => {
    return typeof perm;
};