import {
	isGrpcError,
	RpcStatus,
	toRpcException,
} from "@cinema-platform/common";
import type { HallServiceClient } from "@cinema-platform/contracts/gen/ts/hall";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

import type { Hall, HallPort } from "../../domain/ports/hall.port";

@Injectable()
export class HallGrpcAdapter implements HallPort, OnModuleInit {
	private readonly logger = new Logger(HallGrpcAdapter.name);

	private service: HallServiceClient;

	public constructor(
		@Inject("HALL_PACKAGE") private readonly client: ClientGrpc,
	) {}

	public onModuleInit() {
		this.service = this.client.getService<HallServiceClient>("HallService");
	}

	public async findById(id: string): Promise<Hall | null> {
		try {
			const res = await lastValueFrom(this.service.getHall({ id }));

			return res.hall ?? null;
		} catch (error) {
			if (isGrpcError(error) && error.code === RpcStatus.NOT_FOUND) {
				return null;
			}

			this.logger.error(
				{ err: error as Error, hallId: id },
				"Failed to fetch hall",
			);
			throw toRpcException(error, "Failed to fetch hall details");
		}
	}

	public async listByTheater(theaterId: string): Promise<Hall[]> {
		try {
			const res = await lastValueFrom(
				this.service.listHallsByTheater({ theaterId }),
			);

			return res.halls;
		} catch (error) {
			this.logger.error(
				{ err: error as Error, theaterId },
				"Failed to list halls for theater",
			);

			throw toRpcException(error, "Failed to list halls by theater");
		}
	}
}
