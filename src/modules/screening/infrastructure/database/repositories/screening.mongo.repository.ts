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
	): Promise<ScreeningEntity | null> {
		const doc = await this.screening
			.findOne({
				hallId,
				startAt: { $lt: endAt },
				endAt: { $gt: startAt },
			})
			.lean()
			.exec();

		return doc ? ScreeningMapper.toEntity(doc) : null;
	}

	public async create(entity: ScreeningEntity): Promise<ScreeningEntity> {
		const persistence = ScreeningMapper.toPersistence(entity);

		const doc = new this.screening(persistence);
		await doc.save();

		return ScreeningMapper.toEntity(doc.toObject());
	}

	public async findById(id: string): Promise<ScreeningEntity | null> {
		const doc = await this.screening.findById(id).lean().exec();

		return doc ? ScreeningMapper.toEntity(doc) : null;
	}

	public async findByDateRange(
		dayStart?: Date,
		dayEnd?: Date,
		hallIds?: string[],
		limit = 20,
		skip = 0,
	): Promise<ScreeningEntity[]> {
		const query = this.buildDateRangeQuery(dayStart, dayEnd, hallIds);

		const docs = await this.screening
			.find(query)
			.sort({ startAt: 1 })
			.skip(skip)
			.limit(limit)
			.lean()
			.exec();

		return docs.map(doc => ScreeningMapper.toEntity(doc));
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

		const docs = await this.screening
			.find(query)
			.sort({ startAt: 1 })
			.skip(skip)
			.limit(limit)
			.lean()
			.exec();

		return docs.map(doc => ScreeningMapper.toEntity(doc));
	}

	public async countByMovie(
		movieId: string,
		dateStart?: Date,
		dateEnd?: Date,
	): Promise<number> {
		const query = this.buildMovieQuery(movieId, dateStart, dateEnd);

		return this.screening.countDocuments(query).exec();
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
