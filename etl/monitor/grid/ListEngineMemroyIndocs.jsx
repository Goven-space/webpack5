import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import ListEngineMemroyIndocs_topdata from './ListEngineMemroyIndocs_topdata';

//显示当前服务器下的内存数据流情况

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.ListEngineMemroyIndocs;
const deleteEngineMemroyIndocs=URI.ETL.MONITOR.deleteEngineMemroyIndocs;
const listAllAppUrl=URI.ETL.APPLICATION.select;

class ListEngineMemroyIndocs extends React.Component {
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
      applicationId:'*',
      totalCacheSize:0,
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
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
      this.state.pagination.total=data.total; //总数
      this.setState({rowsData:data.rows,totalCacheSize:data.totalCacheSize,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    let url=LIST_URL+"?applicationId="+this.state.applicationId+"&processName="+value;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  clearData=(record)=>{
    this.setState({loading:true});
    AjaxUtils.post(deleteEngineMemroyIndocs,{key:record.id},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.errorMsg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
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
        dataIndex: 'processName',
        width: '30%'
      },{
        title: '所属应用',
        dataIndex: 'applicationId',
        width: '10%'
      },{
        title: '事务id',
        dataIndex: 'transactionId',
        width: '20%'
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width: '15%'
      },{
        title: '流数据量',
        dataIndex: 'totoalDocument',
        width:'12%',
        render: (text,record) => {return <span style={{fontSize:'16px',color:'#f50'}} >{text}</span>}
      },{
          title: '清空',
          dataIndex: 'delete',
          width: '8%',
          render:(text,record)=>{
              return (<a  onClick={AjaxUtils.showConfirm.bind(this,"清除数据","如果流程正在执行，将丢失已经处理的数据!",this.clearData.bind(this,record))}>清空</a>);
          }
      }];

      const expandedRow=(record)=>{
        return (
          <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
            <ListEngineMemroyIndocs_topdata  id={record.id} />
          </div>
          );
      }

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
                  当前服务器临时缓存数据量:<Tag>{this.state.totalCacheSize}</Tag>
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

export default ListEngineMemroyIndocs;
