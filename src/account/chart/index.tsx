import React, { useState, useMemo } from "react";
import * as d3 from "d3";

import {
  generateConfig,
  groupData,
  getPolylinePos,
  wiggleSort,
  getStyle,
  getColors,
} from "./help";

import { DataItem4State, ItemType, GroupDataItem } from "../type";

interface Props {
  data: DataItem4State[];
  sort:
    | ((arg: { name: string; amount: number }[]) => void)
    | "wise"
    | "ascend"
    | "descend";
  config: {
    width?: number,// svg宽度
    height?: number,// svg高度
    innerRadius?: number;// 饼图内圈半径
    outerRadius?: number;// 饼图内圈半径
    lineLength?: number;// 文字下方线的长度
    fontSize?: number;// 文字大小
    margin?: {// svg图框的边距
      top?: number;
      left?: number; 
      right?: number; 
      bottom?: number; 
    },
  };
}

const colors = getColors();

function Pie({ data, sort, config }: Props) {
  console.log("re-render");
  // 获取饼图的图形配置
  const mergedConfig = useMemo(() => {
    return generateConfig(config);
  }, [config]);
  const {
    width,
    height,
    innerRadius,
    outerRadius,
    lineLength,
    fontSize,
  } = mergedConfig;

  const [type, setType] = useState("0");
  const [active, setActive] = useState(-1);
  // 将数据根据种类进行聚合。
  const dataInGroup = useMemo(() => {
    console.log("---------dataInGroup-----------")
    return groupData(data, type as ItemType);
  }, [data, type]);
  // console.log("dataInGroup: ", dataInGroup);
  // 计算总收入/支出
  const totalAmount = useMemo(() => {
    return dataInGroup.reduce((acc, cur) => {
      return acc + cur.amount;
    }, 0);
  }, [dataInGroup]);
  // 可设置饼图的排序方式： wise：使线的位置更美观； ascend： 升序； descend： 降序； 或自定义排序
  const sortedData: GroupDataItem[] = useMemo(() => {
    if (sort === "wise") {
      return wiggleSort(dataInGroup, "amount");
    } else if (sort === "ascend") {
      return dataInGroup.sort((a, b) => a.amount - b.amount);
    } else if (sort === "descend") {
      return dataInGroup.sort((a, b) => b.amount - a.amount);
    } else if (Object.prototype.toString.call(sort) === "[object Function]") {
      return sort(dataInGroup);
    }
  }, [dataInGroup, sort]);
  // console.log("sortedData: ", sortedData);
  // 弧生成器
  const arc = useMemo(() => {
    return d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  }, [innerRadius, outerRadius]);
  // 生成布局信息
  const layout = useMemo(() => {
    const pie = d3
      .pie()
      .sort(null)
      .value((d) => Math.abs((d as any).amount));
    const pieData = pie(sortedData as any);
    const ret = getPolylinePos(pieData, arc, lineLength);
    console.log("layout ret: ", ret);
    return ret;
  }, [sortedData, arc, lineLength]);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {/* 饼图 */}
        {layout.map((d, i) => {
          let style = getStyle(active, i);
          const path = arc(d as any);
          return (
            <g
              key={d.data.name + "pie"}
              style={style}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(-1)}
            >
              {path && <path d={path} fill={colors[i]} stroke="#fff" />}
            </g>
          );
        })}
        {/* 文字和线 */}
        {layout.map((d, i) => {
          let style = getStyle(active, i);
          const polylinePos = [d.x0, d.y0, d.x1, d.y1, d.x2, d.y2].toString();

          return (
            <g
              key={d.data.name + "line"}
              style={style}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(-1)}
            >
              <text
                fontSize={fontSize}
                fill={colors[i]}
                textAnchor={d.isLeft ? "start" : "end"}
                dy="-0.5em"
                x={d.x2}
                y={d.y2}
              >
                {d.data.name}:{d.data.amount}
              </text>
              <polyline
                points={polylinePos}
                fill="none"
                stroke="yellow"
                strokeWidth="2px"
                strokeDasharray="5px"
              ></polyline>
            </g>
          );
        })}
        {/* 支出/收入 */}
        <g onClick={() => setType(type === "0" ? "1" : "0")}>
          <text fontSize={16} fill={"red"} textAnchor="middle">
            {type === "0" ? "总支出" : "总收入"}
          </text>
          <text fontSize={16} fill={"red"} textAnchor="middle" dy="1.1em">
            {totalAmount}元
          </text>
        </g>
      </g>
    </svg>
  );
}

export default Pie;
