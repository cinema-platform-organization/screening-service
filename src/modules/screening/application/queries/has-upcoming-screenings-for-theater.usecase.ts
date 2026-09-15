import { Injectable } from "@nestjs/common";

import { HallPort } from "../../domain/ports/hall.port";
import { ScreeningRepositoryPort } from "../../domain/ports/screening.repository.port";

@Injectable()
export class HasUpcomingScreeningsForTheaterUsecase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly hallPort: HallPort,
	) {}

	public async execute(theaterId: string): Promise<boolean> {
		const halls = await this.hallPort.listByTheater(theaterId);

		if (halls.length === 0) {
			return false;
		}

		return this.repository.existsUpcomingByHalls(
			halls.map(hall => hall.id),
		);
	}
}
