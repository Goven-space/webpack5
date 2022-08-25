import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ListDataTransLog from './ListDataTransLog';

//显示所有应用的传输错误数据量

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.DATAQUALITY_DATALOG.processErrorDataReport;
const listAllAppUrl=URI.ETL.APPLICATION.select;

class ListApplicationErrorDataReport extends React.Component {
  constructor(props) {
    super(props);
    this.detailClick=this.props.detailClick;
    this.applicationId="*";
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
    let url=LIST_URL+"?applicationId="+this.state.applicationId;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configId":value,"configName":value,"modelId":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL+"?applicationId="+this.state.applicationId;
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
        width: '60%'
      },{
        title: '所属应用',
        dataIndex: 'applicationId',
        width: '20%'
      },{
        title: '错误数',
        dataIndex: 'errorCount',
        width:'20%',
        render: (text,record) => {return <span style={{fontSize:'16px',color:'#f50'}} >{text}</span>}
    }];

      const expandedRow=(record)=>{
        return (
          <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
                <ListDataTransLog processId={record.processId} />
          </div>
          );
      }

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
                expandedRowRender={expandedRow}
              />
      </div>
    );
  }
}

export default ListApplicationErrorDataReport;
