export interface IHotelsService {
    getHotelsFilters(): Promise<any>;
    getHotels(request: any): Promise<any>;
    getSearchResult(request: any): Promise<any>;
}
