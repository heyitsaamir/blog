export type Branded<T extends string, TName extends string> = T & { _brand: TName };
export type ISODate = Branded<string, 'ISODate'>;