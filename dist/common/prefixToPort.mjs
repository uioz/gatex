export function prefixToPort(prefix, prefixBaseline = 0) {
    return (prefix
        .split("")
        .map((character) => character.charCodeAt(0))
        .reduce((prev, next) => prev + next) + prefixBaseline);
}
