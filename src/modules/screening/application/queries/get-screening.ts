import { RpcStatus } from "@cinema-platform/common";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

import { HallPort } from "../../domain/ports/hall.port";
import { MoviePort } from "../../domain/ports/movie.port";
import { ScreeningRepositoryPort } from "../../domain/ports/screening.repository.port";
import { SeatPort } from "../../domain/ports/seat.port";
import { TheaterPort } from "../../domain/ports/theater.port";

@Injectable()
export class GetScreeningUsecase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly theaterPort: TheaterPort,
		private readonly hallPort: HallPort,
		private readonly seatPort: SeatPort,
		private readonly moviePort: MoviePort,
	) {}

	public async execute(id: string) {
		const screening = await this.repository.findById(id);
		if (!screening)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Screening not found",
			});

		const [hall, movie] = await Promise.all([
			this.hallPort.findById(screening.hallId),
			this.moviePort.findById(screening.movieId),
		]);
		if (!hall || !movie) {
			return null;
		}

		const [theater, seatTypes] = await Promise.all([
			this.theaterPort.findById(hall.theaterId),
			this.seatPort.listSeatTypes(screening.hallId, screening.id),
		]);
		if (!theater) {
			return null;
		}

		return {
			id: screening.id,
			startAt: screening.startAt,
			endAt: screening.endAt,
			hall,
			theater,
			movie,
			seatTypes,
		};
	}
}
