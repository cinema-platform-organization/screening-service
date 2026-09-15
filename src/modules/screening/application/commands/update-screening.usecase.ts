import { RpcStatus } from "@cinema-platform/common";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

import { HallPort } from "../../domain/ports/hall.port";
import { ScreeningRepositoryPort } from "../../domain/ports/screening.repository.port";
import { GetScreeningUsecase } from "../queries/get-screening.usecase";

@Injectable()
export class UpdateScreeningUsecase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly hallPort: HallPort,
		private readonly getScreeningUC: GetScreeningUsecase,
	) {}

	public async execute(
		id: string,
		data: {
			movieId?: string;
			hallId?: string;
			startAt?: string;
			endAt?: string;
		},
	) {
		const existing = await this.repository.findById(id);

		if (!existing) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Screening not found",
			});
		}

		const hallId = data.hallId ?? existing.hallId;
		const startAt = data.startAt
			? new Date(data.startAt)
			: existing.startAt;
		const endAt = data.endAt ? new Date(data.endAt) : existing.endAt;

		if (!(startAt < endAt)) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: "endAt must be after startAt",
			});
		}

		if (data.hallId && data.hallId !== existing.hallId) {
			const hall = await this.hallPort.findById(data.hallId);

			if (!hall) {
				throw new RpcException({
					code: RpcStatus.NOT_FOUND,
					details: "Hall not found",
				});
			}
		}

		const overlap = await this.repository.findOverlap(
			hallId,
			startAt,
			endAt,
			id,
		);

		if (overlap) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: "Overlaps with existing screening",
			});
		}

		const patch: Partial<{
			movieId: string;
			hallId: string;
			startAt: Date;
			endAt: Date;
		}> = {};
		if (data.movieId !== undefined) {
			patch.movieId = data.movieId;
		}
		if (data.hallId !== undefined) {
			patch.hallId = data.hallId;
		}
		if (data.startAt !== undefined) {
			patch.startAt = startAt;
		}
		if (data.endAt !== undefined) {
			patch.endAt = endAt;
		}

		const updated = await this.repository.update(id, patch);

		if (!updated) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Screening not found",
			});
		}

		const result = await this.getScreeningUC.execute(id);

		if (!result) {
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Screening updated but failed to load related data",
			});
		}

		return result;
	}
}
