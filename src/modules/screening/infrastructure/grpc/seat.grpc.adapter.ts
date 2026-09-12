import { RpcStatus } from "@cinema-platform/common";
import type { SeatServiceClient } from "@cinema-platform/contracts/gen/ts/seat";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { RpcException } from "@nestjs/microservices";
import { PinoLogger } from "nestjs-pino";
import { lastValueFrom } from "rxjs";

import { SeatPort, SeatType } from "../../domain/ports/seat.port";

@Injectable()
export class SeatGrpcAdapter implements SeatPort, OnModuleInit {
	private service: SeatServiceClient;

	public constructor(
		private readonly logger: PinoLogger,
		@Inject("SEAT_PACKAGE")
		private readonly client: ClientGrpc,
	) {
		this.logger.setContext(SeatGrpcAdapter.name);
	}

	public onModuleInit() {
		this.service = this.client.getService<SeatServiceClient>("SeatService");
	}

	public async listSeatTypes(
		hallId: string,
		screeningId: string,
	): Promise<SeatType[]> {
		try {
			const res = await lastValueFrom(
				this.service.listSeatsByHall({ hallId, screeningId }),
			);

			const map = new Map<string, SeatType>();

			for (const seat of res?.seats ?? []) {
				const key = `${seat.type}-${seat.price}`;

				if (!map.has(key)) {
					map.set(key, {
						type: seat.type,
						price: seat.price,
					});
				}
			}

			return Array.from(map.values());
		} catch (error) {
			if (error instanceof RpcException) {
				throw error;
			}

			this.logger.error(
				`Failed to list seats for hall ${hallId} and screening ${screeningId}:`,
				error,
			);
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Failed to list seat types",
			});
		}
	}
}
