import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as ContextUtils from '../../../core/utils/ContextUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_WARNINGMESSAGE.list; //分页显示消息
const DELETE_URL=URI.CORE_WARNINGMESSAGE.delete;//删除
const CLEAR_URL=URI.CORE_WARNINGMESSAGE.clear;//清空

class ListMessage extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
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

  clear=()=>{
    AjaxUtils.post(CLEAR_URL,{},(data)=>{
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.loadData();
          AjaxUtils.showInfo("成功清空消息,请由新页面更新提示数量!");
        }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确认要删除选中消息吗?',
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
    searchFilters={"title":value,"body":value};
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
      dataIndex: 'messageType',
      sorter: true,
      width: '10%',
      render:(text,record)=>{
            return (<Tag color="#f50">{text}</Tag>);
        }
      },{
        title: '标题',
        dataIndex: 'title',
        width: '55%',
      },{
        title: '发送者',
        dataIndex: 'creator',
        width: '15%',
        sorter: true,
      },{
        title: '发送时间',
        dataIndex: 'createTime',
        width: '20%',
        sorter: true,
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='消息内容' bodyStyle={{padding:8,minHeight:'100px'}}>
            {record.body}
          </Card>
          );
      }

    return (
      <Card title="预警消息" style={{minHeight:600}}>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"清空消息","清空后不可恢复!",this.clear)}  icon="delete" >清空消息</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  placeholder="搜索标题和内容"
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
              expandedRowRender={expandedRow}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
      </Card>
    );
  }
}

export default ListMessage;
