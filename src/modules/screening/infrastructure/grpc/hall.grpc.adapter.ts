import type { HallServiceClient } from "@cinema-platform/contracts/gen/ts/hall";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

import type { Hall, HallPort } from "../../domain/ports/hall.port";

@Injectable()
export class HallGrpcAdapter implements HallPort, OnModuleInit {
	private service: HallServiceClient;

	public constructor(
		@Inject("HALL_PACKAGE") private readonly client: ClientGrpc,
	) {}

	public onModuleInit() {
		this.service = this.client.getService<HallServiceClient>("HallService");
	}

	public async findById(id: string): Promise<Hall | null> {
		const res = await lastValueFrom(this.service.getHall({ id }));

		return res.hall ?? null;
	}

	public async listByTheater(theaterId: string): Promise<Hall[]> {
		const res = await lastValueFrom(
			this.service.listHallsByTheater({ theaterId }),
		);

		return res.halls;
	}
}
