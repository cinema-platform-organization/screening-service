import {
	isGrpcError,
	RpcStatus,
	toRpcException,
} from "@cinema-platform/common";
import type { TheaterServiceClient } from "@cinema-platform/contracts/gen/ts/theater";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

import type { Theater, TheaterPort } from "../../domain/ports/theater.port";

@Injectable()
export class TheaterGrpcAdapter implements TheaterPort, OnModuleInit {
	private readonly logger = new Logger(TheaterGrpcAdapter.name);

	private service: TheaterServiceClient;

	public constructor(
		@Inject("THEATER_PACKAGE") private readonly client: ClientGrpc,
	) {}

	public onModuleInit() {
		this.service =
			this.client.getService<TheaterServiceClient>("TheaterService");
	}

	public async findById(id: string): Promise<Theater | null> {
		try {
			const res = await lastValueFrom(this.service.getTheater({ id }));

			return res.theater ?? null;
		} catch (error) {
			if (isGrpcError(error) && error.code === RpcStatus.NOT_FOUND) {
				return null;
			}

			this.logger.error(
				{ err: error as Error, theaterId: id },
				"Failed to fetch theater",
			);

			throw toRpcException(error, "Failed to fetch theater details");
		}
	}
}
