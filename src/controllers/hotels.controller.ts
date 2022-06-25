import {Controller, Get, Req} from "@nestjs/common";
import {HotelsService} from "../services/hotels/hotels.service";

@Controller('hotels')
export class HotelsController {
    constructor(private hotelsService: HotelsService) {
    }

    @Get('/hotels-filter')
    public async getHotelsFilters(@Req() req: any) {
        return this.hotelsService.getHotelsFilters();
    }

    @Get()
    public async getHotels(@Req() req: any) {
        console.time("dbsave");
        return this.hotelsService.getHotels(req);
    }

    @Get('/search-result')
    public async getSearchResult(@Req() req: any) {
        return this.hotelsService.getSearchResult(req);
    }
}
