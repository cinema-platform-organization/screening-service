import { Injectable } from "@nestjs/common";

import { ScreeningRepositoryPort } from "../../domain/ports/screening.repository.port";

@Injectable()
export class HasUpcomingScreeningsForHallUsecase {
	public constructor(private readonly repository: ScreeningRepositoryPort) {}

	public execute(hallId: string): Promise<boolean> {
		return this.repository.existsUpcomingByHall(hallId);
	}
}
