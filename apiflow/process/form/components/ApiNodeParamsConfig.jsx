import React from "react";
import ReactDOM from "react-dom";
import {
  Table,Button,Tag, Icon, Drawer, Modal, Input, Row, Col, Popconfirm, Card,
} from "antd";
import EditText from "../../../../core/components/EditText";
import EditSelectOne from "../../../../core/components/EditSelectOne";
import EditTextArea from "../../../../core/components/EditTextArea";
import TreeNodeSelect from "../../../../core/components/TreeNodeSelect";
import AjaxEditSelect from "../../../../core/components/AjaxEditSelect";
import EditServiceMoreParams from "../../../../designer/designer/form/components/EditServiceMoreParams";
import EditApiInputParamsMasterTable from "../../../../designer/designer/grid/EditApiInputParamsMasterTable";
import * as GridActions from "../../../../core/utils/GridUtils";
import * as URI from "../../../../core/constants/RESTURI";
import * as AjaxUtils from "../../../../core/utils/AjaxUtils";
import * as FormUtils from "../../../../core/utils/FormUtils";
import EditSelect from "../../../../core/components/EditSelect";

//API输入参数配置

const ruleSelectUrl = URI.ESB.CORE_ESB_RULE.select;
const importApiParamsUrl = URI.ESB.CORE_ESB_NODEPARAMS.importApiParams;
const selectExportParams = URI.ESB.CORE_ESB_NODEPARAMS.selectExportParams;
const LIST_MASTER_FIELDS_URL = URI.CORE_MasterData.fields;
const LIST_MASTER_URL = URI.CORE_MasterData.listView;

const Search = Input.Search;

class ApiNodeParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.serviceId = this.props.serviceId;
    this.processId = this.props.processId;
    this.nodeId = this.props.nodeId;
    this.applicationId = this.props.applicationId;
    this.parentData = this.props.inParams || [];
    this.parentData.forEach((v, index, item) => {
      this.parentData[index].id = index;
    });
    this.applicationRuleSelectUrl =
      ruleSelectUrl + "?applicationId=" + this.applicationId;
    this.state = {
      curEditIndex: -1,
      data: this.parentData,
      newIdNum: 0,
      visible: false,
      action: "",
      currentRecord: {},
      configId: this.serviceId, //this.serviceId === apiId === 选择api后的id
      masterDataModalVisible: false,
      pagination: {
        pageSize: 15,
        current: 1,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
      mask: false,
      currentRecordId: -1,
      jsonVisible: false,
      jsonValue: "",
    };
  }

  /* 只有选择api并且点击确认按钮才会执行 */
  componentDidMount() {
    if (this.props.apiSelectRows && this.props.apiSelectRows.length) {
      this.getApiData(this.props.apiSelectRows);
    }
  }

  getMasterData = (
    pagination = this.state.pagination,
    filters = {},
    sorter = {},
    searchFilters = {}
  ) => {
    GridActions.loadData(
      this,
      LIST_MASTER_URL,
      pagination,
      filters,
      sorter,
      searchFilters
    );
  };

  componentWillReceiveProps = (nextProps) => {
    if (this.serviceId !== nextProps.serviceId) {
      this.serviceId = nextProps.serviceId;
    }
    if (nextProps.apiSelectRows !== this.props.apiSelectRows) {
      this.getApiData(nextProps.apiSelectRows);
    }
  };

  getApiData = (apiSelectRows = []) => {
    if (!apiSelectRows.length) {
      this.setState({
        data: [],
      });
      return false;
    }
    const { paramsDocs, id } = apiSelectRows[0];
    if (paramsDocs) {
      let newParamsDocs =
        typeof paramsDocs === "string" ? JSON.parse(paramsDocs) : paramsDocs;
      newParamsDocs = newParamsDocs.map((item) => {
        const obj = {
          ...item,
          paramsId: item.fieldId,
          paramsValue: item.sampleValue || "",
          id: item.id,
          paramsName: item.fieldName,
          paramsType: item.fieldType,
        };
        if (item.children && item.children.length) {
          obj.children = this.dealData(
            item.children,
            "sampleValue",
            "fieldName",
            "fieldType"
          );
        }
        return obj;
      });
      this.setState({
        data: newParamsDocs,
        configId: id,
      });
    } else {
      this.setState({
        data: [],
      });
    }
  };

  dealData = (arr = [], paramsValue = "", paramsName, fieldType) => {
    return arr.map((item) => {
      const obj = {
        paramsId: item.fieldId,
        paramsValue: item[paramsValue] || "",
        id: item.id,
        paramsName: item[paramsName],
        paramsType: item[fieldType],
      };
      if (item.children && item.children.length) {
        obj.children = this.dealData(
          item.children,
          paramsValue,
          paramsName,
          fieldType
        );
      }
      return obj;
    });
  };

  getMasterApiData = (arr = []) => {
    if (!arr.length) {
      return [];
    }
    const newParamsDocs = arr.map((item) => {
      const obj = {
        ...item,
        paramsId: item.fieldId,
        paramsValue: item.fieldValue || "",
        paramsName: item.fieldName,
        paramsType: item.fieldType,
      };
      if (item.children && item.children.length) {
        obj.children = this.dealData(
          item.children,
          "fieldValue",
          "fieldName",
          "fieldType"
        );
      }
      return obj;
    });
    return newParamsDocs;
  };

  getData = () => {
    return this.state.data;
  };

  importParams = () => {
    if (this.serviceId === undefined) {
      AjaxUtils.showError(
        "只有选择一个API才可以导入参数,未注册API不支持导入参数!"
      );
      return;
    }
    let url = importApiParamsUrl + "?serviceId=" + this.serviceId;
    this.setState({ mask: true });
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (data.inParams.length == 0) {
          AjaxUtils.showInfo("未找到API的输入参数!");
        }
        /* const newData = data.inParams.map(item =>({...item,fieldId: item.paramsId, sampleValue:item.paramsValue})) */
        this.setState({ data: data.inParams, visible: false });
      }
    });
  };

  renderEditText(index, key, text, placeholder, record) {
    if (record == undefined || this.state.currentRecordId !== record.id) {
      return text;
    }
    return (
      <EditText
        value={text}
        size="default"
        placeholder={placeholder}
        onChange={(value) => this.handleChange(key, index, value, record)}
        options={{ style: { width: "70%" } }}
      />
    );
  }

  renderParamsValue(index, key, text, placeholder, record) {
    if (record == undefined || this.state.currentRecordId !== record.id) {
      return text;
    }
    let url =
      selectExportParams +
      "?processId=" +
      this.processId +
      "&currentNodeId=" +
      this.nodeId;
    return (
      <AjaxEditSelect
        value={text}
        url={url}
        onChange={(value) => this.handleChange(key, index, value, record)}
      />
    );
  }

  renderProcessRules(index, key, text, record) {
    if (record == undefined || this.state.currentRecordId !== record.id) {
      if (text !== "" && text !== undefined) {
        if (record.paramsRuleShow) {
          return <Tag color="blue">{record.paramsRuleShow}</Tag>;
        } else {
          return <Tag color="blue">{text}</Tag>;
        }
      } else {
        return "";
      }
    }
    let data = [];
    return (
      <TreeNodeSelect
        url={this.applicationRuleSelectUrl}
        options={{
          showSearch: true,
          multiple: false,
          allowClear: true,
          treeNodeFilterProp: "label",
        }}
        value={text}
        size="small"
        onChange={(value, label) =>
          this.handleChange(key, index, value, record, label)
        }
      />
    );
  }

  renderEditTextArea(index, key, text, placeholder) {
    if (text === undefined || text === "undefined") {
      text = "";
    }
    if (record == undefined || this.state.currentRecordId !== record.id) {
      return text;
    }
    text = AjaxUtils.formatJson(text).trim(); //如果是json则进行转换
    return (
      <EditTextArea
        value={text}
        size="default"
        placeholder={placeholder}
        onChange={(value) => this.handleChange(key, index, value)}
      />
    );
  }

  renderFieldType(index, key, text, placeholder, record) {
    if (record == undefined || this.state.currentRecordId !== record.id) {
      return text;
    }
    let data = [
      { text: "string", value: "string" },
      { text: "json", value: "json" },
      { text: "file", value: "file" },
      { text: "int", value: "int" },
      { text: "long", value: "long" },
      { text: "boolean", value: "boolean" },
      { text: "date", value: "date" },
      { text: "datetime", value: "datetime" },
      { text: "float", value: "float" },
      { text: "double", value: "double" },
    ];
    return (
      <EditSelect
        value={text}
        data={data}
        options={{ mode: "combobox" }}
        size="small"
        onChange={(value) => this.handleChange(key, index, value, record)}
      />
    );
  }

	renderFieldType(index, key, text, placeholder,record) {
    if(record == undefined || this.state.currentRecordId !== record.id){return text;}
    let data=[{text:"string",value:'string'},{text:"json",value:'json'},{text:"file",value:'file'},{text:"int",value:'int'},{text:"long",value:'long'},{text:"boolean",value:'boolean'},{text:"date",value:'date'},{text:"datetime",value:'datetime'},{text:"float",value:'float'},{text:"double",value:'double'}];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value, record)} />);
  }

  deleteRow = (id, data = this.state.data) => {
    for (var index in data) {
      if (data[index].id == id) {
        data.splice(index, 1);
        return;
      } else if (data[index].children !== undefined) {
        this.deleteRow(id, data[index].children);
      }
    }
    this.deleteBlankChildrenRow(data);
  };

  deleteBlankChildrenRow = (data) => {
    for (var index in data) {
      if (data[index].children !== undefined && data[index].children == 0) {
        delete data[index].children;
      }
    }
  };

  handleChange = (key, index, value, record, selectLabel) => {
    record[key] = value;
    record["paramsRuleShow"] = selectLabel;
    this.setState({ newIdNum: 0 });
  };

  addRow = () => {
    //新增加一行
    let key = this.state.data.length + 1;
    let newRow = {
      id: key,
      paramsName: "",
      paramsValue: "",
      paramsSource: "AUTO",
      paramsId: "",
    };
    let newData = this.state.data;
    newData.push(newRow);
    this.setState({ data: newData, curEditIndex: -1, newIdNum: key });
  };

  //添加一个子字段
  addSubRow = (record) => {
    let key = AjaxUtils.guid();
    if (record.children == undefined) {
      record.children = [];
    }
    record.children.push({
      id: key,
      paramsName: "",
      paramsValue: "",
      paramsSource: "AUTO",
      paramsId: "",
    });
  };

  //在指定行上面插入一行
  insertRow = (id, data = this.state.data) => {
    for (var index in data) {
      if (data[index].id == id) {
        let newRow = {
          id: AjaxUtils.guid(),
          paramsName: "",
          paramsValue: "",
          paramsSource: "AUTO",
          paramsId: "",
        };
        data.splice(index, 0, newRow);
        return;
      } else if (data[index].children !== undefined) {
        this.insertRow(id, data[index].children);
      }
    }
  };

  upRecord = (id, arr) => {
    for (var index in arr) {
      if (arr[index].id == id) {
        if (index == 0) {
          return;
        }
        arr[index] = arr.splice(index - 1, 1, arr[index])[0];
        return;
      } else if (arr[index] != undefined && arr[index].children !== undefined) {
        this.upRecord(id, arr[index].children);
      }
    }
  };

  downRecord = (id, arr) => {
    for (var index in arr) {
      if (arr[index].id == id) {
        if (index == arr.length - 1) {
          return;
        }
        arr[index] = arr.splice(index + 1, 1, arr[index])[0];
        return;
      } else if (arr[index] != undefined && arr[index].children !== undefined) {
        this.upRecord(id, arr[index].children);
      }
    }
  };

  onRowClick = (record, index) => {
    /* this.setState({curEditIndex:index}); */
    this.setState({
      curEditIndex: index,
      currentRecord: record,
      currentRecordId: record.id,
    });
  };

  refrash = () => {
    this.setState({ curEditIndex: -1 });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  showModal = (action, record) => {
    this.setState({ visible: true, action: action, currentRecord: record });
  };

  closeModal = (newRowData) => {
    if (newRowData === false || !newRowData.id) {
      return;
    }
    this.setState({ visible: false, curEditIndex: -1, currentRecordId: -1 });
    let data = [...this.state.data];
    data.forEach((item, index) => {
      if (item.id === newRowData.id) {
        data[index] = newRowData;
      } else {
        if (item.children && item.children.length) {
          item.children = this.getChildData(item.children, newRowData);
        }
      }
    });
    this.setState({ data: data });
  };

  getChildData = (arr, newRowData) => {
    if (!newRowData.id) {
      return false;
    }
    return arr.map((item, index) => {
      if (item.id === newRowData.id) {
        item = { ...item, ...newRowData };
      } else {
        if (item.children && item.children.length) {
          item.children = this.getChildData(item.children, newRowData);
        }
      }
      return item;
    });
  };

  handleModalCancel = () => {
    this.setState({ masterDataModalVisible: false });
  };

  chooseMaster = () => {
    this.getMasterData({
      pageSize: 15,
      current: 1,
      showSizeChanger: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    });
    this.setState({ masterDataModalVisible: true });
  };

  handleModalOk = () => {
    const { selectedRowKeys } = this.state;
    if (!selectedRowKeys.length) {
      AjaxUtils.showInfo("请选择主数据！");
      return false;
    }
    if (selectedRowKeys.length > 1) {
      AjaxUtils.showInfo("只能选择一条主数据！");
      return false;
    }
    this.getMsaterFieldsData(selectedRowKeys[0]);
    this.setState({ masterDataModalVisible: false });
  };

  getMsaterFieldsData = (id) => {
    let url = LIST_MASTER_FIELDS_URL + "?id=" + id;
    AjaxUtils.get(url, (data) => {
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (!data.length) {
          AjaxUtils.showError("主数据未配置参数，无法选择！");
          return false;
        }
        this.setState({ data: this.getMasterApiData(data) });
      }
    });
  };

  //通过ajax远程载入数据
  search = (value) => {
    let filters = {};
    let sorter = {};
    let searchFilters = {};
    searchFilters = { configName: value, configId: value };
    sorter = { order: "ascend", field: "createTime" };
    this.getMasterData(
      {
        pageSize: 15,
        current: 1,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
      },
      filters,
      sorter,
      searchFilters
    );
    /* GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters); */
  };

  onPageChange = (pagination, filters, sorter) => {
    this.getMasterData(pagination, filters, sorter);
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: selectedRowKeys,
      selectedRows: selectedRows,
    });
  };

  handleJsonCancel = () => {
    this.setState({
      jsonVisible: false,
      jsonValue: "",
    });
  };

  handleJsonOk = () => {
    let newJson = {};
    try {
      newJson = { ...JSON.parse(this.state.jsonValue) };
      const dataArr = this.dealJsonData(newJson);
      if (dataArr) {
        this.setState({
          data: dataArr,
        });
		this.handleJsonCancel();
      }
    } catch (err) {
      console.log(err);
      AjaxUtils.showError("请输入正确的JSON格式！");
      return false;
    }
    
  };

  dealJsonData = (json = {}) => {
    const newArr = [];
    let flag = false;
    for (const key in json) {
      if (json[key] instanceof Object || json[key] instanceof Array) {
        flag = true;
        AjaxUtils.showError("key值不能是对象或者数组，只能为基本数据类型！");
        return;
      }
      newArr.push({
        paramsId: key,
        paramsValue: json[key],
        id: AjaxUtils.guid(),
      });
    }
    return newArr;
  };

  jsonExport = () => {
    this.setState({
      jsonVisible: true,
    });
  };

  handleJsonChange = (e) => {
    this.setState({
      jsonValue: e.target.value,
    });
  };

  jsonFormat = () => {
    let newJson = {};
    try {
      newJson = { ...JSON.parse(this.state.jsonValue) };
      newJson = JSON.stringify(newJson, null, 4);
      this.setState({
        jsonValue: newJson,
      });
    } catch (err) {
      AjaxUtils.showError("请输入正确的JSON格式！");
      return false;
    }
  };

	handleJsonCancel = () => {
		this.setState({
			jsonVisible: false,
			jsonValue: ''
		})
	}

	

	handleJsonOk = () => {
		let newJson = {}
		try{
			newJson={...JSON.parse(this.state.jsonValue)}
			const dataArr = this.dealJsonData(newJson)
			this.setState({
				data: dataArr
			})
		} catch(err){
			AjaxUtils.showError('请输入正确的JSON格式！')
			return false
		}
		this.handleJsonCancel()
	}

	dealJsonData = (json={}) => {
		const newArr = []
		for(const key in json) {
			newArr.push({'paramsId':key,'paramsValue':json[key],id:AjaxUtils.guid()})
		}
		return newArr
	}

	jsonExport = () =>{
		this.setState({
			jsonVisible: true
		})
	}

	handleJsonChange = (e) => {
		this.setState({
			jsonValue:e.target.value
		})
	}

	jsonFormat = () => {
		let newJson = {}
		try{
			newJson={...JSON.parse(this.state.jsonValue)}
			newJson = JSON.stringify(newJson, null, 4)
			this.setState({
				jsonValue: newJson
			})
		} catch(err){
			AjaxUtils.showError('请输入正确的JSON格式！')
			return false
		}
	}

  render() {
    const { data, action, masterDataModalVisible, rowsData, pagination } =
      this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      type: "radio",
    };
    const columns = [
      {
        title: "参数id",
        dataIndex: "paramsId",
        render: (text, record, index) =>
          this.renderEditText(index, "paramsId", text, undefined, record),
        width: "20%",
      },
      {
        title: "参数值",
        dataIndex: "paramsValue",
        render: (text, record, index) =>
          this.renderParamsValue(index, "paramsValue", text, undefined, record),
        width: "18%",
      },
      {
        title: "参数类型",
        dataIndex: "paramsType",
        render: (text, record, index) =>
          this.renderFieldType(index, "paramsType", text, undefined, record),
        width: "11%",
      },
      {
        title: "绑定计算规则",
        dataIndex: "paramsRule",
        render: (text, record, index) =>
          this.renderProcessRules(index, "paramsRule", text, record),
        width: "20%",
      },
      {
        title: "备注",
        dataIndex: "paramsName",
        render: (text, record, index) =>
          this.renderEditText(index, "paramsName", text, undefined, record),
        width: "16%",
      },
      {
        title: "操作",
        dataIndex: "action",
        width: "10%",
        render: (text, record, index) => {
          return (
            <span>
              <a onClick={() => this.deleteRow(record.id)}>删除</a>|{" "}
              <a onClick={() => this.addSubRow(record)}>子项</a>|{" "}
              <a onClick={() => this.insertRow(record.id)}>插入</a>
            </span>
          );
        },
      },
      {
        title: "排序",
        dataIndex: "sortNum",
        width: "5%",
        render: (text, record, index) => {
          return (
            <span>
              <Icon
                type="arrow-up"
                style={{ cursor: "pointer" }}
                onClick={this.upRecord.bind(this, record.id, this.state.data)}
              />
              <Icon
                type="arrow-down"
                style={{ cursor: "pointer" }}
                onClick={this.downRecord.bind(this, record.id, this.state.data)}
              />
            </span>
          );
        },
      },
    ];
    const masterColumns = [
      {
        title: "主数据名称",
        dataIndex: "configName",
        width: "10%",
        sorter: true,
      },
      {
        title: "唯一ID",
        dataIndex: "id",
        /* width: '20%', */
      },
      {
        title: "版本",
        dataIndex: "version",
        /* width: '8%', */
        ellipsis: true,
      },
      {
        title: "所属系统",
        dataIndex: "systemName",
        /* width: '10%', */
        ellipsis: true,
      },
    ];
    const expandedRow = (record) => {
      return (
        <Card bodyStyle={{ padding: 8 }}>
          <EditApiInputParamsMasterTable id={record.id} />
        </Card>
      );
    };
    let content;
    if (action == "more") {
      content = (
        <EditServiceMoreParams
          currnetEditRow={this.state.currentRecord}
          configId={this.state.configId}
          close={this.closeModal}
        />
      );
    }

    return (
      <div>
				<Modal  title='从JSON导入' maskClosable={false}
            width='1000px'
            style={{ top: 20 }}
            visible={this.state.jsonVisible}
            onCancel={this.handleJsonCancel}
            onOk={this.handleJsonOk}
            cancelText='关闭'
            okText='确认'
            >
            <Input.TextArea  style={{height:'280px'}} value={this.state.jsonValue} onChange={this.handleJsonChange}/>
            <Button type='link' onClick={this.jsonFormat}>JSON格式化</Button>
        </Modal>
        <Modal
          title="从JSON导入"
          maskClosable={false}
          width="1000px"
          style={{ top: 20 }}
          visible={this.state.jsonVisible}
          onCancel={this.handleJsonCancel}
          onOk={this.handleJsonOk}
          cancelText="关闭"
          okText="确认"
        >
          <Input.TextArea
            style={{ height: "280px" }}
            value={this.state.jsonValue}
            onChange={this.handleJsonChange}
          />
          <Button type="link" onClick={this.jsonFormat}>
            JSON格式化
          </Button>
        </Modal>
        <Modal
          title="主数据"
          maskClosable={false}
          visible={masterDataModalVisible}
          width="1200px"
          style={{ top: 20, minHeight: 400 }}
          footer=""
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}
        >
          <Row style={{ marginBottom: 20 }} gutter={0}>
            <Col span={12}>
              <span style={{ float: "left" }}>
                搜索:
                <Search
                  placeholder="主数据名称"
                  style={{ width: 260 }}
                  onSearch={(value) => this.search(value)}
                />
              </span>
            </Col>
            <Col span={12}></Col>
          </Row>
          <Table
            bordered={false}
            rowKey={(record) => record.id}
            rowSelection={rowSelection}
            dataSource={rowsData}
            columns={masterColumns}
            onChange={this.onPageChange}
            pagination={pagination}
            expandedRowRender={expandedRow}
          />
          <div style={{ textAlign: "right", marginTop: 20 }}>
            {/* <Popconfirm onConfirm={this.handleModalOk} title='确定选择吗？' cancelText='取消' okText='确认'></Popconfirm> */}
            <Button type="primary" onClick={this.handleModalOk}>
              确定
            </Button>{" "}
            <Button onClick={this.handleModalCancel}>取消</Button>
          </div>
        </Modal>
        <Drawer
          key={Math.random()}
          title="API输入参数配置"
          placement="right"
          width="960px"
          closable={false}
          onClose={this.handleCancel}
          visible={this.state.visible}
        >
          {content}
        </Drawer>
        <Button
          onClick={this.addRow}
          type="primary"
          icon="plus"
          style={{ marginBottom: "5px" }}
        >
          添加参数
        </Button>{" "}
        <Button onClick={this.chooseMaster} icon="plus-square">
          选择主数据
        </Button>{" "}
        <Button onClick={this.jsonExport} icon="plus-square">
          从JSON导入
        </Button>{" "}
        <Table
          loading={this.state.mask}
          rowKey={(record) => record.id}
          dataSource={data}
          columns={columns}
          onRowClick={this.onRowClick}
          pagination={false}
          size="small"
        />
      </div>
    );
  }
}

export default ApiNodeParamsConfig;
