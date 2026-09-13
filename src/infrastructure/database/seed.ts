import * as dotenv from "dotenv";
import * as fs from "fs";
import { connect, disconnect } from "mongoose";
import * as path from "path";
import postgres from "postgres";

import { ScreeningSchema } from "../../modules/screening/infrastructure/database/schemas/screening.schema";

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
	const envName = process.env.NODE_ENV || "development";
	const envFileName = `.env.${envName}.local`;
	const envPath = path.resolve(process.cwd(), envFileName);

	if (fs.existsSync(envPath)) {
		dotenv.config({ path: envPath });
		console.log(`[Seeder] Loaded environment from ${envFileName}`);
	} else {
		const fallbackPath = path.resolve(process.cwd(), ".env");
		if (fs.existsSync(fallbackPath)) {
			dotenv.config({ path: fallbackPath });
			console.log(`[Seeder] Loaded fallback environment from .env`);
		}
	}
} else {
	console.log(
		"[Seeder] Running in production. Using system environment variables.",
	);
}

interface ScreeningSeed {
	startAt: Date;
	endAt: Date;
	movieId: string;
	hallId: string;
}

interface MovieRow {
	id: string;
}

interface HallRow {
	id: string;
}

const START_DATE = new Date("2026-09-10T00:00:00Z");
const END_DATE = new Date("2026-12-31T23:59:59Z");

const SHOW_TIMES = [10, 13, 16, 19, 22]; // hours of the day a screening can start
const DURATION_MINUTES = 130; // rough runtime used to compute endAt

function getDateRange(start: Date, end: Date): Date[] {
	const dates: Date[] = [];
	const current = new Date(start);

	while (current <= end) {
		dates.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return dates;
}

function randomFrom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
	// movie-service's DB — read-only, seeding purposes only
	const movieSql = postgres({
		host: process.env.MOVIE_DATABASE_HOST,
		port: Number(process.env.MOVIE_DATABASE_PORT),
		username: process.env.MOVIE_DATABASE_USERNAME,
		password: process.env.MOVIE_DATABASE_PASSWORD,
		database: process.env.MOVIE_DATABASE_NAME,
	});

	// theater-service's DB — read-only, seeding purposes only
	const theaterSql = postgres({
		host: process.env.THEATER_DATABASE_HOST,
		port: Number(process.env.THEATER_DATABASE_PORT),
		username: process.env.THEATER_DATABASE_USERNAME,
		password: process.env.THEATER_DATABASE_PASSWORD,
		database: process.env.THEATER_DATABASE_NAME,
	});

	console.log("Fetching movies from movie-service...");
	const movieRows = await movieSql<MovieRow[]>`SELECT id FROM movies`;
	const MOVIE_IDS = movieRows.map(m => m.id);

	console.log("Fetching halls from theater-service...");
	const hallRows = await theaterSql<HallRow[]>`SELECT id FROM halls`;
	const HALL_IDS = hallRows.map(h => h.id);

	if (!MOVIE_IDS.length || !HALL_IDS.length) {
		throw new Error("No movies or halls found — seed those services first");
	}

	console.log(
		`Found ${MOVIE_IDS.length} movies and ${HALL_IDS.length} halls`,
	);

	const mongoUri = process.env.MONGO_URI;

	if (!mongoUri) {
		throw new Error("MONGO_URI is not set");
	}

	console.log("Connecting to MongoDB...");
	const connection = await connect(mongoUri);

	console.log("Seeding screenings...");

	const dates = getDateRange(START_DATE, END_DATE);
	const screenings: ScreeningSeed[] = [];

	for (const date of dates) {
		for (const hallId of HALL_IDS) {
			for (const hour of SHOW_TIMES) {
				const startAt = new Date(date);
				startAt.setUTCHours(hour, 0, 0, 0);

				const endAt = new Date(startAt);
				endAt.setMinutes(endAt.getMinutes() + DURATION_MINUTES);

				screenings.push({
					startAt,
					endAt,
					movieId: randomFrom(MOVIE_IDS),
					hallId,
				});
			}
		}
	}

	const ScreeningModelInstance = connection.model(
		"ScreeningModel",
		ScreeningSchema,
	);

	await ScreeningModelInstance.insertMany(screenings, { ordered: false });

	console.log(`Seed completed! Inserted ${screenings.length} screenings.`);

	await movieSql.end();
	await theaterSql.end();
	await disconnect();

	process.exit(0);
}

main();
