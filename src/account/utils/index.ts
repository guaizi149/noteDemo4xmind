import * as d3 from "d3";
import {BillItemType, CatagoriesItemType, AssembledDataType} from './type'

function time(time, len = 10) {
  var date = new Date(time + 8 * 3600 * 1000); // 增加8小时
  return date.toJSON().substr(0, len).replace("T", " ");
}
let key = 0;
function getUniqueKey() {
    return ++key;
}

function getCsvData(url: string) {
  const ret: any[] = [];
  return d3
    .csv(url, function (d: any): any {
      ret.push(d);
    })
    .then(() => {
      return ret;
    })
}

function assembleData(sourceData) {
    const {bill = [], categories = []} = sourceData || {};
    const hash = new Map();
    categories.forEach((element: CatagoriesItemType) => {
        hash.set(element.id, element);
    });
    const ret = bill.reduce((prev, cur: BillItemType) => {
        if(hash.has(cur.category)) {
            const catagoriesItem: CatagoriesItemType = hash.get(cur.category);
            // 因数据中有两组数据相对应： category 和 type，所以在category匹配的情况下，校验一下type
            if(cur.type !== catagoriesItem.type) {
                console.error("类别匹配后，消费类型不匹配", cur)
            }
            return [...prev, {...cur, name: catagoriesItem.name}]
        } else {
            console.error("找不到对应的类别名称", cur)
        }
    }, [])
    console.log("assembleData ret: ", ret);
    return ret;
}

function formateData(Arr) {
    return Arr.map((item: AssembledDataType) => {
        return {
            type: item.type,
            time: +item.time,
            category: item.category,
            amount: +item.amount,
            name: item.name,
            formatTime: time(+item.time),
            typeName: item.type === '0' ? '支出' : '收入',
            key: getUniqueKey()
        }
    })
}

export { getCsvData, assembleData, formateData, getUniqueKey, time };
