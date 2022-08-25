import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,TreeSelect,Divider,Popover,Input} from 'antd';
import NewDataMappingField from '../form/NewDataMappingField';
// import SelectListMasterData from '../../../standard/masterdata/grid/SelectListMasterData';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const listByPage=URI.ESB.DATAMAPPING_ITEM.page;
const DELETE_URL=URI.ESB.DATAMAPPING_ITEM.delete;
const GETBYID_URL=URI.ESB.DATAMAPPING_ITEM.getById;
const outputparamsUrl=URI.ESB.DATAMAPPING_ITEM.outputparamsUrl;

class ListDataMappingConfig extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId=this.props.categoryId;
    this.appId=this.props.appId;
    this.record=this.props.record||{};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      columns:[],
      loading: true,
      visible:false,
      currentId:'',
      parentId:'',
      jsonBody:this.record.inputJson||'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(this.categoryId!==nextProps.categoryId){
      this.categoryId=nextProps.categoryId;
      this.loadData();
    }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',parentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }else if(action==="NewSubNode"){
      this.setState({visible: true,currentId:'',parentId:record.id,action:action});
    }else if(action==="Import"){
      this.setState({visible: true,parentId:record.id,action:action});
    }else if(action==="masterdata"){
      this.setState({visible: true,parentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '删除确认?',
      content: '注意:删除字段后不可恢复!',
      onOk(){
        let ids=self.state.selectedRowKeys.join(",");
        return self.deleteData(ids);
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=listByPage+"?categoryId="+this.categoryId;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    let postData={"ids":argIds};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      this.setState({loading:false});
      AjaxUtils.showInfo(data.msg);
      this.loadData();
    });
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  jsonBodyChange=(e)=>{
    this.state.jsonBody=e.target.value;
  }


 importFormJson=()=>{
   this.setState({loading:true});
   let jsonBody=this.state.jsonBody;
   AjaxUtils.post(outputparamsUrl,{categoryId:this.categoryId,jsonBody:jsonBody},(data)=>{
     if(data.state==false){
       AjaxUtils.showError(data.msg);
     }else{
       AjaxUtils.showInfo(data.msg);
     }
     this.loadData();
     this.setState({visible: false});
   });;
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,parentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '字段Id',
        dataIndex: 'fieldId',
        width: '30%',
        sorter:true,
        render: (text,record) => {
          if(record.fieldType==='array'){
            return <span style={{color:'blue'}}>{text}</span>;
          }else if(record.fieldType==='object'){
            return <span style={{color:'green'}}>{text}</span>;
          }else{
            return text;
          }
        }
      },{
          title: '字段名称',
          dataIndex: 'fieldName',
          width: '15%',
          ellipsis: true,
          render: (text,record) => {
            if(record.valueSecretType!==undefined && record.valueSecretType!=='NO'){
              return <span><span style={{color:'red'}}>{"[加解密]"}</span>{text}</span>;
            }else{
              return text;
            }
          }
      },{
            title: '字段类型',
            dataIndex: 'fieldType',
            width: '10%',
            ellipsis: true,
            render: (text,record) => {
              if(text==='array' && record.arrayType=='rowsNumber'){
                return <span style={{color:'blue'}}>{text+"["+record.arrayRowsIndex+"]"}</span>;
              }else if(text=='array'){
                return <span style={{color:'blue'}}>{"数组[0-N]"}</span>;
              }else if(text=='object'){
                return <span style={{color:'green'}}>对像</span>;
              }else if(text=='datetime'){
                return text+"["+record.datetimeFormat+"]";
              }else{
                return text;
              }
            }
      },{
            title: '数据来源',
            dataIndex: 'fieldDataFromType',
            width: '20%',
            ellipsis: true,
            render: (text,record) => {
              if(record.caseWhen!='[]' && record.caseWhen!=undefined){return <Tag color='cyan'>运算条件</Tag>}
              if(record.fieldType==='array'){
                if(record.arrayDataFromType==6){
                  return <Tag color='cyan'>脚本</Tag>;
                }else if(record.arrayDataFromType==4){
                  return <Tag color='cyan'>SQL查询</Tag>;
                }else{
                  return record.arrayJsonPathId;
                }
              }else if(record.fieldType=='object'){
                if(record.objectDataFromType==6){
                  return <Tag color='cyan'>脚本</Tag>;
                }else if(record.objectDataFromType==4){
                  return <Tag color='cyan'>SQL查询</Tag>;
                }else{
                  return record.objectJsonPathId;
                }
              }else{
                if(record.fieldDataFromType==1){
                  return record.fieldJsonPathId;
                }else if(record.fieldDataFromType==0){
                  return "固定值:"+record.constantValue;
                }else if(record.fieldDataFromType==2){
                  return record.fieldComputeType+"["+record.fieldComputeFieldId+"]";
                }else if(record.fieldDataFromType==3){
                  return "规则:"+record.fieldBandingRuleId;
                }else if(record.fieldDataFromType==4){
                  return <Tag color='cyan'>SQL查询</Tag>;
                }else if(record.fieldDataFromType==5){
                  return <Tag>当前时间</Tag>;
                }else if(record.fieldDataFromType==6){
                  return <Tag color='cyan'>脚本</Tag>;
                }
                return text;
              }

            }
      },{
        title: '排序',
        dataIndex: 'sortNum',
        width: '6%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'12%',
        render: (text,record) => {
          return <div>
                <a  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
                {
                record.fieldType=='object' || record.fieldType=='array'?
                <span><Divider type="vertical"/>
                <a  onClick={this.onActionClick.bind(this,"NewSubNode",record)} >子字段</a>
              </span>
                :''
                }
            </div>
          }
      },];

      let modelWindow,title;
      if(this.state.action==='Import'){
        title='从JSON导入';
        modelWindow=<span>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} defaultValue={AjaxUtils.formatJson(this.state.jsonBody)} onChange={this.jsonBodyChange} placeholder="通过JSON自动分析输出参数" />
          <br/><br/>
          <Button type="primary" onClick={this.importFormJson} icon="upload"  >开始导入</Button>
        </span>
      }else{
        title='';
        modelWindow=<NewDataMappingField id={currentId} currentCategoryRecord={this.record}  appId={this.appId} categoryId={this.categoryId} parentId={parentId} closeModal={this.closeModal} />;
      }

    return (
      <div>
        <Modal key={Math.random()} title={title} maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            width='1050px'
            style={{top:'20px'}}
            onCancel={this.handleCancel} >
            {modelWindow}
        </Modal>
        <div style={divStyle}>
          <ButtonGroup  style={{marginTop:2}} >
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >新增字段</Button>
          <Button  type="ghost" onClick={this.onActionClick.bind(this,'Import')} icon="upload"  >从JSON导入</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
          </ButtonGroup>
        </div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          defaultExpandAllRows={true}
          size='small'
          rowSelection={rowSelection}
        />
    </div>
    );
  }
}

export default ListDataMappingConfig;
