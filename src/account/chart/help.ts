import * as d3 from "d3";

import { DataItem4State, ItemType, GroupDataItem, ChartItem,PieItemAddPos } from "../type";
// svg图的默认配置
const defaultConfig = {
  width: 800,
  height: 600,
  margin: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  },
};
// 根据config，生成svg画布，饼图内外半径，文字大小，文字下方线的长度
function generateConfig(configs) {
  const mergedConfig = { ...defaultConfig, ...configs };
  const { width, height, margin } = mergedConfig;
  const { top = 0, left = 0, right = 0, bottom = 0 } = margin || {};
  const maxRadius = Math.min(width - top - bottom, height - left - right) / 2;
  const outerRadius = (maxRadius * 3) / 4;
  const innerRadius = outerRadius / 2;
  const length = (width - top - bottom) / 2 - outerRadius - 10;
  const lineLength = length > 150 ? 150 : length;
  const size = maxRadius / 15 > 15 ? 15 : maxRadius / 15;
  let fontSize = size;
  if (size > 15) {
    fontSize = 15;
  } else if (size < 8) {
    fontSize = 8;
  }
  return {
    ...defaultConfig,
    outerRadius,
    innerRadius,
    lineLength,
    fontSize,
    ...configs,
  };
}
// 动画效果的css
const normalStyle = {
  cursor: "pointer",
  opacity: 1,
  transform: "scale(1)",
  transition: "all linear 200ms",
};

const hoverStyle = {
  transform: "scale(1.1)",
};

const noHoverStyle = {
  opacity: 0.5,
};
// 将原始数据根据类型聚合
function groupData(data: DataItem4State[], type: ItemType): GroupDataItem[] {
  console.log("handle data>>>>>>>>>>>.", data);
  const temp: { [propName: string]: { amount: number } } = {};
  const ret: GroupDataItem[] = [];
  data
    .filter((item) => item.type === type)
    .forEach((item) => {
      const { name = "", amount = 0 } = item || {};
      if (!temp[name]) {
        temp[name] = { amount };
      } else {
        temp[name].amount = amount + temp[name].amount;
      }
    });
  for (let [key, value] of Object.entries(temp)) {
    ret.push({
      name: key,
      amount: value.amount,
    });
  }
  console.log("pie ret: ", ret);
  return ret;
}
// 饼图文字起始点在左半边，还是右半边
function isLeft(d) {
  return d.startAngle + (d.endAngle - d.startAngle) / 2 > Math.PI;
}
// 生成折线的坐标信息
function setPolyLinePos(arr: PieItemAddPos[], lineLength: number): ChartItem[] {
  function scalePos(pos) {
    return pos * 1.1;
  }

  return arr
    .sort((a, b) => a.y0 - b.y0)
    .reduce((acc, cur) => {
      const before = acc[acc.length - 1];
      const { x0, y0 } = cur;
      const curItem = {} as ChartItem;
      curItem.x1 = scalePos(x0);
      curItem.x2 = cur.isLeft ? curItem.x1 - lineLength : curItem.x1 + lineLength;
      curItem.y1 = scalePos(y0);

      if (before) {
        // 排列后，两条线的间距。
        const diff = curItem.y1 - before.y1;
        curItem.y1 = diff > 30 ? curItem.y1 : before.y1 + 30;
      }
      curItem.y2 = curItem.y1;
      return [...acc, {...cur, ...curItem}];
    }, [] as ChartItem[]);
}
// 获取折线（包含文字）的位置信息
function getPolylinePos(pieData, arc, lineLength): ChartItem[] {
  const left: PieItemAddPos[] = [];
  const right: PieItemAddPos[] = [];

  pieData.forEach((d) => {
    const pos = arc.centroid(d);
    d.x0 = pos[0] * 1.3;
    d.y0 = pos[1] * 1.3;
    if (isLeft(d)) {
      d.isLeft = true;
      left.push(d);
    } else {
      d.isLeft = false;
      right.push(d);
    }
  });
  const leftAfterHandled: ChartItem[] = setPolyLinePos(left, lineLength);
  const rightAfterHandled: ChartItem[] = setPolyLinePos(right, lineLength);
  const ret = [...leftAfterHandled, ...rightAfterHandled];
  console.log("getPolylinePos: ", ret);
  return ret;
}
// 大小穿插排序，线的位置更美观
function wiggleSort(arr, key) {
  let tmp = arr.slice();
  tmp.sort((a, b) => a[key] - b[key]);
  let mid = Math.floor((arr.length + 1) / 2);
  let tmp1 = tmp.slice(0, mid); // length = mid
  let tmp2 = tmp.slice(mid).reverse(); // length = r - mid
  for (let i = 0; i < tmp1.length; i++) {
    arr[2 * i] = tmp1[i];
    arr[2 * i].order = 2 * i;
  }
  for (let j = 0; j < tmp2.length; j++) {
    arr[2 * j + 1] = tmp2[j];
    arr[2 * j + 1].order = 2 * j + 1;
  }
  console.log("处理后的arr", arr);
  return arr;
}
// 获取节点样式
function getStyle(active, cur) {
  if (active === -1) {
    return normalStyle;
  } else if (active === cur) {
    return { ...normalStyle, ...hoverStyle };
  } else {
    return { ...normalStyle, ...noHoverStyle };
  }
}
// 获取颜色分类，返回[a,b,...] a,b为颜色的色值
function getColors() {
  return d3.schemeCategory10;
}

export {
  generateConfig,
  groupData,
  setPolyLinePos,
  getPolylinePos,
  wiggleSort,
  getStyle,
  getColors,
};
