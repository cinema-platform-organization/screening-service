import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { getMongooseConfig } from "@/config/mongoose.config";

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: getMongooseConfig,
			inject: [ConfigService],
		}),
	],
})
export class DatabaseModule {}
