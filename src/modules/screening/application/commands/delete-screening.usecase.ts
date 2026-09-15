import { RpcStatus } from "@cinema-platform/common";
import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

import { BookingPort } from "../../domain/ports/booking.port";
import { ScreeningRepositoryPort } from "../../domain/ports/screening.repository.port";

@Injectable()
export class DeleteScreeningUsecase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly bookingPort: BookingPort,
	) {}

	public async execute(id: string) {
		const existing = await this.repository.findById(id);

		if (!existing) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Screening not found",
			});
		}

		const hasBookings = await this.bookingPort.existsForScreening(id);

		if (hasBookings) {
			throw new RpcException({
				code: RpcStatus.FAILED_PRECONDITION,
				details: "Cannot delete screening with existing bookings",
			});
		}

		await this.repository.delete(id);
	}
}
