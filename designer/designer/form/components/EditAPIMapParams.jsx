import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Tag,Modal,Col,Row,Select,Input,Checkbox,Card,Icon} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import EditAPIMoreParams from './EditAPIMoreParams';
import EditApiInputParamsMasterTable from '../../grid/EditApiInputParamsMasterTable';

const Option = Select.Option;
const ButtonGroup = Button.Group;

const InPARAMS_URL = URI.SERVICE_INPARAMS_CONFIG.inparams_list;
const LIST_MASTER_URL = URI.CORE_MasterData.list;
const LIST_VALIDATE_BEANS=URI.SERVICE_PARAMS_CONFIG.validateBeans;
/* const LIST_URL=URI.SERVICE_PARAMS_CONFIG.list; */
const LIST_MASTER_FIELDS_URL=URI.CORE_MasterData.fields;
const LIST_URL = URI.SERVICE_INPARAMS_CONFIG.list;
const SAVE_URL=URI.SERVICE_PARAMS_CONFIG.save;
const confirm = Modal.confirm;
const Search = Input.Search;

class EditAPIMapParams extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.id;
    this.appId=this.props.appId;
    this.state = {
      loading:false,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      currnetEditRow:{},
      visible:false,
      annotationStr:'',
      masterDataModalVisible: false,
      pagination: { pageSize: 15, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
    };
  }

  /* 父级调用 */
  setParamsJsonData=(data) => {
    data.forEach((item,index,arra)=>{
      item.id=index;
    });
    this.setState({data:data});
  }

  //获取所有映射字段的配置json
  getParamsJsonData=()=>{
    return JSON.stringify(this.state.data);
  }

  refresh=()=>{
    this.setState({curEditIndex:-1});
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} options={{style:{width:'70%'}}}/>);
  }

  renderParamDefaultValue(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"用户id",value:"${$userId}"},
      {text:"用户名",value:"${$userName}"},
      {text:"UUID",value:"${$id}"},
      {text:"配置变量",value:"${$config.变量}"},
    ];
    return (<EditSelect value={text} data={data} size='small' options={{mode:'combobox'}} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEnCode(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"不编码",value:0},{text:"编码<>",value:1},{text:"单引号",value:2},{text:"全部",value:3},{text:"UTF-8",value:4}];
    return (<EditSelect value={text} data={data} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderYNSelect(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"string",value:'string'},{text:"json",value:'json'},{text:"file",value:'file'},{text:"int",value:'int'},{text:"long",value:'long'},{text:"boolean",value:'boolean'},{text:"date",value:'date'},{text:"datetime",value:'datetime'},{text:"float",value:'float'},{text:"double",value:'double'}];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderFieldLocation(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"query",value:'query'},{text:"path",value:'path'},{text:"head",value:'head'}];
    return (<EditSelect value={text} data={data} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    if(id!==undefined && id!==""  && id!==null ){
      if(id.length>10){
        deleteIds.push(id);
      }
      let data=this.state.data.filter((dataItem) => dataItem.id!==id);
      this.setState({data,deleteIds});
    }
  }

  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data:data });
  }

  insertRow=()=>{
    //新增加一行
    let newData=this.state.data;
    let key=newData.length+1;
    let newRow={id:key,urlConfigId:this.configId,EditFlag:true,fieldType:'string',breakFlag:true,required:false,in:'query',defaultValue:'',maxLength:'0',minLength:'0',order:newData.length+1};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  editRow=(record,index)=>{
    this.setState({curEditIndex:index,currnetEditRow:record});
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  upRecord = (arr, index) =>{
    if(index === 0) {return;}
    arr[index] = arr.splice(index - 1, 1, arr[index])[0];
  }

  downRecord = (arr, index) => {
    if(index === arr.length -1) {return;}
    arr[index] = arr.splice(index + 1, 1, arr[index])[0];
  }

  closeModal=(newRowData)=>{
    if(newRowData===false){return;}
    this.setState({visible: false,});
    let data=this.state.data;
    data.forEach((item,index)=>{
       if(item.id===newRowData.id){
         data[index]=newRowData;
       }
     });
     this.setState({data:data,curEditIndex:-1});
  }
  showModal=(record)=>{
     this.setState({visible:true,currnetEditRow:record});
  }

  getMasterData = (pagination = this.state.pagination, filters = {}, sorter = {}, searchFilters = {}) => {
    GridActions.loadData(this, LIST_MASTER_URL, pagination, filters, sorter, searchFilters);
  }

  //通过ajax远程载入数据
  search = (value) => {
    let filters = {};
    let sorter = {};
    let searchFilters = {};
    searchFilters = { "configName": value, "configId": value };
    sorter = { "order": 'ascend', "field": 'createTime' };
    this.getMasterData({ pageSize: 15, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }, filters, sorter, searchFilters)
  }

  onPageChange = (pagination, filters, sorter) => {
    this.getMasterData(pagination, filters, sorter);
  }

  chooseMaster = () => {
    this.getMasterData({ pageSize: 15, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` })
    this.setState({ masterDataModalVisible: true })
  }

  handleModalCancel = () => {
    this.setState({ masterDataModalVisible: false, });
  }

  handleModalOk = () => {
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      AjaxUtils.showInfo('请选择主数据！')
      return false
    }
    if (selectedRowKeys.length > 1) {
      AjaxUtils.showInfo('只能选择一条主数据！')
      return false
    }
    this.getMsaterFieldsData(selectedRowKeys[0])
    this.setState({ masterDataModalVisible: false });
  }

  getMsaterFieldsData = (id) => {
    let url=LIST_MASTER_FIELDS_URL+"?id="+id;
    AjaxUtils.get(url,data=>{
      if(data.state === false) {
        AjaxUtils.showError(data.msg)
      }else {
        if(!data.length) {
          AjaxUtils.showError('主数据未配置参数，无法选择！')
          return false
        }
        this.setState({data:data});
      }

    });
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
  }

  render() {
    const { data, masterDataModalVisible, rowsData, pagination } = this.state;
    const columns=[{
      title: '输入参数Id',
      dataIndex: 'fieldId',
      width:'15%',
      render: (text, record, index) => this.renderEditText(index,'fieldId', text,record),
    },{
      title: '参数中文说明',
      dataIndex: 'fieldName',
      width:'15%',
      render: (text, record, index) =>this.renderEditText(index,'fieldName',text),
    },{
      title: '类型',
      dataIndex: 'fieldType',
      width:'8%',
      render: (text, record, index) =>this.renderFieldType(index,'fieldType',text),
    },{
      title: '参数位置',
      dataIndex: 'in',
      width:'8%',
      render: (text, record, index) =>this.renderFieldLocation(index,'in',text),
    },{
      title: '缺省值',
      dataIndex: 'defaultValue',
      width:'15%',
      render: (text, record, index) =>this.renderEditText(index,'defaultValue',text),
    },{
      title: '映射后端Id',
      dataIndex: 'mapFieldId',
      width:'10%',
      render: (text, record, index) => this.renderEditText(index,'mapFieldId', text,record),
    },{
      title: '必填',
      dataIndex: 'required',
      width:'5%',
      render: (text, record, index) => this.renderYNSelect(index, 'required', text),
    },{
      title: '长度',
      dataIndex: 'maxLength',
      width:'4%',
      render: (text, record, index) => this.renderEditText(index, 'maxLength', text),
    },{
      title: '验证提示',
      dataIndex: 'tip',
      width:'8%',
      render: (text, record, index) => this.renderEditText(index,'tip', text),
    },{
      title: '操作',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.id)}>删除</a></span>);
      },
    },{
      title: '更多',
      dataIndex: 'more',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.showModal(record)}>更多</a></span>);
      },
    }];
    const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange };
    const expandedRow=(record)=>{
      return (
        <Card bodyStyle={{padding:8}}>
          <EditApiInputParamsMasterTable id={record.id}  />
        </Card>
        );
    }
    const masterColumns = [{
      title: '主数据名称',
      dataIndex: 'configName',
      width: '10%',
      sorter: true
    }, {
      title: '唯一ID',
      dataIndex: 'id',
      /* width: '20%', */
    }, {
      title: '版本',
      dataIndex: 'version',
      /* width: '8%', */
      ellipsis: true,
    }, {
      title: '所属系统',
      dataIndex: 'systemName',
      /* width: '10%', */
      ellipsis: true,
    }];

    return (
      <div>
        <Modal key={Math.random()} title="编辑更多" maskClosable={false}
          visible={this.state.visible}
          footer=''
          width='800px'
          style={{top:'20px'}}
          onOk={this.handleCancel}
          onCancel={this.handleCancel} >
          <EditAPIMoreParams currnetEditRow={this.state.currnetEditRow} close={this.closeModal} />
        </Modal>
        <Modal
          title="主数据" maskClosable={false} visible={masterDataModalVisible}
          width='1200px'
          style={{ top: 20 }}
          footer=''
          onOk={this.handleModalOk}
          destroyOnClose
          key='masterData'
          onCancel={this.handleModalCancel} >
          <Row style={{ marginBottom: 20 }} gutter={0} >
            <Col span={12} >
              <span style={{ float: 'left' }} >
                搜索:<Search
                  placeholder="主数据名称"
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
              </span>
            </Col>
            <Col span={12}>
            </Col>
          </Row>
          <Table
            bordered={false}
            rowKey={record => record.id}
            rowSelection={rowSelection}
            dataSource={rowsData}
            columns={masterColumns}
            onChange={this.onPageChange}
            pagination={pagination}
            expandedRowRender={expandedRow}
          />
          <div>
            <Popconfirm onConfirm={this.handleModalOk} title='确定选择吗？' cancelText='取消' okText='确认'><Button type='primary'>确定</Button></Popconfirm>{' '}
            <Button onClick={this.handleModalCancel}>取消</Button>
          </div>
        </Modal>
        <div style={{paddingBottom:5}}  >
          <ButtonGroup  >
            <Button type="primary" onClick={this.insertRow} icon="plus-circle-o"  >新增参数</Button>
            <Button onClick={this.chooseMaster} icon="plus-square"  >选择主数据</Button>
            <Button  onClick={this.refresh} icon="reload"  >刷新</Button>
          </ButtonGroup>
        </div>
        <Table
          rowKey={record => record.id}
          dataSource={data}
          columns={columns}
          onRowClick={this.onRowClick}
          loading={this.state.loading}
          pagination={false}
          size='small'
        />
        (提示:如果不配置映射参数则表示全部透全所有参数)
      </div>
      );
  }
}

export default EditAPIMapParams;
