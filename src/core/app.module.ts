import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { DatabaseModule } from "@/infrastructure/database/database.module";
import { ScreeningModule } from "@/modules/screening/infrastructure/screening.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				".env",
			],
		}),
		LoggerModule.forRoot(),
		DatabaseModule,
		ScreeningModule,
	],
})
export class AppModule {}
