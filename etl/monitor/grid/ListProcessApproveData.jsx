import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//列出待审批流程的审批数据

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.ListProcessApproveData;
const DELETE_URL=URI.ETL.MONITOR.DeleteProcessApproveData;
const SAVE_URL=URI.ETL.MONITOR.SaveProcessApproveData;

class ListProcessApproveData extends React.Component {
  constructor(props) {
    super(props);
    this.nodeId=this.props.nodeId;
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId;
    this.url=LIST_URL+"?processId="+this.processId+"&transactionId="+this.transactionId+"&nodeId="+this.nodeId;
    this.saveUrl=SAVE_URL+"?processId="+this.processId+"&transactionId="+this.transactionId+"&nodeId="+this.nodeId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      panes:[],
      loading: true,
      visible:false,
      tabActiveKey: 'home',
      currentId:'',
      currentRecord:{},
      searchKeyWords:'',
      collapsed:false,
      action:''
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
    let url=DELETE_URL+"?processId="+this.processId+"&transactionId="+this.transactionId+"&nodeId="+this.nodeId;
    GridActions.deleteData(this,url,argIds);
  }

  saveData=(record)=>{
    AjaxUtils.post(this.saveUrl,record,(data)=>{
      if(data.state==false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("修改成功!");
        this.loadData();
      }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '你要删除选中的审批数据吗?删除后不会流入到后断节点中!',
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
    let sorter={"order":'ascend',"field":'P_TAG_TIME'};
    let searchFilters={"P_TAG_ACTIONID":value};
    GridActions.loadData(this,this.url,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
          title: '记录id',
          dataIndex: 'P_TAG_ID',
          width: '30%',
      },{
          title: '数据源',
          dataIndex: 'P_TAG_DATASOURCEID',
          width: '25%',
      },{
          title: '表名称',
          dataIndex: 'P_TAG_TABLENAME',
          width: '25%',
      },{
          title: '标签',
          dataIndex: 'P_TAG_ACTIONID',
          width: '20%',
      }];

      const expandedRow=(record)=>{
        let jsonStr=JSON.stringify(record);
        jsonStr=AjaxUtils.formatJson(jsonStr);
        return <span>
            <Input.TextArea value={jsonStr} autosize={{ minRows: 2, maxRows: 32 }} />
          </span>;
      }

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.showConfirm}  icon="delete" disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                </Col>
              </Row>
              <Table
                bordered={false}
                rowKey={record => record.P_TAG_ID}
                dataSource={rowsData}
                columns={columns}
                rowSelection={rowSelection}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
                expandedRowRender={expandedRow}
              />
      </div>
    );
  }
}

export default ListProcessApproveData;
