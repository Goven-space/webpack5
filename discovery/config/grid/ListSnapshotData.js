import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import CreateSnapshotData from '../form/CreateSnapshotData';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.LIST_CONFIG_SNAPSHOT.list;
const DELETE_URL=URI.LIST_CONFIG_SNAPSHOT.delete;
const RECOVERY_URL=URI.LIST_CONFIG_SNAPSHOT.recover;

class ListSnapshotData extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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
    }else if(action==="snapshot"){
      this.setState({visible: true,currentRecord:record,action:action});
    }
  }

  recover=(record)=>{
    this.setState({loading:true});
    AjaxUtils.post(RECOVERY_URL,{id:record.id},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功回滚到选中的快照数据!");
        this.loadData();
      }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中应用吗?',
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"remark":value,"env":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  openApp=(appId)=>{
      let url=appUrl+"?appid="+appId;
      window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length>0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '应用Id',
        dataIndex: 'configAppId',
        width: '15%',
        sorter: true,
        render:(text,record)=>{if(text==='ALL'){return "全部"}else{return text;}}
      },{
        title: '环境Id',
        dataIndex: 'env',
        width: '15%',
        sorter: true,
        render:(text,record)=>{if(text==='ALL'){return "全部"}else{return text;}}
      },{
        title: '配置数',
        dataIndex: 'docCount',
        width: '10%',
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '25%',
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'10%',
        sorter: true
      },{
        title: '快照创建时间',
        dataIndex: 'createTime',
        width:'15%',
        sorter: true
      },{
        title: '操作',
        dataIndex: 'state',
        width:'10%',
        render:(text,record)=>{return <a><Popconfirm title="确定回滚到此快照?" onConfirm={this.recover.bind(this,record)}>回滚</Popconfirm></a>}
      }];


    return (
      <div style={{minHeight:'600px'}}>
          <Modal key={Math.random()} title='创建快照' maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='750px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {
              <CreateSnapshotData appId='' env='' close={this.closeModal} />
            }
          </Modal>

        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >创建快照</Button>{' '}
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button> {' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="备注或者环境id"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table
          bordered={true}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default ListSnapshotData;
