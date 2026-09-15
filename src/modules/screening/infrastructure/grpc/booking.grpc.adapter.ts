import { RpcStatus } from "@cinema-platform/common";
import type { BookingServiceClient } from "@cinema-platform/contracts/gen/ts/booking";
import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { RpcException } from "@nestjs/microservices";
import { PinoLogger } from "nestjs-pino";
import { lastValueFrom } from "rxjs";

import { BookingPort } from "../../domain/ports/booking.port";

@Injectable()
export class BookingGrpcAdapter implements BookingPort, OnModuleInit {
	private service: BookingServiceClient;

	public constructor(
		private readonly logger: PinoLogger,
		@Inject("BOOKING_PACKAGE") private readonly client: ClientGrpc,
	) {
		this.logger.setContext(BookingGrpcAdapter.name);
	}

	public onModuleInit() {
		this.service =
			this.client.getService<BookingServiceClient>("BookingService");
	}

	public async existsForScreening(screeningId: string): Promise<boolean> {
		try {
			const res = await lastValueFrom(
				this.service.existsForScreening({ screeningId }),
			);

			return res.exists;
		} catch (error) {
			if (error instanceof RpcException) {
				throw error;
			}

			this.logger.error(
				`Failed to check bookings for screening ${screeningId}:`,
				error,
			);
			throw new RpcException({
				code: RpcStatus.INTERNAL,
				details: "Failed to check bookings for screening",
			});
		}
	}
}
