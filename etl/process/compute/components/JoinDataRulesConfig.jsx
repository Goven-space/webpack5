import React from "react";
import {
  Table,
  Button,
  Select,
	message,
} from "antd";
import EditText from "../../../../core/components/EditText";
import AjaxSelect from "../../../../core/components/AjaxSelect";
import * as URI from "../../../../core/constants/RESTURI";
import * as AjaxUtils from "../../../../core/utils/AjaxUtils";

const ColumnsURL = URI.ETL.PROCESSNODE.prevnodeColumnsConfig;
const Option = Select.Option;
const ButtonGroup = Button.Group;
const ruleSelectUrl = URI.ETL.RULE.select;

class JoinDataRulesConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm = this.props.parentForm;
    this.processId = this.props.processId;
    this.pNodeId = this.props.pNodeId;
		this.getNodeIds=this.props.getNodeIds;
    this.updateFieldMapConfigs = this.props.updateFieldMapConfigs;
    this.ruleSelectUrl =
      ruleSelectUrl + "?applicationId=" + this.props.applicationId;
    this.state = {
      selectedRowKeys: [],
      loading: false,
      curEditIndex: -1,
      data: [],
      targetColIds: [],
      sourceColIds: [],
      newIdNum: 0,
      deleteIds: [],
			selectOpt_a:[],
			selectOpt_b:[],
    };
  }

  componentDidMount() {
		if(this.props.joinNodeIds_a) {
			this.getSelectOpt('selectOpt_a',this.props.joinNodeIds_a)
		}
		if(this.props.joinNodeIds_b) {
			this.getSelectOpt('selectOpt_b',this.props.joinNodeIds_b)
		}
		if(this.props.tableDataStr) {
			this.reviewTable()
		}
	}

	componentDidUpdate(prevProps) {
		if(!this.props.joinNodeIds_a && !this.props.joinNodeIds_b) {
			AjaxUtils.showError('请先在基本属性中配置指定A表字段和B表字段！')
			return false
		}
		if(prevProps.joinNodeIds_a!==this.props.joinNodeIds_a) {
			this.getSelectOpt('selectOpt_a',this.props.joinNodeIds_a)
		}
		if(prevProps.joinNodeIds_b!==this.props.joinNodeIds_b) {
			this.getSelectOpt('selectOpt_b',this.props.joinNodeIds_b)
		}
	}

	reviewTable = () => {
		let {joinRulesFlag, tableDataStr} = this.props
		const initTableData = []
		const splitData = []
		if(tableDataStr){
			tableDataStr.split(joinRulesFlag).forEach(item => {
				splitData.push(item.split('='))
			})
			// console.log(splitData);
			splitData.forEach(item => {
				const obj = {key:AjaxUtils.guid()}
				item.forEach((subItem)=>{
					if(subItem.includes('a.')) {
						obj['sourceNodeId_a'] = subItem.trim().substring(2)
					}
					if(subItem.includes('b.')) {
						obj['sourceNodeId_b'] = subItem.substring(2)
					}
				})
				initTableData.push(obj)
			})
			this.setState({
				data:initTableData
			})
		}
	}



	getSelectOpt = (flag,nodeId,) => {
		let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+nodeId;
		AjaxUtils.get(url,(data)=>{
			if(data.state===false){
				message.error(data.msg);
			}else{
				if(data){
					this.setState({[flag]:data.map(item => {
              let colId=item['colId'];
              let colName=item['colName'];
              if(!colName){colName=colId}
              return <Option key={AjaxUtils.guid()} value={colId}>{colName}</Option>;
            }
          )});
				}
			}
		});
	}

  refresh = (e) => {
    e.preventDefault();
    this.setState({ curEditIndex: -1 });
  };

  handleChange = (key, index, value, label, extra) => {
    const { data } = this.state;
    if (value instanceof Array) {
      value = value.join(","); //数组转为字符串
    }
    data[index][key] = value;
    if (label !== undefined) {
      data[index]["ruleName"] = label;
    }
    // console.log("key="+key+" index="+index+" value="+value);
    this.setState({ data });
  };

  renderSourceColId(index, key, text, record, selectOpt=[]) {
    if (index !== this.state.curEditIndex) {
      return text;
    }
		if(!this.props.joinNodeIds_a){
			return text
		}
    return (
      <AjaxSelect
        value={text}
        options={{ mode: "combobox" }}
        size="small"
				selectOpt={selectOpt}
        onChange={(value) => this.handleChange(key, index, value)}
      />
    );
  }

  renderEditText(index, key, text, record, placeholder) {
    if (index !== this.state.curEditIndex) {
      return text;
    }
    return (
      <EditText
        value={text}
        size="small"
        placeholder={placeholder}
        onChange={(value) => this.handleChange(key, index, value)}
      />
    );
  }

  deleteRow = (id) => {
    if (id !== undefined && id !== "" && id !== null) {
      let data = this.state.data.filter((dataItem) => dataItem.key !== id);
      this.setState({ data });
    }
  };

  insertRow = () => {
    //新增加一行
    let key = AjaxUtils.guid();
    let newData = this.state.data;
    let newRow = { key: key, transfer: true };
    newData.push(newRow);
    this.setState({ data: newData, curEditIndex: -1, newIdNum: key });
  };

  onRowClick = (record, index) => {
    this.setState({ curEditIndex: index });
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys });
  };

  render() {
    /* this.updateFieldMapConfigs(this.state.data); */ //更新节点中的数据
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const { data, configFormId } = this.state;

    let columns = [
      {
        title: "A表字段",
        dataIndex: "sourceNodeId_a",
        width: "30%",
        render: (text, record, index) =>
          this.renderSourceColId(index, "sourceNodeId_a", text, record, this.state.selectOpt_a),
      },
      {
        title: "运算符",
        dataIndex: "symbol",
        width: "10%",
        render: (text, record, index) => '='
      },
      {
        title: "B表字段",
        dataIndex: "sourceNodeId_b",
        width: "30%",
        render: (text, record, index) =>
          this.renderSourceColId(index, "sourceNodeId_b", text, record, this.state.selectOpt_b),
      },
      {
        title: "删除",
        dataIndex: "action",
        width: "5%",
        render: (text, record, index) => {
          return (
            <span>
              <a onClick={() => this.deleteRow(record.key)}>删除</a>
            </span>
          );
        },
      }
    ];


    return (
      <div>
        <div style={{ paddingBottom: 10 }}>
          <ButtonGroup>
            <Button type="primary" onClick={this.insertRow} icon="plus">
              新增条件
            </Button>
            <Button type="ghost" onClick={this.refresh} icon="reload">
              刷新
            </Button>
          </ButtonGroup>{" "}
        </div>
        <Table
          bordered
          rowKey={(record) => record.key}
          dataSource={data}
          columns={columns}
          onRowClick={this.onRowClick}
          loading={this.state.loading}
          pagination={false}
          size="small"
        />
      </div>
    );
  }
}

export default JoinDataRulesConfig;
