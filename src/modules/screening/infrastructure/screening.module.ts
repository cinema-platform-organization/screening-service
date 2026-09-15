import { PROTO_PATHS } from "@cinema-platform/contracts";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MongooseModule } from "@nestjs/mongoose";

import { CreateScreeningUsecase } from "../application/commands/create-screening.usecase";
import { DeleteScreeningUsecase } from "../application/commands/delete-screening.usecase";
import { UpdateScreeningUsecase } from "../application/commands/update-screening.usecase";
import { GetScreeningUsecase } from "../application/queries/get-screening.usecase";
import { GetScreeningsByMovieUsecase } from "../application/queries/get-screenings-by-movie.usecase";
import { GetScreeningsUsecase } from "../application/queries/get-screenings.usecase";
import { HasUpcomingScreeningsForHallUsecase } from "../application/queries/has-upcoming-screenings-for-hall.usecase";
import { HasUpcomingScreeningsForTheaterUsecase } from "../application/queries/has-upcoming-screenings-for-theater.usecase";
import { BookingPort } from "../domain/ports/booking.port";
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
import { BookingGrpcAdapter } from "./grpc/booking.grpc.adapter";
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
		ClientsModule.registerAsync([
			{
				name: "THEATER_PACKAGE",
				inject: [ConfigService],
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: "theater.v1",
						protoPath: PROTO_PATHS.THEATER,
						url: configService.get<string>("THEATER_GRPC_URL"),
					},
				}),
			},
			{
				name: "HALL_PACKAGE",
				inject: [ConfigService],
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: "hall.v1",
						protoPath: PROTO_PATHS.HALL,
						url: configService.get<string>("THEATER_GRPC_URL"),
					},
				}),
			},
			{
				name: "SEAT_PACKAGE",
				inject: [ConfigService],
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: "seat.v1",
						protoPath: PROTO_PATHS.SEAT,
						url: configService.get<string>("THEATER_GRPC_URL"),
					},
				}),
			},
			{
				name: "MOVIE_PACKAGE",
				inject: [ConfigService],
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: "movie.v1",
						protoPath: PROTO_PATHS.MOVIE,
						url: configService.get<string>("MOVIE_GRPC_URL"),
					},
				}),
			},
			{
				name: "BOOKING_PACKAGE",
				inject: [ConfigService],
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: "booking.v1",
						protoPath: PROTO_PATHS.BOOKING,
						url: configService.get<string>("BOOKING_GRPC_URL"),
					},
				}),
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
		{
			provide: BookingPort,
			useClass: BookingGrpcAdapter,
		},
		CreateScreeningUsecase,
		GetScreeningsUsecase,
		GetScreeningsByMovieUsecase,
		GetScreeningUsecase,
		HasUpcomingScreeningsForHallUsecase,
		HasUpcomingScreeningsForTheaterUsecase,
		UpdateScreeningUsecase,
		DeleteScreeningUsecase,
	],
})
export class ScreeningModule {}
