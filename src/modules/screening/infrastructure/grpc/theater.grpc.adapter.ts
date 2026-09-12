import { RpcStatus } from "@cinema-platform/common";
import type { TheaterServiceClient } from "@cinema-platform/contracts/gen/ts/theater";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { RpcException } from "@nestjs/microservices";
import { PinoLogger } from "nestjs-pino";
import { lastValueFrom } from "rxjs";

import type { Theater, TheaterPort } from "../../domain/ports/theater.port";

@Injectable()
export class TheaterGrpcAdapter implements TheaterPort, OnModuleInit {
	private service: TheaterServiceClient;

	public constructor(
		private readonly logger: PinoLogger,
		@Inject("THEATER_PACKAGE") private readonly client: ClientGrpc,
	) {
		this.logger.setContext(TheaterGrpcAdapter.name);
	}

	public onModuleInit() {
		this.service =
			this.client.getService<TheaterServiceClient>("TheaterService");
	}

	public async findById(id: string): Promise<Theater | null> {
		try {
			const res = await lastValueFrom(this.service.getTheater({ id }));

			return res.theater ?? null;
		} catch (error) {
			if (error instanceof RpcException) {
				throw error;
			}

			this.logger.error(`Failed to fetch theater ${id}:`, error);
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Failed to fetch theater details",
			});
		}
	}
}
