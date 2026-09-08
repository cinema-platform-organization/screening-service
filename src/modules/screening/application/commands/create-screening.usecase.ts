import { RpcStatus } from "@cinema-platform/common";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { nanoid } from "nanoid";

import { ScreeningEntity } from "../../domain/entities/screening.entity";
import { HallPort } from "../../domain/ports/hall.port";
import { ScreeningRepositoryPort } from "../../domain/ports/screening.repository.port";

@Injectable()
export class CreateScreeningUsecase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly hallPort: HallPort,
	) {}

	public async execute(input: {
		movieId: string;
		hallId: string;
		startAt: string | Date;
		endAt: string | Date;
	}) {
		const start = new Date(input.startAt);
		const end = new Date(input.endAt);

		if (!(start < end)) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: "endAt must be after startAt",
			});
		}

		const hall = await this.hallPort.findById(input.hallId);
		if (!hall) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Hall not found",
			});
		}

		const overlap = await this.repository.findOverlap(
			input.hallId,
			start,
			end,
		);
		if (overlap) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: "Overlaps with existing screening",
			});
		}

		const screening = new ScreeningEntity(
			nanoid(),
			input.hallId,
			input.movieId,
			start,
			end,
		);

		await this.repository.create(screening);

		return { ok: true };
	}
}
