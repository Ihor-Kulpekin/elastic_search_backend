import {Module} from "@nestjs/common";
import {HotelsController} from "../controllers/hotels.controller";
import {HotelsService} from "../services/hotels/hotels.service";
import {MongooseModule, MongooseModuleOptions} from "@nestjs/mongoose";
import {Hotel, HotelSchema} from "../schemas/hotels/hotels.schema";
import {ElasticsearchModule} from "@nestjs/elasticsearch";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Hotel.name, schema: HotelSchema }]),
        MongooseModule.forRootAsync({
            imports: [],
            inject: [],
            useFactory: (appConfigService: any) => {
                const options: MongooseModuleOptions = {
                    uri: 'mongodb://localhost:777/hotels',
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                }

                return options
            }
        }),
        ElasticsearchModule.register({
            node: 'http://localhost:9200',
            auth: {
                username: 'elastic', password: 'changeme'
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
    ],
    exports: [HotelsService],
    providers: [HotelsService],
    controllers: [HotelsController]
})
export class HotelsModule {}
