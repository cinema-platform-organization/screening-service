export abstract class BookingPort {
	public abstract existsForScreening(screeningId: string): Promise<boolean>;
}
