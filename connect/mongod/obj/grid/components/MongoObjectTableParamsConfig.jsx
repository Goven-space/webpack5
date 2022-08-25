import React from 'react';
import { Table, Tooltip, Button, message, Modal, InputNumber, Icon, Select, Tag, Checkbox, Radio, Tabs } from 'antd';
import EditText from '../../../../../core/components/EditText';
import EditSelect from '../../../../../core/components/EditSelect';
import * as URI from '../../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../../core/utils/GridUtils';
import ListServicesByModelId from '../../../../../designer/designer/grid/ListApisByFilters';

const TabPane = Tabs.TabPane;
const LIST_VALIDATE_BEANS = URI.CORE_DATAMODELS.validateBeans;
const FULL_URL = URI.CONNECT.MONGOD.fullConfig;
const SAVE_URL = URI.CONNECT.MONGOD.saveField
const GET_TableColumnsURL = URI.CONNECT.MONGOD.parseField;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class MongoObjectTableParamsConfig extends React.Component {
  constructor(props) {
    super(props);
    this.coreField = this.props.coreField;
    this.parentId = this.props.id;
    this.objectId = this.props.objectId;
    this.modelName = this.props.modelName;
    this.keyId = this.props.keyId;
    this.appId = this.props.appId;
    this.dbType = this.props.dbType;
    this.loadObject=this.props.loadData;
    this.state = {
      coreFieldId: null,
      configFormId: '',
      modalVisible: false,
      modalTitle: '属性定义',
      selectedRowKeys: [],
      loading: false,
      curEditIndex: -1,
      data: [],
      newIdNum: 0,
      deleteIds: [],
    };
  }

  componentDidMount() {
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData = () => {
    this.setState({ deleteIds: [] });
    let url = FULL_URL + "/" + this.objectId;
    AjaxUtils.get(url, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        let coreFieldId = null;
        this.setState({ data: data.columnConfigList });
        data.columnConfigList.forEach(function (item, index, array) {
          if (item.primaryKey === true) {
            coreFieldId = item.colId;
          }
        });
        if (coreFieldId === null) {
          this.setState({ coreFieldId: null });
        } else {
          this.setState({ coreFieldId: coreFieldId });
        }

      }
    });
  }

  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData = () => {
    this.setState({ curEditIndex: -1 });
    let url = SAVE_URL;
    let postData = this.state.data;
    let flag=false;
    postData.forEach(function (item, index, array) {
     let colId= item.colId
      if (colId === null||colId===""||colId===undefined) {
        flag=true;
      }
    });
    if(flag){
      message.error("字段配置中字段ID不能为空")
    }else{
      this.saveMongoObjectFieldGridData(this, url, this.state.coreFieldId, postData, this.objectId);
    }
    this.loadObject();
  }

  saveMongoObjectFieldGridData=(thisobj,url,keyId,NewAndEditData,objectId)=>{
    let self=thisobj;
    let postStr={GridData:JSON.stringify(NewAndEditData),keyId:keyId,objectId:objectId};
    self.setState({loading:true});
    // console.log(postStr);
    AjaxUtils.post(url,postStr,(data)=>{
      if(data.state===false){
        if(data.msg!==undefined && data.msg!==''){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showError();
        }
      }else if(data.state===true){
          AjaxUtils.showInfo("保存成功");
      }
      self.setState({loading:false});
      
    });
  }

  refresh = (e) => {
    e.preventDefault();
    this.setState({ curEditIndex: -1 });
    this.loadData();
  }

  renderDefaultValue(index, key, text) {
    if (index !== this.state.curEditIndex) {
      if (text !== undefined && text !== '' && text !== null) {
        return <Icon type="edit" />;
      } else {
        return '';
      }
    }
    return (<div><a href="javascript:void(0)" onClick={this.showModal.bind(this, 'DefaultValueConfig')} >设置</a></div>);
  }

  renderFieldType(index, key, text) {
    if (index !== this.state.curEditIndex) { return text; }
    let data = [
      { text: "varchar", value: 'varchar' },
      { text: "nvarchar", value: 'nvarchar' },
      { text: "char", value: 'char' },
      { text: "date", value: 'date' },
      { text: "datetime", value: 'datetime' },
      { text: "float", value: 'float' },
      { text: "int", value: 'int' },
      { text: "smallint", value: 'smallint' },
      { text: "bigint", value: 'bigint' },
      { text: "bit", value: 'bit' },
      { text: "numeric", value: 'numeric' },
      { text: "text", value: 'text' },
      { text: "longvarchar", value: 'longvarchar' },
      { text: "clob", value: 'clob' },
    ];
    return (<EditSelect value={text} data={data} options={{ mode: 'combobox' }} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text) {
    if (index !== this.state.curEditIndex) { return text; }
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderColId(index, key, text) {
    if (index !== this.state.curEditIndex) {
      if (text === this.state.coreFieldId) {
        return <span style={{ color: 'red', fontWeight: 'bold' }}>{text}</span>
      } else{return text;}
      }else{
        return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
      }

  }

  renderInputNumber(index, key, text) {
    if (index !== this.state.curEditIndex) { return text; }
    return <InputNumber min={1} size='small' defaultValue={50} value={text} onChange={value => this.handleChange(key, index, value)} />;
  }

  renderAjaxSelect(index, key, text, url) {
    if (index !== this.state.curEditIndex) { return text; }
    return (<EditSelect value={text} size='small' url={url} options={{ showSearch: true, size: "small" }} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderYNSelect(index, key, text) {
    if (index !== this.state.curEditIndex) {
      if (text) { return <Tag color='blue'>是</Tag>; } else { return <Tag>否</Tag>; }
    }
    let data = [{ text: "是", value: true }, { text: "否", value: false }];
    return (<EditSelect value={text} size='small' data={data} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e) => this.handleChange(key, index, e.target.checked)}  ></Checkbox>);
  }
  corefieldCheckBox(index, key, text, record) {
    return (<Checkbox checked={text} onChange={(e) => this.coreFieldhandleChange(key, index, e.target.checked, record.colId)} disabled={this.state.coreFieldId === null ? false : (this.state.coreFieldId === record.colId ? false : true)}></Checkbox>);
  }
  upRecord = (arr, index) => {
    if (index === 0) { return; }
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if (index === arr.length - 1) { return; }
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
  }

  handleChange = (key, index, value) => {
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag = true; //标记为已经被修改过
    // this.setState({ data });
  }
  coreFieldhandleChange = (key, index, value, coldId) => {

    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag = true;
    this.setState({ data });
    if (value === true) { this.setState({ coreFieldId: coldId }) }
    else { this.setState({ coreFieldId: null }) }
  }

  onRowClick = (record, index) => {
    this.setState({ curEditIndex: index });
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys });
  }

  loadFromTable = () => {
    let url = GET_TableColumnsURL + "?objectId=" + this.objectId;
    this.setState({ loading: true });
    AjaxUtils.get(url, (data) => {
      //如果当前配置中的colName已经有值的情况下重新载入时不能删除
      this.setState({ loading: false })
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        let oldData = this.state.data;
        data.forEach(function (item, index, array) {
          for (let i = 0; i < oldData.length; i++) {
            if (oldData[i].colId.toLowerCase() === item.colId.toLowerCase()) {
              item.colName = oldData[i].colName;
              item.editHidden = oldData[i].editHidden;
            }
          }
        });
        this.setState({ data: data, newIdNum: data.length + 1, coreFieldId: null });
      }

    });
  }

  handleRadioChange = (e) => {
    let value = e.target.value;
    let { data } = this.state;
    data.forEach(function (item, index, array) {
      if (value === 'AllHidden') {
        item.editHidden = true;
        item.EditFlag = true;
      } else {
        item.editHidden = false;
        item.EditFlag = true;
      }
    });
    this.setState({ data: data, hiddenType: value });
  }
  insertRow = () => {
    //新增加一行
    let newData = this.state.data;
    let key = newData.length + 1;
    let newRow = { id: key, urlConfigId: this.configId, EditFlag: true, fieldType: 'string', breakFlag: true, required: false, in: 'query', defaultValue: '', maxLength: '0', minLength: '0', order: newData.length + 1 };
    newData.push(newRow);
    this.setState({ data: newData, curEditIndex: -1, newIdNum: key });
  }
  deleteRow = (id) => {
    //删除选中行
    let deleteIds = this.state.deleteIds;
    if (id !== undefined && id !== "" && id !== null) {
      if (id.length > 10) {
        deleteIds.push(id);
      }
      let data = this.state.data.filter((dataItem) => dataItem.id !== id);
      this.setState({ data, deleteIds });
    }
  }
  render() {
    const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange };
    const { data, configFormId } = this.state;
    const columns = [
      {
        title: '字段Id',
        dataIndex: 'colId',
        width: '20%',
        render: (text, record, index) => this.renderColId(index, 'colId', text),
      }, {
        title: '字段说明',
        dataIndex: 'colName',
        width: '20%',
        render: (text, record, index) => this.renderEditText(index, 'colName', text),
      }, {
        title: '类型',
        dataIndex: 'colType',
        width: '15%',
        render: (text, record, index) => this.renderFieldType(index, 'colType', text),
      },
      {
        title: '主字段',
        dataIndex: 'primaryKey',
        width: '5%',
        render: (text, record, index) => this.corefieldCheckBox(index, 'primaryKey', text, record),
      }, {
        title: '操作',
        dataIndex: 'action',
        width: '5%',
        render: (text, record, index) => {
          return (<span><a onClick={() => this.deleteRow(record.id)}>删除</a></span>);
        },
      }
      // {
      //   title: '排序',
      //   dataIndex: 'sort',
      //   width: '5%',
      //   render: (text, record, index) => {
      //     return (<span><Icon type="arrow-up" style={{ cursor: 'pointer' }} onClick={this.upRecord.bind(this, this.state.data, index)} />
      //       <Icon type="arrow-down" style={{ cursor: 'pointer' }} onClick={this.downRecord.bind(this, this.state.data, index)} /></span>);
      //   },
      // }
    ];

    return (

      <div>
        <div style={{ paddingBottom: 10 }} >
          <ButtonGroup >
            <Button type="primary" onClick={this.saveData} icon="save" >保存</Button>
            <Button onClick={this.insertRow} icon="plus-circle-o"  >新增字段</Button>
            <Tooltip placement="topLeft" title="解析表字段，会解析数据表中第一条数据结构的第一层字段"><Button onClick={this.loadFromTable} icon="select">解析表字段</Button></Tooltip>
            <Button type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
          </ButtonGroup>
        </div>
        <Table
          bordered
          rowKey={record => record.id}
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
export default MongoObjectTableParamsConfig;
