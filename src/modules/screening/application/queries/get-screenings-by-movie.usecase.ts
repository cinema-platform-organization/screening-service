import { Injectable } from "@nestjs/common";

import { resolveDayRange } from "@/shared/utils/resolve-day-range";

import { Hall, HallPort } from "../../domain/ports/hall.port";
import { ScreeningRepositoryPort } from "../../domain/ports/screening.repository.port";
import { SeatPort } from "../../domain/ports/seat.port";
import { Theater, TheaterPort } from "../../domain/ports/theater.port";

@Injectable()
export class GetScreeningsByMovieUsecase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly theaterPort: TheaterPort,
		private readonly hallPort: HallPort,
		private readonly seatPort: SeatPort,
	) {}

	public async execute(input: { movieId: string; date?: string }) {
		const { start, end } = resolveDayRange(input.date);

		const screenings = await this.repository.findManyByMovie(
			input.movieId,
			start,
			end,
		);

		if (!screenings.length) {
			return [];
		}

		const theaterCache = new Map<string, Promise<Theater | null>>();
		const hallCache = new Map<string, Promise<Hall | null>>();

		const enriched = await Promise.all(
			screenings.map(async screening => {
				const hall = await this.getHallCached(
					screening.hallId,
					hallCache,
				);
				if (!hall) {
					return null;
				}

				const theater = await this.getTheaterCached(
					hall.theaterId,
					theaterCache,
				);
				if (!theater) {
					return null;
				}

				const seatTypes = await this.seatPort.listSeatTypes(
					screening.hallId,
					screening.id,
				);

				return {
					id: screening.id,
					startAt: screening.startAt,
					endAt: screening.endAt,
					hall,
					theater,
					seatTypes,
				};
			}),
		);

		return enriched.filter(Boolean);
	}

	private getTheaterCached(
		theaterId: string,
		cache: Map<string, Promise<Theater | null>>,
	): Promise<Theater | null> {
		let promise = cache.get(theaterId);

		if (!promise) {
			promise = this.theaterPort.findById(theaterId);

			cache.set(theaterId, promise);
		}

		return promise;
	}

	private getHallCached(
		hallId: string,
		cache: Map<string, Promise<Hall | null>>,
	): Promise<Hall | null> {
		let promise = cache.get(hallId);

		if (!promise) {
			promise = this.hallPort.findById(hallId);

			cache.set(hallId, promise);
		}

		return promise;
	}
}
