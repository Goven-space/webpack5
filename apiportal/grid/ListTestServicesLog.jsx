import React from 'react';
import {Table,Row, Col,Card,Menu,Icon,Tag,Popconfirm,Button,Divider,Modal,Input} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import NewTest from '../form/NewTest';

//分页显示我的测试记录

const Search = Input.Search;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_TEST_LOG.listByPage;
const DELETE_URL=URI.CORE_TEST_LOG.delete;
const CLEAR_URL=URI.CORE_TEST_LOG.clear;

class ListTestServicesLog extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      currentId:'',
      serviceId:'',
      searchValue:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    let searchValue=this.state.searchValue;
    if(searchValue!==''){
      this.search(searchValue,0,pagination);
    }else{
      this.loadData(pagination,filters,sorter);
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
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
    let searchFilters;
    if(this.state.searchValue!==''){
      searchFilters={"title":value,"url":value};
    }else{
      searchFilters={};
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  search=(value,firstpage,pagination=this.state.pagination)=>{
    this.state.searchValue=value;
    if(firstpage==1){this.state.pagination.current=1;}//首次搜索
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"title":value,"url":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL;
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  clearAll=()=>{
    this.setState({mask:true});
    AjaxUtils.post(CLEAR_URL,{},(data)=>{
      this.setState({mask:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
          AjaxUtils.showInfo(data.msg);
          this.loadData();
      }
    })
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: 'Method',
      dataIndex: 'methodType',
      width:'8%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
        }else if(text==="PUT" || text==="DELETE" ){
            return <Tag color="#f50" style={{width:50}} >{text}</Tag>
        }else if(text==="*"){
            return <Tag color="#f50" style={{width:50}} >全部</Tag>
        }
      },
      },{
        title: '测试API URL',
        dataIndex: 'url',
        width: '37%',
        sorter: true
      },{
        title: 'API名称',
        dataIndex: 'title',
        width: '20%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width: '10%',
      },{
        title: '测试者',
        dataIndex: 'creator',
        width:'10%',
      },{
        title: '测试时间',
        dataIndex: 'createTime',
        width:'15%',
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='服务测试' bodyStyle={{padding:8}}>
            <NewTest appId={record.appId} id={record.id}  serviceId={record.serviceId} />
          </Card>
          );
      }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'清空确认','需要清空所有测试记录吗?',this.clearAll)} icon="delete"    >清空</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索：<Search
              placeholder="API名称或URL"
              style={{ width: 260 }}
              onSearch={value => this.search(value,1)}
            />
             </span>
          </Col>
        </Row>
        <Table
          expandedRowRender={expandedRow}
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

export default ListTestServicesLog;
