import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import * as CDCURI from '../CDCURI';
import ReactJson from 'react-json-view'

//数据采集记录

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm   = Modal.confirm;
const LIST_URL  = CDCURI.CONSUMER_RECORD.list; //分页显示
const CLEAR_URL = CDCURI.CONSUMER_RECORD.clear;//删除

class ListCDCConsumerRecord extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.url=LIST_URL+"?parentId="+this.parentId;
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

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:'edit'});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:'edit'});
    }
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
      title: '清空确认?',
      content: '注意:清空后不可恢复!',
      onOk(){
        return self.clear();
      },
      onCancel() {},
      });
  }

  clear=()=>{
    this.setState({loading:true});
    AjaxUtils.post(CLEAR_URL,{parentId:this.parentId},(data)=>{
     this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
          AjaxUtils.showInfo("共清除("+data.msg+")条数据!");
      }
      this.loadData();
    });
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '创建时间',
        dataIndex: 'createTime',
        width: '20%',
        sorter:true,
      },{
        title: 'kafka地址',
        dataIndex: 'bootstrapServers',
        width: '25%',
      },{
        title: 'kafka主题',
        dataIndex: 'topic',
        width: '20%',
      },{
        title: '消费数量',
        dataIndex: 'successCount',
        width: '20%'
      }];

    const expandedRow=(record)=>{
      return (
        <ReactJson src={record} />
        );
    }

    return (
      <Card title="数据采集记录" >
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.showConfirm} icon="delete"  >清空记录</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    </ButtonGroup>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              size='small'
              expandedRowRender={expandedRow}
            />
      </Card>
    );
  }
}

export default ListCDCConsumerRecord;
