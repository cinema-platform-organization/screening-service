import { RpcStatus } from "@cinema-platform/common";
import type { HallServiceClient } from "@cinema-platform/contracts/gen/ts/hall";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { RpcException } from "@nestjs/microservices";
import { PinoLogger } from "nestjs-pino";
import { lastValueFrom } from "rxjs";

import type { Hall, HallPort } from "../../domain/ports/hall.port";

@Injectable()
export class HallGrpcAdapter implements HallPort, OnModuleInit {
	private service: HallServiceClient;

	public constructor(
		private readonly logger: PinoLogger,
		@Inject("HALL_PACKAGE") private readonly client: ClientGrpc,
	) {
		this.logger.setContext(HallGrpcAdapter.name);
	}

	public onModuleInit() {
		this.service = this.client.getService<HallServiceClient>("HallService");
	}

	public async findById(id: string): Promise<Hall | null> {
		try {
			const res = await lastValueFrom(this.service.getHall({ id }));

			return res.hall ?? null;
		} catch (error) {
			if (error instanceof RpcException) {
				throw error;
			}

			this.logger.error(`Failed to fetch hall ${id}:`, error);
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Failed to fetch hall details",
			});
		}
	}

	public async listByTheater(theaterId: string): Promise<Hall[]> {
		try {
			const res = await lastValueFrom(
				this.service.listHallsByTheater({ theaterId }),
			);

			return res.halls;
		} catch (error) {
			if (error instanceof RpcException) {
				throw error;
			}

			this.logger.error(
				`Failed to list halls for theater ${theaterId}:`,
				error,
			);
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Failed to list halls by theater",
			});
		}
	}
}
