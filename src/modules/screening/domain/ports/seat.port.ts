export interface SeatType {
	type: string;
	price: number;
}

export abstract class SeatPort {
	public abstract listSeatTypes(
		hallId: string,
		screeningId: string,
	): Promise<SeatType[]>;
}
