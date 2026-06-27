export class CreateDeviceDto {
  name: string;
  // Optional: a URL slug is derived from `name` when omitted.
  slug?: string;
  price?: number;

  brandId: number;
  categoryId: number;
  manufacturerId: number;
}
