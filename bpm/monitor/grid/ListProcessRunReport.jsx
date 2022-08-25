import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.BPM.CORE_BPM_MONITOR.listProcessRunReport;
const listAllAppUrl=URI.BPM.APPLICATION.select;

class ListProcessRunReport extends React.Component {
  constructor(props) {
    super(props);
    this.detailClick=this.props.detailClick;
    this.appId=this.props.appId;
    this.url=LIST_URL;
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
      applicationId:'*'
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
    if(this.state.applicationId!=='*'){
      filters.applicationId=[this.state.applicationId];
    }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    if(this.state.applicationId!=='*'){
      filters={applicationId:[this.state.applicationId]};
    }
    let sorter={};
    let searchFilters={};
    searchFilters={"configId":value,"configName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  onCategoryChange=(value)=>{
    this.state.applicationId=value;
    this.state.pagination.current=1;
    this.loadData()
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '流程名称',
        dataIndex: 'configName',
        width: '25%'
      },{
        title: '所属应用',
        dataIndex: 'applicationId',
        width: '10%',
      },{
        title: '总运行次数',
        dataIndex: 'totalNum',
        width: '8%',
        render: (text,record) => {return <span style={{fontSize:'16px'}} >{text}</span>}
      },{
          title: '成功次数',
          dataIndex: 'successNum',
          width: '8%',
          render: (text,record) => {return <span style={{fontSize:'16px',color:'green'}} >{text}</span>}
      },{
      title: '失败次数',
      dataIndex: 'errorNum',
      width: '8%',
      render: (text,record) => {return <span style={{fontSize:'16px',color:'#f50'}} >{text}</span>}
    },{
        title: '待补偿数',
        dataIndex: 'compensateCount',
        width: '8%',
        render: (text,record) => {return <span style={{fontSize:'16px',color:'#000'}} >{text}</span>}
    },{
        title: '等待中',
        dataIndex: 'runingCount',
        width: '8%',
        render: (text,record) => {return <span style={{fontSize:'16px',color:'green'}} >{text}</span>}
    },{
        title: '平均耗时(秒)',
        dataIndex: 'avgRunTime',
        width: '10%',
        render: (text,record) => {return <span style={{fontSize:'16px'}} >{text}</span>}
      },{
        title: '流程描述',
        dataIndex: 'remark',
        width:'10%',
      }];

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   应用:<TreeNodeSelect value={this.state.applicationId} labelId='applicationName' valueId='applicationId' onChange={this.onCategoryChange} defaultData={{applicationName:'所有应用列表',applicationId:'*'}} url={listAllAppUrl}   style={{minWidth:'200px',marginRight:'15px',marginLeft:'5px'}} />
                   搜索:<Search
                    placeholder="流程名称"
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
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
              />
      </div>
    );
  }
}

export default ListProcessRunReport;
