import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditText from '../../../core/components/EditText';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.ListNodeLastRunTime;
const DELETE_URL=URI.ETL.MONITOR.DeleteNodeLastRunTime;
const UPDATE_URL=URI.ETL.MONITOR.UpdateNodeLastRunTime;

class ListNodeLastRunTime extends React.Component {
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

  update=(record)=>{
    this.setState({loading:true});
    AjaxUtils.post(UPDATE_URL,record,(data)=>{
        this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
          this.loadData();
        }
    });
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

  renderEditText(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value,record)} />);
  }

  renderSaveButton(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){return '-';}
    return (<Button type='primary' onClick={value => this.update(record)} >保存</Button>);
  }


  handleChange=(key, index, value,record)=>{
    record[key]=value;
    this.setState({ currentId:'' });
  }
  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '节点Id',
        dataIndex: 'nodeId',
        width: '10%',
      },{
        title: '执行服务器',
        dataIndex: 'serverId',
        width: '10%',
      },{
        title: '当前序列',
        dataIndex: 'currentNodeSeqNum',
        width: '10%',
        render: (text, record, index) => this.renderEditText(index,'currentNodeSeqNum', text,record),
      },{
        title: '最后开始时间',
        dataIndex: 'lastStartTime',
        width: '15%',
        render: (text, record, index) => this.renderEditText(index,'lastStartTime', text,record),
      },{
          title: '最后结束时间',
          dataIndex: 'lastEndTime',
          width: '15%',
          render: (text, record, index) => this.renderEditText(index,'lastEndTime', text,record),
      },{
        title: '最后开始时间(成功)',
        dataIndex: 'lastSuccessStartTime',
        width: '15%',
        render: (text, record, index) => this.renderEditText(index,'lastSuccessStartTime', text,record),
      },{
          title: '最后结束时间(成功)',
          dataIndex: 'lastSuccessEndTime',
          width: '15%',
          render: (text, record, index) => this.renderEditText(index,'lastSuccessEndTime', text,record),
      },{
        title: '操作',
        dataIndex: 'action',
        width: '10%',
        render: (text, record, index) => this.renderSaveButton(index,'action', text,record),
      }];

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.showConfirm} icon="delete"  icon="plus-circle-o" disabled={!hasSelected} >删除</Button>
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
                onRowClick={this.onRowClick}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
              />
      </div>
    );
  }
}

export default ListNodeLastRunTime;
