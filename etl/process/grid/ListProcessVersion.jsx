import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditText from '../../../core/components/EditText';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.VERSION.list;
const DELETE_URL=URI.ETL.VERSION.delete;
const RESTORE_URL=URI.ETL.VERSION.restore;

class ListProcessVersion extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.processId=this.props.processId;
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
      action:'',
      curEditIndex:-1,
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
    let url=LIST_URL+"?processId="+this.processId;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确定要删除选中记录吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  restoreProcess=()=>{
    let id=this.state.selectedRowKeys[0];
    this.setState({loading:true});
    AjaxUtils.post(RESTORE_URL,{id:id},(data)=>{
      this.setState({loading:false});
      if(data.state==false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  restoreVersion=()=>{
    if(this.state.selectedRowKeys.length>1){
      AjaxUtils.showError("只能选中一个版本!");
      return;
    }
        var self=this;
        confirm({
        title: '确定要恢复选中版本吗?',
        content: '注意:恢复后现有版本将被覆盖!',
        onOk(){
          return self.restoreProcess();
        },
        onCancel() {},
        });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '流程名称',
        dataIndex: 'processName',
        width: '20%',
      },{
        title: '提交者',
        dataIndex: 'creator',
        width: '10%',
      },{
        title: '提交时间',
        dataIndex: 'createTime',
        width: '15%',
      },{
        title: '版本说明',
        dataIndex: 'commitMsg',
        width: '55%',
      }];

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.restoreVersion} icon="check"  disabled={!hasSelected} >恢复选中版本</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
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
      </div>
    );
  }
}

export default ListProcessVersion;
