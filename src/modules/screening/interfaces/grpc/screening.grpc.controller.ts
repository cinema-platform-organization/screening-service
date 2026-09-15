import { RpcStatus } from "@cinema-platform/common";
import type {
	CreateScreeningRequest,
	DeleteScreeningRequest,
	DeleteScreeningResponse,
	GetScreeningRequest,
	GetScreeningsByMovieRequest,
	GetScreeningsRequest,
	HasUpcomingScreeningsForHallRequest,
	HasUpcomingScreeningsForTheaterRequest,
	HasUpcomingScreeningsResponse,
	UpdateScreeningRequest,
	UpdateScreeningResponse,
} from "@cinema-platform/contracts/gen/ts/screening";
import { Controller } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";

import { CreateScreeningUsecase } from "../../application/commands/create-screening.usecase";
import { DeleteScreeningUsecase } from "../../application/commands/delete-screening.usecase";
import { UpdateScreeningUsecase } from "../../application/commands/update-screening.usecase";
import { GetScreeningUsecase } from "../../application/queries/get-screening.usecase";
import { GetScreeningsByMovieUsecase } from "../../application/queries/get-screenings-by-movie.usecase";
import { GetScreeningsUsecase } from "../../application/queries/get-screenings.usecase";
import { HasUpcomingScreeningsForHallUsecase } from "../../application/queries/has-upcoming-screenings-for-hall.usecase";
import { HasUpcomingScreeningsForTheaterUsecase } from "../../application/queries/has-upcoming-screenings-for-theater.usecase";

@Controller()
export class ScreeningGrpcController {
	public constructor(
		private readonly createUC: CreateScreeningUsecase,
		private readonly getUC: GetScreeningUsecase,
		private readonly listUc: GetScreeningsUsecase,
		private readonly getByMovieUC: GetScreeningsByMovieUsecase,
		private readonly hasForHallUC: HasUpcomingScreeningsForHallUsecase,
		private readonly hasForTheaterUC: HasUpcomingScreeningsForTheaterUsecase,
		private readonly updateUC: UpdateScreeningUsecase,
		private readonly deleteUC: DeleteScreeningUsecase,
	) {}

	@GrpcMethod("ScreeningService", "CreateScreening")
	public async create(data: CreateScreeningRequest) {
		return await this.createUC.execute(data);
	}

	@GrpcMethod("ScreeningService", "GetScreening")
	public async getById(data: GetScreeningRequest) {
		const screening = await this.getUC.execute(data.id);

		if (!screening) {
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Screening exists but failed to load related data",
			});
		}

		return { screening };
	}

	@GrpcMethod("ScreeningService", "GetScreenings")
	public async getAll(data: GetScreeningsRequest) {
		const result = await this.listUc.execute(data);

		return {
			screenings: result.data,
			total: result.total,
		};
	}

	@GrpcMethod("ScreeningService", "GetScreeningsByMovie")
	public async getByMovie(data: GetScreeningsByMovieRequest) {
		const result = await this.getByMovieUC.execute(data);

		return {
			screenings: result.data,
			total: result.total,
		};
	}

	@GrpcMethod("ScreeningService", "HasUpcomingScreeningsForHall")
	public async hasForHall(
		data: HasUpcomingScreeningsForHallRequest,
	): Promise<HasUpcomingScreeningsResponse> {
		const hasScreenings = await this.hasForHallUC.execute(data.hallId);

		return { hasScreenings };
	}

	@GrpcMethod("ScreeningService", "HasUpcomingScreeningsForTheater")
	public async hasForTheater(
		data: HasUpcomingScreeningsForTheaterRequest,
	): Promise<HasUpcomingScreeningsResponse> {
		const hasScreenings = await this.hasForTheaterUC.execute(
			data.theaterId,
		);

		return { hasScreenings };
	}

	@GrpcMethod("ScreeningService", "UpdateScreening")
	public async update(
		data: UpdateScreeningRequest,
	): Promise<UpdateScreeningResponse> {
		const screening = await this.updateUC.execute(data.id, {
			movieId: data.movieId,
			hallId: data.hallId,
			startAt: data.startAt,
			endAt: data.endAt,
		});

		return { screening };
	}

	@GrpcMethod("ScreeningService", "DeleteScreening")
	public async delete(
		data: DeleteScreeningRequest,
	): Promise<DeleteScreeningResponse> {
		await this.deleteUC.execute(data.id);

		return { ok: true };
	}
}
