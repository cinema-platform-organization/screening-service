import { ScreeningEntity } from "../../domain/entities/screening.entity";

interface RawScreening {
	_id: { toString(): string };
	hallId: string;
	movieId: string;
	startAt: Date;
	endAt: Date;
}

export class ScreeningMapper {
	public static toEntity(raw: RawScreening): ScreeningEntity {
		return new ScreeningEntity(
			raw._id.toString(),
			raw.hallId,
			raw.movieId,
			raw.startAt,
			raw.endAt,
		);
	}

	public static toPersistence(entity: ScreeningEntity) {
		return {
			_id: entity.id,
			hallId: entity.hallId,
			movieId: entity.movieId,
			startAt: entity.startAt,
			endAt: entity.endAt,
		};
	}
}
