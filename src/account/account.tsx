import React from "react";

import moment from "moment";
import locale from "antd/es/date-picker/locale/zh_CN";
// antd组件
import { Button } from "antd";
import { DatePicker } from "antd";
// 自定义组件
import TableComp from "../account/table/index";
import PieChart from "./chart/index";
// 工具方法
import {
  getCsvData,
  assembleData,
  formateData,
  getUniqueKey,
  time,
} from "./dataHelper";
// ts类型注释
import {
  BillItem,
  CategoriesItem,
  FormatDataItem,
  DataItem4State,
} from "./type";

import "./account.css";
// 内部类型
interface State {
  data: DataItem4State[];
  filters: {
    text: string;
    value: string;
  }[];
  typeFilterArr: string[];
  dateFilter: string;
}
interface SourceData {
  bill: BillItem[];
  categories: CategoriesItem[];
}

export default class BookKeep extends React.Component<any, State> {
  // originData: FormatDataItem[] = [];
  state: State = {
    data: [], // 存储数据
    filters: [], // 存放类型
    typeFilterArr: [], // 类型过滤的条件
    dateFilter: '', // 日期回调
  };
 
  componentDidMount() {
    this.getSourceData() // 1.获取两个csv数据，
      .then(this.getFilter) // 2.获取所有的类型，并存入filter
      .then(assembleData) // 3.将两个csv数据组合起来
      .then(formateData) // 4. 格式化数据
      .then((res) => {
        // this.originData = res; // 存储数据，用于重置使用
        this.setState({ data: res });
      });
  }
  // 获取两个csv的原始数据，此处使用d3获取本地数据，可起node服务，读取csv数据后存储到数据库
  getSourceData = async (): Promise<SourceData> => {
    const [bill, categories] = await Promise.all([
      getCsvData("../source/bill.csv"),
      getCsvData("../source/categories.csv"),
    ]);
    return { bill, categories };
  };
  // 获取所有的类型，并存入filter
  getFilter = (
    sourceData: SourceData
  ): SourceData => {
    const { categories = [] } = sourceData || {};
    const filters: any[] = categories.map((item: CategoriesItem) => {
      return {
        text: item.name,
        value: item.name,
      };
    });
    this.setState({ filters });
    return sourceData;
  };

  // 获取数据的日期范围，用于设置日期控件
  getDateRange = (data) => {
    let min = 0,
      max = 0;
    data.forEach((item: any) => {
      if (item.time > max || max === 0) {
        max = item.time;
      }
      if (item.time < min || min === 0) {
        min = item.time;
      }
    });
    return time(max, 7);
  };
  // 模拟数据添加
  handleAdd = () => {
    const { data } = this.state;
    const curTime = new Date().getTime();
    const newData = {
      formatTime: time(curTime), // 为当前月份
      time: curTime,
      amount: 16.98,
      name: `日常饮食`, // 下拉框
      type: "0" as "0",
      key: getUniqueKey(),
      typeName: "支出",
    };
    this.setState({
      data: [newData, ...data],
    });
  };
  // 日期选择组件回调。过滤月份
  onDateChange = (date, dateString) => {
    console.log(date);
    this.setState({ dateFilter: dateString });
  };
  // table保存的回调
  saveCb = (data) => {
    this.setState({ data });
  };
  // 类型筛选回调
  filterCb = (typeArr) => {
    let typeFilterArr: string[] = []
    if(Array.isArray(typeArr) && typeArr.length > 0) {
      typeFilterArr = typeArr;
    }
    this.setState({typeFilterArr})
  }

  render() {
    const { data, typeFilterArr, dateFilter } = this.state;
    const max: string = this.getDateRange(data);
    let renderData: DataItem4State[] = data;
    if(typeFilterArr.length > 0) {
      renderData = renderData.filter((item) => typeFilterArr.includes(item.name))
    }
    if(dateFilter) {
      renderData = renderData.filter((item) => item.formatTime.slice(0, 7) === dateFilter)
    }

    return (
      <div className={"x-mind-demo"}>
        <div className="btn-wrapper">
          <DatePicker
            onChange={this.onDateChange}
            picker="month"
            locale={locale}
            defaultPickerValue={moment(max, "YYYY-MM")}
          />
          <Button
            className="btn-add"
            type="primary"
            onClick={() => this.handleAdd()}
          >
            添加
          </Button>
        </div>
        <div className="container">
          <TableComp
            sourceData={renderData}
            filters={this.state.filters}
            saveCb={this.saveCb}
            filterCb={this.filterCb}
          ></TableComp>
          <div className="pie-chart">
            <PieChart
              data={renderData}
              sort={"wise"}
              config={{ width: 500, height: 400, margin: {} }}
            ></PieChart>
          </div>
        </div>
      </div>
    );
  }
}
