import { ScreeningEntity } from "../entities/screening.entity";

export abstract class ScreeningRepositoryPort {
	public abstract findById(id: string): Promise<ScreeningEntity | null>;
	public abstract findOverlap(
		hallId: string,
		startAt: Date,
		endAt: Date,
	): Promise<ScreeningEntity | null>;
	public abstract create(
		screening: ScreeningEntity,
	): Promise<ScreeningEntity>;
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
		dayStart?: Date,
		dayEnd?: Date,
		limit?: number,
		skip?: number,
	): Promise<ScreeningEntity[]>;
	public abstract countByMovie(
		movieId: string,
		dayStart?: Date,
		dayEnd?: Date,
	): Promise<number>;
}
