import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import ReactJson from 'react-json-view'
import PublishAPI from '../form/PublishAPI';

//所有识别到的apis

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.LIST_TCPIP_RECORDAPI.list;
const DELETE_URL=URI.LIST_TCPIP_RECORDAPI.delete;
const CLEAR_URL=URI.LIST_TCPIP_RECORDAPI.clear;
const ButtonGroup = Button.Group;
const TabPane = Tabs.TabPane;

class ListAllApis extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.state={
      pagination:{pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'',
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中API吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
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
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //清空
  clear=()=>{
    this.setState({loading:true});
    AjaxUtils.post(CLEAR_URL,{parentId:this.parentId},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
      AjaxUtils.showError("已清空!");
      this.loadData();
      }
    });
  }

    showModal=(record)=>{
        this.setState({currentRecord:record,visible: true,});
    }

    closeModal=(reLoadFlag)=>{
        this.setState({visible: false,});
    }

    handleCancel=(e)=>{
        this.setState({visible: false,});
    }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
          title: 'Method',
          dataIndex: 'methodType',
          width: '8%',
          render:(text,record) => {
              let method=record.methodType;
              if(method==="POST"){
                  return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
              }else if(method==="GET"){
                  return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
              }else if(method==="DELETE" ){
                  return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
              }else if(method==="PUT"){
                  return <Tag color="pink" style={{width:50}} >PUT</Tag>;
              }else if(method==="*"){
                  return <Tag color="#f50" style={{width:50}} >全部</Tag>;
              }
            }
      },{
        title: '后端API接口',
        dataIndex: 'backendUrl',
        width: '50%',
        ellipsis: true,
      },{
        title: 'API类型',
        dataIndex: 'paramsNum',
        width: '10%',
        render: (text,record) => {
          if(record.requestBodyFlag){
            if(record.configType=='WEBSERVICE'){
              return <Tag color='blue'>WebService</Tag>;
            }else{
              return <Tag color='blue'>Body请求</Tag>;
            }
          }
          let number=record.paramsDocs.length;
          return <Tag color='green'>传入参数:{number}</Tag>;
        }
      },{
          title: '配置名称',
          dataIndex: 'tcpipConfigName',
          width: '15%',
      },{
        title: '识别时间',
        dataIndex: 'createTime',
        width: '15%'
      },{
          title: '操作',
          dataIndex: '',
          key: 'x',
          width:'10%',
          render: (text,record) => {
                  return (<span>
                    <a onClick={this.showModal.bind(this,record)} >发布API</a>
                  </span>);
          }
      }];

      const columnsParams = [
        {
          title: '参数Id',
          dataIndex: 'fieldId',
          width:'15%',
        },
        {
          title: '参数值',
          dataIndex: 'sampleValue',
          width:'85%',
        }
      ];

      const headerParams = [
        {
          title: '参数Id',
          dataIndex: 'headerId',
          width:'15%',
        },
        {
          title: '参数值',
          dataIndex: 'headerValue',
          width:'85%',
        }
      ];

      const expandedRow=(record)=>{
        let content;
        if(!record.requestBodyFlag){
          content=<Table dataSource={record.paramsDocs} columns={columnsParams} pagination={false} />
        }else if(record.configType=='WEBSERVICE'){
          content=<Input.TextArea autoSize value={record.webServiceRequestBody} />
        }else{
          content=<Input.TextArea autoSize value={AjaxUtils.formatJson(record.requestBodySampleStr)} />
        }
        return (
        <Card title='识别的API参数'>
          <Tabs size="large">
            <TabPane tab='API参数' key='params'>{content}</TabPane>
            <TabPane tab='Header参数' key='header' >
              <Table dataSource={record.headerDocs} columns={headerParams} pagination={false} />
            </TabPane>
          </Tabs>
        </Card>);
      }

    return (
      <div >
        <Modal key={Math.random()} title='注册API接口到网关' maskClosable={false}
            visible={this.state.visible}
            width='750px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <PublishAPI close={this.closeModal} record={this.state.currentRecord} />
        </Modal>

        <ButtonGroup style={{marginBottom:'5px'}} >
        <Button  type="primary" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
        <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
        <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'清空','需要清空所有日志吗?',this.clear)} icon="delete"   >清空</Button>
        </ButtonGroup>

        <Table
          bordered={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
    </div>
    );
  }
}

export default ListAllApis;
