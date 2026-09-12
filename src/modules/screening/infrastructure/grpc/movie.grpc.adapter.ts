import { RpcStatus } from "@cinema-platform/common";
import type { MovieServiceClient } from "@cinema-platform/contracts/gen/ts/movie";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { RpcException } from "@nestjs/microservices";
import { PinoLogger } from "nestjs-pino";
import { lastValueFrom } from "rxjs";

import type { Movie, MoviePort } from "../../domain/ports/movie.port";

@Injectable()
export class MovieGrpcAdapter implements MoviePort, OnModuleInit {
	private service: MovieServiceClient;

	public constructor(
		private readonly logger: PinoLogger,
		@Inject("MOVIE_PACKAGE")
		private readonly client: ClientGrpc,
	) {
		this.logger.setContext(MovieGrpcAdapter.name);
	}

	public onModuleInit() {
		this.service =
			this.client.getService<MovieServiceClient>("MovieService");
	}

	public async findById(id: string): Promise<Movie | null> {
		try {
			const res = await lastValueFrom(this.service.getMovie({ id }));

			return res?.movie ?? null;
		} catch (error) {
			if (error instanceof RpcException) {
				throw error;
			}

			this.logger.error(`Failed to fetch movie ${id}:`, error);
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Failed to fetch movie details",
			});
		}
	}
}
