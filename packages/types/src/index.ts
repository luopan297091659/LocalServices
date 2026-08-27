export interface ApiEnvelope<T> { success: boolean; code: number; message: string; data: T }
export interface Pagination { page: number; pageSize: number; total: number; totalPages: number }
export interface Category { id: string; nameJa: string; icon?: string; children?: Category[] }
export interface Address { fullAddress: string; prefectureCode?: string; municipalityName?: string; latitude?: string; longitude?: string }
export interface Service { id: string; nameJa: string; summaryJa?: string; priceType: string; priceMin?: number; priceMax?: number; price?: number; stock?: number; unit?: string; taxIncluded: boolean; coverUrl?: string; status?: string }
export interface Product { id: string; nameJa: string; summaryJa?: string; price?: number; priceMin?: number; priceType?: string; originalPrice?: number; stock?: number; unit?: string; coverUrl?: string; status?: string }
export interface Merchant {
  id: string; nameJa: string; slug?: string; logoUrl?: string; coverUrl?: string; descriptionJa?: string; shortDescriptionJa?: string;
  phone?: string; website?: string; lineUrl?: string; status: string; rating: string | number; reviewCount: number; favoriteCount: number; viewCount?: number;
  address?: Address; services?: Service[]; products?: Product[]; categories?: Array<{ category: Category }>; distance?: number;
  businessHours?: Array<{ dayOfWeek: number; isClosed: boolean; openTime1?: string; closeTime1?: string; openTime2?: string; closeTime2?: string }>;
}
export interface User { id: string; email?: string; phone?: string; nickname?: string; avatarUrl?: string; role: string }
export interface AuthResult { user: User; accessToken: string; refreshToken: string }
