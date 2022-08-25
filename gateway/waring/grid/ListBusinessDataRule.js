import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewBusinessDataRule from '../form/NewBusinessDataRule';
import ListWaringScopeItems from './ListWaringScopeItems';
import ListTriggerHistoryLog from './ListTriggerHistoryLog';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_WARING.list;
const DELETE_URL=URI.CORE_GATEWAY_WARING.delete;
const ButtonGroup = Button.Group;
const exportServices=URI.CORE_GATEWAY_WARING.export;
const TabPane = Tabs.TabPane;

class ListRequestSpeedRule extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.waringType=4;
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
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中规则吗?',
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
    let url=LIST_URL+"?waringType="+this.waringType;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  //导出服务
  exportData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportServices, { ids: ids });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"waringName":value,"receiver":value,"waringRemark":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL+"?waringType="+this.waringType;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '规则名称',
        dataIndex: 'waringName',
        width: '30%',
        sorter: true,
      },{
        title: '服务器',
        dataIndex: 'bindingServerId',
        width: '10%',
        render: (text,record) =>{if(text===''||text===undefined){return '*';}else{return text;}}
      },{
        title: '今日预警次数',
        dataIndex: 'totalRunCount',
        width:'10%',
        render: (text,record) =>{
              if(text==0){return '0';}else{return <Tag color='red'>{text}</Tag>;}
        }
      },{
        title: '状态',
        dataIndex: 'state',
        width:'10%',
        render: (text,record) => {if(text==='Y'){return <Tag color='green'>启用</Tag>} else if(text==='N'){return <Tag color='red'>停用</Tag>}else if(text==='D'){return <Tag color='red'>调试</Tag>}}
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'10%',
      },{
        title: '最后修改',
        dataIndex: 'editTime',
        width:'15%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
            return (<span>
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            </span>);
        }
      },];

      const expandedRow=(record)=>{
        return (
        <Card>
          <Tabs defaultActiveKey="api" size='large' >
            <TabPane tab="预警范围设置" key="api" animated={false}>
              <ListWaringScopeItems id={record.id}></ListWaringScopeItems>
            </TabPane>
            <TabPane tab="触发日志" key="logs" animated={false}>
              <ListTriggerHistoryLog parentId={record.id} ></ListTriggerHistoryLog>
            </TabPane>
          </Tabs>
        </Card>);
      }

    return (
      <div >
          <Modal key={Math.random()}  maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='1000px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewBusinessDataRule  id={currentId}  close={this.closeModal} />
          </Modal>

        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >新增预警规则</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportData)} icon="download"   disabled={!hasSelected}  >导出</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="规则名称"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
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

export default ListRequestSpeedRule;
