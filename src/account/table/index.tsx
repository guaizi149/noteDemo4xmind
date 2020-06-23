import React, { useContext, useState, useEffect, useRef } from "react";

import { Table, Input,Form } from "antd";

import {DataItem4State} from '../type'

interface TableProps {
  sourceData: DataItem4State[];
  saveCb: (arg: DataItem4State[]) => void;
  filterCb: (arg: string) => void;
  filters: {
    text: string;
    value: string;
  }[]
}

const EditableContext = React.createContext<any>({});

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>();
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async (e) => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      console.log("record: ", record, values);
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default class TableComp extends React.Component<TableProps, any> {
  columns = [
    {
      title: "时间",
      dataIndex: "formatTime",
      editable: true,
      width: "30%",
    },
    {
      title: "金额",
      dataIndex: "amount",
      width: "20%",
      editable: true,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "类别",
      dataIndex: "name",
      editable: true,
      width: "30%",
      filters: [] as {
        text: string;
        value: string;
      }[],
    },
    {
      title: "收入/支出",
      dataIndex: "typeName",
      width: "20%",
      editable: true,
    },
  ];
  // 点击筛选
  handleFilter = (value, filters) => {
    console.log("value--------------------------", value, filters)
    this.props.filterCb && this.props.filterCb(filters.name)
  }
 
  // 表格触发保存
  handleSave = (row) => {
    const newData = [...this.props.sourceData];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.props.saveCb && this.props.saveCb(newData);
  };

  render() {
    const { sourceData, filters } = this.props;
    this.columns[2].filters = filters;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    return (
        <Table
          className={"table-wrapper"}
          rowClassName={() => "editable-row"}
          bordered
          onChange={this.handleFilter}
          components={components}
          columns={columns}
          dataSource={sourceData}
          pagination={{ position: ["bottomLeft"] }}
        />
    );
  }
}
