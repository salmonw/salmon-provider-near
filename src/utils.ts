export default function notEmpty<T>(val: T | null): val is T { return val !== null; }
