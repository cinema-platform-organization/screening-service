import { ScreeningEntity } from "../entities/screening.entity";

export abstract class ScreeningRepositoryPort {
	public abstract findOverlap(
		hallId: string,
		startAt: Date,
		endAt: Date,
		excludeId?: string,
	): Promise<ScreeningEntity | null>;
	public abstract create(entity: ScreeningEntity): Promise<ScreeningEntity>;
	public abstract findById(id: string): Promise<ScreeningEntity | null>;
	public abstract findByDateRange(
		dayStart?: Date,
		dayEnd?: Date,
		hallIds?: string[],
		limit?: number,
		skip?: number,
	): Promise<ScreeningEntity[]>;
	public abstract countByDateRange(
		dayStart?: Date,
		dayEnd?: Date,
		hallIds?: string[],
	): Promise<number>;
	public abstract findManyByMovie(
		movieId: string,
		dateStart?: Date,
		dateEnd?: Date,
		limit?: number,
		skip?: number,
	): Promise<ScreeningEntity[]>;
	public abstract countByMovie(
		movieId: string,
		dateStart?: Date,
		dateEnd?: Date,
	): Promise<number>;
	public abstract existsUpcomingByHall(hallId: string): Promise<boolean>;
	public abstract existsUpcomingByHalls(hallIds: string[]): Promise<boolean>;
	public abstract update(
		id: string,
		data: Partial<{
			movieId: string;
			hallId: string;
			startAt: Date;
			endAt: Date;
		}>,
	): Promise<ScreeningEntity | null>;
	public abstract delete(id: string): Promise<void>;
}
