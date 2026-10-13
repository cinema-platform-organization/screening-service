import { MetricsModule, ServiceLoggerModule } from "@cinema-platform/common";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

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
		ServiceLoggerModule.forRoot("screening-service"),
		MetricsModule.forRoot("screening-service"),
		DatabaseModule,
		ScreeningModule,
	],
})
export class AppModule {}
