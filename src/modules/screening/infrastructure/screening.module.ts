import { PROTO_PATHS } from "@cinema-platform/contracts";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MongooseModule } from "@nestjs/mongoose";

import { CreateScreeningUsecase } from "../application/commands/create-screening.usecase";
import { GetScreeningUsecase } from "../application/queries/get-screening.usecase";
import { GetScreeningsByMovieUsecase } from "../application/queries/get-screenings-by-movie.usecase";
import { GetScreeningsUsecase } from "../application/queries/get-screenings.usecase";
import { HallPort } from "../domain/ports/hall.port";
import { MoviePort } from "../domain/ports/movie.port";
import { ScreeningRepositoryPort } from "../domain/ports/screening.repository.port";
import { SeatPort } from "../domain/ports/seat.port";
import { TheaterPort } from "../domain/ports/theater.port";
import { ScreeningGrpcController } from "../interfaces/grpc/screening.grpc.controller";

import { ScreeningMongoRepository } from "./database/repositories/screening.mongo.repository";
import {
	ScreeningModel,
	ScreeningSchema,
} from "./database/schemas/screening.schema";
import { HallGrpcAdapter } from "./grpc/hall.grpc.adapter";
import { MovieGrpcAdapter } from "./grpc/movie.grpc.adapter";
import { SeatGrpcAdapter } from "./grpc/seat.grpc.adapter";
import { TheaterGrpcAdapter } from "./grpc/theater.grpc.adapter";

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: ScreeningModel.name,
				schema: ScreeningSchema,
			},
		]),
		ClientsModule.register([
			{
				name: "THEATER_PACKAGE",
				transport: Transport.GRPC,
				options: {
					package: "theater.v1",
					protoPath: PROTO_PATHS.THEATER,
					url: "localhost:50054",
				},
			},
			{
				name: "HALL_PACKAGE",
				transport: Transport.GRPC,
				options: {
					package: "hall.v1",
					protoPath: PROTO_PATHS.HALL,
					url: "localhost:50054",
				},
			},
			{
				name: "SEAT_PACKAGE",
				transport: Transport.GRPC,
				options: {
					package: "seat.v1",
					protoPath: PROTO_PATHS.SEAT,
					url: "localhost:50054",
				},
			},
			{
				name: "MOVIE_PACKAGE",
				transport: Transport.GRPC,
				options: {
					package: "movie.v1",
					protoPath: PROTO_PATHS.MOVIE,
					url: "localhost:50053",
				},
			},
		]),
	],
	controllers: [ScreeningGrpcController],
	providers: [
		{
			provide: ScreeningRepositoryPort,
			useClass: ScreeningMongoRepository,
		},
		{
			provide: HallPort,
			useClass: HallGrpcAdapter,
		},
		{
			provide: SeatPort,
			useClass: SeatGrpcAdapter,
		},
		{
			provide: MoviePort,
			useClass: MovieGrpcAdapter,
		},
		{
			provide: TheaterPort,
			useClass: TheaterGrpcAdapter,
		},
		CreateScreeningUsecase,
		GetScreeningsUsecase,
		GetScreeningsByMovieUsecase,
		GetScreeningUsecase,
	],
})
export class ScreeningModule {}
