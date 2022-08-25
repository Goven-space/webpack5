import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AppSelect from '../../../core/components/AppSelect';
import ApiQpsAndLogMonitor from '../../charts/ApiQpsAndLogMonitor';

const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR_CENTER.listApis;
const TabPane = Tabs.TabPane;

//api 运行时监控

class ListCoreServices extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.searchFilters={};
    this.state={
      pagination:{pageSize:20,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      appId:'',
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
    if(this.appId!==undefined && this.appId!==''){
      filters.appId=[this.appId];
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    if(this.appId!==undefined && this.appId!==''){
      filters.appId=[this.appId];
    }
    let sorter={};
    let searchFilters={};
    searchFilters={"mapUrl":value,"configName":value,"appId":value};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  showModal=(id)=>{
    this.setState({visible: true,currentId:id});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

 // handleChange=(value)=>{
 //   this.appId=value;
 //   this.state.pagination.current=1;
 //   this.loadData()
 // }
 handleChange=(e)=>{
   this.appId=e.target.value;
   this.state.pagination.current=1;
   this.state.appId=this.appId;
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '类型',
        dataIndex: 'configType',
        width:'5%',
        render:(text,record)=>{
          if(text==='JOIN'){return <Icon type="share-alt" />;}
          else if(text==='REG'){return <Icon type="link" />;}
          else {return <Icon type="tag-o" />;}
        }
      },{
        title: 'API URL',
        dataIndex: 'mapUrl',
        width: '28%',
        sorter: true,
        ellipsis: true,
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'18%',
        ellipsis: true,
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'10%',
        sorter: true,
      },{
        title: '调用次数',
        dataIndex: 'totalAccessNum',
        width:'8%',
        render:(text,record)=>{
          if(text==='0'){
            return "0";
          }else{
            return <Tag color="green" >{text}</Tag>
          }
        }
      },{
        title: '当前链接数',
        dataIndex: 'currentLinkingNum',
        width:'8%',
        render:(text,record)=>{
          if(text===0){
            return "0";
          }else{
            return <Tag color="blue" >{text}</Tag>
          }
        }
      },{
        title: '平均(毫秒)',
        dataIndex: 'averageResTime',
        width:'10%',
        render:(text,record)=>{
          if(text===0){
            return "0";
          }else{
            return <Tag color="green" >{text}</Tag>
          }
        }
      },{
      title: '最大/最小(毫秒)',
      dataIndex: 'curMaxRunTime',
      width:'12%',
      render:(text,record)=>{
          return <span>{text}/{record.curMinRunTime}</span>;
      }
    }];

    const expandedRow=function(record){
      return (
          <ApiQpsAndLogMonitor id={record.id} />
        );
    }

    return (
      <div style={{minHeight:'600px'}}>
        <Row  gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
           应用Id:<Input onChange={this.handleChange} placeholder='请输入应用appId' style={{width:'200px'}} />
             {' '}
             搜索:{' '}<Search
              placeholder="API URL或名称"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <br/>
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

export default ListCoreServices;
