export interface Theater {
	id: string;
	name: string;
	address: string;
}

export abstract class TheaterPort {
	public abstract findById(id: string): Promise<Theater | null>;
}
