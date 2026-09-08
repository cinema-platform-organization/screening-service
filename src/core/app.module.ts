import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "@/infrastructure/database/database.module";
import { ScreeningModule } from "@/modules/screening/infrastructure/screening.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		DatabaseModule,
		ScreeningModule,
	],
})
export class AppModule {}
