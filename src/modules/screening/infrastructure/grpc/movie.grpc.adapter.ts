import type { MovieServiceClient } from "@cinema-platform/contracts/gen/ts/movie";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

import type { Movie, MoviePort } from "../../domain/ports/movie.port";

@Injectable()
export class MovieGrpcAdapter implements MoviePort, OnModuleInit {
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
		const res = await lastValueFrom(this.service.getMovie({ id }));

		return res?.movie ?? null;
	}
}
