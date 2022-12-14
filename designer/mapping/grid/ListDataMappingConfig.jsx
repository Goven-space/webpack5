import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,TreeSelect,Divider,Popover,Input} from 'antd';
import NewDataMappingField from '../form/NewDataMappingField';
import SelectListMasterData from '../../../standard/masterdata/grid/SelectListMasterData';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const listByPage=URI.Gateway_DATAMAPPING_ITEM.page;
const DELETE_URL=URI.Gateway_DATAMAPPING_ITEM.delete;
const GETBYID_URL=URI.Gateway_DATAMAPPING_ITEM.getById;
const outputparamsUrl=URI.Gateway_DATAMAPPING_ITEM.outputparamsUrl;

class ListDataMappingConfig extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId=this.props.categoryId;
    this.appId=this.props.appId;
    this.record=this.props.record;
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
      jsonBody:this.record.inputJson,
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
      title: '?????????????',
      content: '??????:???????????????????????????!',
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

  //??????ajax??????????????????
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
        title: '??????Id',
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
          title: '????????????',
          dataIndex: 'fieldName',
          width: '15%',
          ellipsis: true,
          render: (text,record) => {
            if(record.valueSecretType!=='NO'){
              return <span><span style={{color:'red'}}>{"[?????????]"}</span>{text}</span>;
            }else{
              return text;
            }
          }
      },{
            title: '????????????',
            dataIndex: 'fieldType',
            width: '10%',
            ellipsis: true,
            render: (text,record) => {
              if(text==='array' && record.arrayType=='rowsNumber'){
                return <span style={{color:'blue'}}>{text+"["+record.arrayRowsIndex+"]"}</span>;
              }else if(text=='array'){
                return <span style={{color:'blue'}}>{"??????[0-N]"}</span>;
              }else if(text=='object'){
                return <span style={{color:'green'}}>??????</span>;
              }else if(text=='datetime'){
                return text+"["+record.datetimeFormat+"]";
              }else{
                return text;
              }
            }
      },{
            title: '????????????',
            dataIndex: 'fieldDataFromType',
            width: '20%',
            ellipsis: true,
            render: (text,record) => {
              if(record.caseWhen!='[]' && record.caseWhen!=undefined){return <Tag color='cyan'>????????????</Tag>}
              if(record.fieldType==='array'){
                if(record.arrayDataFromType==6){
                  return <Tag color='cyan'>??????</Tag>;
                }else if(record.arrayDataFromType==4){
                  return <Tag color='cyan'>SQL??????</Tag>;
                }else{
                  return record.arrayJsonPathId;
                }
              }else if(record.fieldType=='object'){
                if(record.objectDataFromType==6){
                  return <Tag color='cyan'>??????</Tag>;
                }else if(record.objectDataFromType==4){
                  return <Tag color='cyan'>SQL??????</Tag>;
                }else{
                  return record.objectJsonPathId;
                }
              }else{
                if(record.fieldDataFromType==1){
                  return record.fieldJsonPathId;
                }else if(record.fieldDataFromType==0){
                  return "?????????:"+record.constantValue;
                }else if(record.fieldDataFromType==2){
                  return record.fieldComputeType+"["+record.fieldComputeFieldId+"]";
                }else if(record.fieldDataFromType==3){
                  return "??????:"+record.fieldBandingRuleId;
                }else if(record.fieldDataFromType==4){
                  return <Tag color='cyan'>SQL??????</Tag>;
                }else if(record.fieldDataFromType==5){
                  return <Tag>????????????</Tag>;
                }else if(record.fieldDataFromType==6){
                  return <Tag color='cyan'>??????</Tag>;
                }
                return text;
              }

            }
      },{
        title: '??????',
        dataIndex: 'sortNum',
        width: '6%',
      },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'12%',
        render: (text,record) => {
          return <div>
                <a  onClick={this.onActionClick.bind(this,"Edit",record)} >??????</a>
                {
                record.fieldType=='object' || record.fieldType=='array'?
                <span><Divider type="vertical"/>
                <a  onClick={this.onActionClick.bind(this,"NewSubNode",record)} >?????????</a>
              </span>
                :''
                }
            </div>
          }
      },];

      let modelWindow,title;
      if(this.state.action==='Import'){
        title='???JSON??????';
        modelWindow=<span>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} defaultValue={AjaxUtils.formatJson(this.state.jsonBody)} onChange={this.jsonBodyChange} placeholder="??????JSON????????????????????????" />
          <br/><br/>
          <Button type="primary" onClick={this.importFormJson} icon="upload"  >????????????</Button>
        </span>
      }else if(this.state.action=='masterdata'){
        title='???????????????';
        modelWindow=<SelectListMasterData categoryId={this.record.categoryId} closeModal={this.closeModal} />;
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
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus"  >????????????</Button>
          <Button  type="ghost" onClick={this.onActionClick.bind(this,'Import')} icon="upload"  >???JSON??????</Button>
          <Button  type="ghost" onClick={this.onActionClick.bind(this,'masterdata')} icon="plus"  >???????????????</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >??????</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >??????</Button>
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
