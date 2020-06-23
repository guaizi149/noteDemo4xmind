export type ItemType = "0" | "1";

export interface BillItem {
  type: ItemType;
  time: string;
  category: string;
  amount: string;
}

export interface CategoriesItem {
  type: ItemType;
  id: string; // 跟bill的category对应
  name: string;
}

export interface AssembledDataItem
  extends BillItem,
    Pick<CategoriesItem, "name"> {}

export interface FormatDataItem
  extends Pick<AssembledDataItem, "type" | "category" | "name"> {
  time: number;
  amount: number;
  formatTime: string;
  typeName: string;
  key: number;
}

export interface DataItem4State {
  time: number;
  amount: number;
  formatTime: string;
  typeName: string;
  key: number;
  category?: string;
  name: string;
  type: ItemType;
}

/*************图标的type***************/
export interface GroupDataItem {
  name: string;
  amount: number;
}

interface GroupDataItemWithOrder extends GroupDataItem {
    order: number;
}

export interface PieItem {
    data: GroupDataItemWithOrder,
    index: number,
    value: number,
    startAngle: number,
    endAngle: number,
    padAngle: number,
}

export interface PieItemAddPos extends PieItem {
    x0: number;
    y0: number;
    isLeft: boolean;
    [propName: string]: any
}

export interface ChartItem extends PieItemAddPos  {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}
