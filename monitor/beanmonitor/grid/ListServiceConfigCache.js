import React, { PropTypes } from 'react';
import {hashHistory} from 'react-router';
import { Table,Icon,Tag,Button,Row,Col,Input,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ReactJson from 'react-json-view'

const LIST_URL=URI.LIST_CORE_BEANS.listServiceConfigCache;
const CLEAR_SERVICECACHE_URL=URI.LIST_CORE_BEANS.clearServiceCacheUrl;
const Search = Input.Search;

class ListServiceConfigCache extends React.Component {
  constructor(props) {
    super(props);
    this.beanType="";
    this.appId="";
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true
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
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteCache=(record)=>{
    let url=CLEAR_SERVICECACHE_URL;
    let postData={"key":record.mapUrl+"."+record.methodType};
    AjaxUtils.post(url,postData,(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  clearAllCache=(record)=>{
    let url=CLEAR_SERVICECACHE_URL;
    AjaxUtils.post(url,{},(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"url":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: 'Method',
      dataIndex: 'methodType',
      width:'10%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
        }else if(text==="PUT" || text==="DELETE" ){
            return <Tag color="#f50" style={{width:50}} >{text}</Tag>
        }else if(text==="*"){
            return <Tag color="#f50" style={{width:50}} >全部</Tag>
        }
      },
      },{
        title: '缓存的API URL',
        dataIndex: 'mapUrl',
        width: '35%'
      },{
        title: 'API名称',
        dataIndex: 'configName',
        width:'25%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width:'10%',
      },{
        title: '最后更新',
        dataIndex: 'lastCacheUpdateDateTime',
        width:'15%',
      },{
      title: '缓存',
      dataIndex: 'cacheFlag',
      key: 'x',
      width:'10%',
      render: (text,record) => {
          return (<Tag color="blue" onClick={this.deleteCache.bind(this,record)}><Icon type="close" />清除</Tag>);
      }
    }];

    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} bodyStyle={{padding:8}} title="查看缓存数据" >
          <ReactJson src={record} />
        </Card>
        );
    }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"操作确认","要清除所有API缓存吗?",this.clearAllCache)} icon="close" >清除所有API缓存</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
            <span style={{float:'right'}} >
              搜索:{' '}<Search
               placeholder="URL"
               style={{ width: 260 }}
               onSearch={value => this.search(value)}
             />
            </span>
          </Col>
        </Row>
        <Table
          bordered={true}
          rowKey={record => record.mapUrl+"."+record.methodType}
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
export default ListServiceConfigCache;
