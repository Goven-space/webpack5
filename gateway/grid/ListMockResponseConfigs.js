import { Button, Divider, Modal, Table, Input, Row, Col } from 'antd';
import React from 'react';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewMockResponseConfig from '../form/NewMockResponseConfig';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_MOCK_RESPONSE.list;
const DELETE_URL=URI.CORE_MOCK_RESPONSE.delete;
const COPY_URL=URI.CORE_MOCK_RESPONSE.copy;

class ListMockResponseConfigs extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.state={
			current:0,
      pagination:{pageSize:15,current:0,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      currentId:'',
      searchKeywords:''
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
    this.setState({visible: true,currentId:''});
    }else if(action==="Copy"){
      this.copyData(record.id);
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      // this.addTabPane('Edit',record.title,record);
      this.setState({visible: true,currentId:record.id});
    }
  }


  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确定要删除选中的模拟数据吗？',
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
  loadData=(pagination=this.state.pagination, filters={}, sorter={"order":'descend',"field":'editTime'})=>{
    if(this.appId!==undefined && this.appId!==''  && this.appId!==null){
      filters.appId=[this.props.appId]; //过虑只显示本应用的服务
    }
    if(this.state.searchKeywords!==''){
      this.search(this.state.searchKeywords,pagination, sorter);
    }else{
      GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
    }

  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  //通过Ajax在后端拷贝数据然后重新载入数据
  copyData=(argIds)=>{
     GridActions.copyData(this,COPY_URL,argIds);
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

  search=(value,pagination=this.state.pagination, sorter={"order":'descend',"field":'editTime'})=>{
    let filters={};
    if(this.appId!==undefined && this.appId!==''  && this.appId!==null){
      filters.appId=[this.props.appId]; //过虑只显示本应用的服务
    }
    let searchFilters={"configName":value};
    this.state.pagination.current=1;
    this.state.searchKeywords=value;
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '配置名称',
        dataIndex: 'configName',
        width: '35%'
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'20%',
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'15%',
      },{
        title: '最后修改',
        dataIndex: 'editTime',
        width:'20%',  
        sorter: true
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
                return <span>
                    <a  onClick={this.onActionClick.bind(this,"Edit",record)} >编辑</a>
                    <Divider type="vertical" />
                    <a onClick={AjaxUtils.showConfirm.bind(this,"复制确认","确定要复制吗?",this.onActionClick.bind(this,"Copy",record))} >复制</a>
                  </span>;
        }
      },];


    return (
      <div>
        <Modal key={Math.random()} title="模拟数据管理" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='960px'
            style={{top:'20px'}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewMockResponseConfig appId={this.props.appId} id={currentId} close={this.closeModal} />
        </Modal>
         {/* <div style={divStyle}>
         <ButtonGroup>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增摸拟数据</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
          </ButtonGroup>
        </div> */}
        <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增摸拟数据</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="配置名称"
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
        />
      </div>
    );
  }
}


export default ListMockResponseConfigs;
