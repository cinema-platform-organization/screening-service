import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { nanoid } from "nanoid";

export type ScreeningDocument = HydratedDocument<ScreeningModel>;

@Schema({
	_id: false,
	collection: "screenings",
	timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
})
export class ScreeningModel {
	@Prop({
		type: String,
		default: () => nanoid(),
		required: true,
	})
	public _id: string;

	@Prop({
		type: Date,
		required: true,
		alias: "start_at",
	})
	public startAt: Date;

	@Prop({
		type: Date,
		required: true,
		alias: "end_at",
	})
	public endAt: Date;

	@Prop({
		type: String,
		required: true,
		alias: "movie_id",
	})
	public movieId: string;

	@Prop({
		type: String,
		required: true,
		alias: "hall_id",
	})
	public hallId: string;
}

export const ScreeningSchema = SchemaFactory.createForClass(ScreeningModel);

ScreeningSchema.index({ hallId: 1 });
ScreeningSchema.index({ movieId: 1 });
ScreeningSchema.index({ hallId: 1, startAt: 1 });
ScreeningSchema.index({ movieId: 1, startAt: 1 });
