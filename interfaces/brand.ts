export type BrandedString<TName extends string> = string & { _brand: TName };
export type BrandedNumber<TName extends string> = number & { _brand: TName };
export type ISODate = BrandedString<"ISODate">;
export type Url = BrandedString<"Url">;
