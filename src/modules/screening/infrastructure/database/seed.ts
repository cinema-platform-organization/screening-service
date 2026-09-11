import * as dotenv from "dotenv";
import { connect, disconnect } from "mongoose";

import { ScreeningSchema } from "./schemas/screening.schema";

dotenv.config();

interface ScreeningSeed {
	startAt: Date;
	endAt: Date;
	movieId: string;
	hallId: string;
}

const MOVIE_IDS = [
	"026f20c4-4826-4bea-b5e0-72ce8dda53d4", // Spider-Man: Into the Spider-Verse
	"0babcaf7-a11f-4fe8-8ec7-783aafdf4e20", // Top Gun: Maverick
	"0fc5fcfd-4b4e-4614-8c7b-199b056d1fb5", // Apocalypse Now
	"1a3adf24-14fd-4581-8ade-8166c3e61d9", // Once Upon a Time in America
	"1f095f9b-29cd-407b-a183-13479a992ad8", // Cargo 200
	"25872ec3-001a-4dfd-bcde-109f9bf0c640", // F1
	"2a402c89-ab68-461b-90b7-1b61e777d981", // The Green Mile
	"2acd1687-bb63-4f91-8fad-f1c097ea7be8", // Goodfellas
	"36a8bcc2-7315-447d-b727-9dee14d48597", // The Shawshank Redemption
	"5b8fe8c5-c96c-4b0b-a0e3-1c2fd65dd9c5", // Ford v Ferrari
	"74664c91-e7c3-4bf7-b8d7-15205f7e4ab3", // Oppenheimer
	"94121aac-1da7-44fe-9dff-aa7722914b62", // The World's Fastest Indian
	"98d269f7-da28-40da-80f0-8992e7d2a5ad", // The Truman Show
	"a1525496-3881-43f9-a5a5-2bb88fb583d2", // Midsommar
	"b2176a64-5c3e-414a-96cf-357fa958f0bf", // The Godfather
	"bcb3dba9-5d78-4119-9df3-9a8c6829f59f", // Interstellar
	"dd9759db-82d8-4202-82fc-9eb82dd45159", // The Fast and the Furious: Tokyo Drift
	"e4381d0e-92a1-4fec-bc8e-757c4d688c34", // The Godfather Part II
	"e653eda9-9a49-44de-a1e7-735b2d22e7b5", // Forrest Gump
];

const HALL_IDS = [
	"0N389om9jkEqdA2Hh8c6q", // Main Hall
	"AcF68crukJ0nHP200nWqb", // Hall A
	"CD0JbpCnTUx99i1t1Kct7", // Hall 1
	"FDuJg6n7XQ6fWEovivzQP", // VIP Hall
	"fRdcuUCy_Y6fzo4wQLw6y", // Hall B
	"Hz-Ee-jcRgNilwqc3E3eG", // Hall 2
];

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

	await disconnect();
	process.exit(0);
}

main();
