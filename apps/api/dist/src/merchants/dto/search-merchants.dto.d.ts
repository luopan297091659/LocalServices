export declare class SearchMerchantsDto {
    keyword?: string;
    prefectureCode?: string;
    municipalityCode?: string;
    categoryId?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    openNow?: boolean;
    sort: string;
    page: number;
    pageSize: number;
}
