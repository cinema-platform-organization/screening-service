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
	): Promise<ScreeningEntity[]>;
	public abstract findManyByMovie(
		movieId: string,
		dayStart?: Date,
		dayEnd?: Date,
	): Promise<ScreeningEntity[]>;
}
