export function formatScreeningDate(date: Date): string {
	return date.toISOString().replace("T", " ").replace("Z", "");
}
