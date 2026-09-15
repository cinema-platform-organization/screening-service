import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { QueryFilter } from "mongoose";

import { ScreeningEntity } from "@/modules/screening/domain/entities/screening.entity";
import { ScreeningRepositoryPort } from "@/modules/screening/domain/ports/screening.repository.port";

import { ScreeningMapper } from "../../mappers/screening.mapper";
import { ScreeningDocument, ScreeningModel } from "../schemas/screening.schema";

@Injectable()
export class ScreeningMongoRepository implements ScreeningRepositoryPort {
	public constructor(
		@InjectModel(ScreeningModel.name)
		private readonly screening: Model<ScreeningDocument>,
	) {}

	public async findOverlap(
		hallId: string,
		startAt: Date,
		endAt: Date,
		excludeId?: string,
	): Promise<ScreeningEntity | null> {
		const query: QueryFilter<ScreeningDocument> = {
			hallId,
			startAt: { $lt: endAt },
			endAt: { $gt: startAt },
		};

		if (excludeId) {
			query._id = { $ne: excludeId };
		}

		const doc = await this.screening.findOne(query).lean().exec();

		if (doc) {
			return ScreeningMapper.toEntity(doc);
		}

		return null;
	}

	public async create(entity: ScreeningEntity): Promise<ScreeningEntity> {
		const persistence = ScreeningMapper.toPersistence(entity);

		const doc = new this.screening(persistence);
		await doc.save();

		return ScreeningMapper.toEntity(doc.toObject());
	}

	public async findById(id: string): Promise<ScreeningEntity | null> {
		const doc = await this.screening.findById(id).lean().exec();

		if (doc) {
			return ScreeningMapper.toEntity(doc);
		}

		return null;
	}

	public async findByDateRange(
		dayStart?: Date,
		dayEnd?: Date,
		hallIds?: string[],
		limit = 20,
		skip = 0,
	): Promise<ScreeningEntity[]> {
		const query = this.buildDateRangeQuery(dayStart, dayEnd, hallIds);

		let queryBuilder = this.screening.find(query).sort({ startAt: 1 });

		const isDateFiltered = dayStart !== undefined && dayEnd !== undefined;

		if (!isDateFiltered) {
			const activeSkip = skip ?? 0;
			const activeLimit = limit ?? 20;
			queryBuilder = queryBuilder.skip(activeSkip).limit(activeLimit);
		}

		const docs = await queryBuilder.lean().exec();

		return docs.map(doc => {
			return ScreeningMapper.toEntity(doc);
		});
	}

	public async countByDateRange(
		dayStart?: Date,
		dayEnd?: Date,
		hallIds?: string[],
	): Promise<number> {
		const query = this.buildDateRangeQuery(dayStart, dayEnd, hallIds);

		return this.screening.countDocuments(query).exec();
	}

	public async findManyByMovie(
		movieId: string,
		dateStart?: Date,
		dateEnd?: Date,
		limit = 20,
		skip = 0,
	): Promise<ScreeningEntity[]> {
		const query = this.buildMovieQuery(movieId, dateStart, dateEnd);

		let queryBuilder = this.screening.find(query).sort({ startAt: 1 });

		const isDateFiltered = dateStart !== undefined && dateEnd !== undefined;

		if (!isDateFiltered) {
			const activeSkip = skip ?? 0;
			const activeLimit = limit ?? 20;
			queryBuilder = queryBuilder.skip(activeSkip).limit(activeLimit);
		}

		const docs = await queryBuilder.lean().exec();

		return docs.map(doc => {
			return ScreeningMapper.toEntity(doc);
		});
	}

	public async countByMovie(
		movieId: string,
		dateStart?: Date,
		dateEnd?: Date,
	): Promise<number> {
		const query = this.buildMovieQuery(movieId, dateStart, dateEnd);

		return this.screening.countDocuments(query).exec();
	}

	public async existsUpcomingByHall(hallId: string): Promise<boolean> {
		const doc = await this.screening
			.exists({
				hallId,
				startAt: { $gte: new Date() },
			})
			.exec();

		return Boolean(doc);
	}

	public async existsUpcomingByHalls(hallIds: string[]): Promise<boolean> {
		if (hallIds.length === 0) return false;

		const doc = await this.screening
			.exists({
				hallId: { $in: hallIds },
				startAt: { $gte: new Date() },
			})
			.exec();

		return Boolean(doc);
	}

	public async update(
		id: string,
		data: Partial<{
			movieId: string;
			hallId: string;
			startAt: Date;
			endAt: Date;
		}>,
	): Promise<ScreeningEntity | null> {
		const doc = await this.screening
			.findByIdAndUpdate(id, data, { new: true })
			.lean()
			.exec();

		return doc ? ScreeningMapper.toEntity(doc) : null;
	}

	public async delete(id: string): Promise<void> {
		await this.screening.findByIdAndDelete(id).exec();
	}

	private buildDateRangeQuery(
		dayStart?: Date,
		dayEnd?: Date,
		hallIds?: string[],
	): QueryFilter<ScreeningDocument> {
		const query: QueryFilter<ScreeningDocument> = {};

		if (dayStart && dayEnd) {
			query.startAt = { $gte: dayStart, $lt: dayEnd };
		}
		if (hallIds?.length) {
			query.hallId = { $in: hallIds };
		}

		return query;
	}

	private buildMovieQuery(
		movieId: string,
		dateStart?: Date,
		dateEnd?: Date,
	): QueryFilter<ScreeningDocument> {
		const query: QueryFilter<ScreeningDocument> = { movieId };

		if (dateStart && dateEnd) {
			query.startAt = { $gte: dateStart, $lt: dateEnd };
		}

		return query;
	}
}
