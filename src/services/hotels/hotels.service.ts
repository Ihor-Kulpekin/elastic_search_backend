import {Injectable} from "@nestjs/common";
import {IHotelsService} from "./ihotels.service";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Hotel, HotelsDocument} from "../../schemas/hotels/hotels.schema";
import {ElasticsearchService} from "@nestjs/elasticsearch";
import {pluck} from "rxjs";

@Injectable()
export class HotelsService implements IHotelsService{
    constructor(
        @InjectModel(Hotel.name) private hotelsModel: Model<HotelsDocument>,
        private readonly elasticsearchService: ElasticsearchService
    ) {
    }
    public async getHotelsFilters(): Promise<any> {
        const filters: any = {};

        const [
            country,
            city,
            chainIds,
            rmcc,
            serviceLevel,
            status,
            region,
            propertyType,
            market,
            location,
            apps,
            area,
            brand
        ] = await Promise.all([
            this.hotelsModel.distinct('country'),
            this.hotelsModel.distinct('city'),
            this.hotelsModel.distinct('chainId'),
            this.hotelsModel.distinct('rmcc'),
            this.hotelsModel.distinct('serviceLevel'),
            this.hotelsModel.distinct('status'),
            this.hotelsModel.distinct('region'),
            this.hotelsModel.distinct('propertyType'),
            this.hotelsModel.distinct('market'),
            this.hotelsModel.distinct('location'),
            this.hotelsModel.distinct('app'),
            this.hotelsModel.distinct('area'),
            this.hotelsModel.distinct('brand')
        ])

        filters.country = country;
        filters.city = city;
        filters.chainIds = chainIds;
        filters.rmcc = rmcc;
        filters.serviceLevel = serviceLevel;
        filters.status = status;
        filters.region = region;
        filters.propertyType = propertyType;
        filters.market = market;
        filters.location = location;
        filters.app = apps;
        filters.area = area;
        filters.brand = brand;

        return filters;
    }

    public async getHotels(request: any): Promise<any> {

        const filters = JSON.parse(request?.query.filters);

        const query = this.getFiltersES(filters);

        const basicParams = {
            index: 'hotels',
            filter_path: 'hits.hits._source',
            body: {
                query,
            }
        }

        const paramsWithPaging = {
            ...basicParams,
            from: request?.query.skip,
            size: request?.query.limit,
            pretty: true,
        };

        const response: any = await this.elasticsearchService.search({
            ...paramsWithPaging
        });

        const result = response && response.body.hits && response.body.hits.hits ? response.body.hits.hits.map((hotel) => hotel._source) : [];

        const totalCount = await this.elasticsearchService.count({
            index: `hotels`, type: '_doc', body: {
                query,
            }
        }).then((response) => response.body.count);

        return {
            items: result ? result : [],
            totalCount
        };
    }

    public async getSearchResult(request: any): Promise<any> {
        const filters = JSON.parse(request.query.filters);

        const basicParams = {
            index: 'hotels',
            filter_path: 'hits.hits._source',
            body: {
                "query": {
                    "multi_match": {
                        "query" : filters.search
                        , "fields": ["name","city", 'country']
                    }
                }
            }
        }

        const paramsWithPaging = {
            ...basicParams,
        };

        const response = await this.elasticsearchService.search({
            ...paramsWithPaging
        })

        const result = response && response.body.hits && response.body.hits.hits ? response.body.hits.hits.map((hotel) => hotel._source) : [];

        return {
            items: result ? result : []
        };
    }

    private getFiltersES (filters): any {
        const query: { bool: { must: any[] } } = {
            bool: {
                must: [],
            }
        };

        Object.keys(filters).forEach((filter) => {
            if (filters[filter] && filters[filter].length > 0) {
                let field = `${filter}.keyword`

                if (filter === 'chainIds') {
                     field = `chainId.keyword`
                }

                query.bool.must.push({
                    terms: {
                        [field]: filters[filter]
                    }
                })
            }
        })

        return query;
    }
}
