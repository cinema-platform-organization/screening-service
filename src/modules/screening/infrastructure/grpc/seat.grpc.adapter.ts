import type { SeatServiceClient } from "@cinema-platform/contracts/gen/ts/seat";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

import { SeatPort, SeatType } from "../../domain/ports/seat.port";

@Injectable()
export class SeatGrpcAdapter implements SeatPort, OnModuleInit {
	private service: SeatServiceClient;

	public constructor(
		@Inject("SEAT_PACKAGE")
		private readonly client: ClientGrpc,
	) {}

	public onModuleInit() {
		this.service = this.client.getService<SeatServiceClient>("SeatService");
	}

	public async listSeatTypes(
		hallId: string,
		screeningId: string,
	): Promise<SeatType[]> {
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
	}
}
