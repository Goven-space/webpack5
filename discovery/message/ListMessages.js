import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.LIST_REGSERVER_MESSAGE.list_page; //分页显示
const DELETE_URL=URI.LIST_REGSERVER_MESSAGE.delete;//删除

class ListMessages extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      action:'edit',
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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


  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"serverId":value,"serverIP":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '类型',
      dataIndex: 'type',
      sorter: true,
      width:'10%',
      render:(text,record)=>{
          if(text==='1'){
            return (<Tag color="green">上线</Tag>);
          }else if(text==='0'){
            return (<Tag color="red">失效</Tag>);
          }
        }
      },{
        title: '服务实例Id',
        dataIndex: 'serverId',
        width: '30%',
        sorter: true,
      },{
        title: '服务实例IP',
        dataIndex: 'serverIP',
        width: '20%',
        sorter: true,
      },{
        title: '端口',
        dataIndex: 'serverPort',
        width: '20%'
      },{
        title: '时间',
        dataIndex: 'createTime',
        width: '20%',
        sorter: true,
      }];

    return (
      <Card title="所有系统事件" style={{minHeight:600}}>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="搜索ServerId或IP"
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
      </Card>
    );
  }
}

export default ListMessages;
