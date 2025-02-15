export function exhaustiveCheck(arg: never): never;
export function exhaustiveCheck(arg: unknown) {
	throw new Error(`Unhandled case: ${String(arg)}`);
}
