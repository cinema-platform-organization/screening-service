import {
	isGrpcError,
	RpcStatus,
	toRpcException,
} from "@cinema-platform/common";
import type { MovieServiceClient } from "@cinema-platform/contracts/gen/ts/movie";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

import type { Movie, MoviePort } from "../../domain/ports/movie.port";

@Injectable()
export class MovieGrpcAdapter implements MoviePort, OnModuleInit {
	private readonly logger = new Logger(MovieGrpcAdapter.name);

	private service: MovieServiceClient;

	public constructor(
		@Inject("MOVIE_PACKAGE")
		private readonly client: ClientGrpc,
	) {}

	public onModuleInit() {
		this.service =
			this.client.getService<MovieServiceClient>("MovieService");
	}

	public async findById(id: string): Promise<Movie | null> {
		try {
			const res = await lastValueFrom(this.service.getMovie({ id }));

			return res?.movie ?? null;
		} catch (error) {
			if (isGrpcError(error) && error.code === RpcStatus.NOT_FOUND) {
				return null;
			}

			this.logger.error(
				{ err: error as Error, movieId: id },
				"Failed to fetch movie",
			);

			throw toRpcException(error, "Failed to fetch movie details");
		}
	}
}
