export interface BillItemType {
  type: string;
  time: string;
  category: string;
  amount: string;
}

export interface CatagoriesItemType {
  id: string;
  type: "0" | "1";
  name: string;
}
type na = Pick<CatagoriesItemType, 'name'>;
export interface AssembledDataType extends BillItemType, Pick<CatagoriesItemType, 'name'> {}