import React, { PropTypes } from 'react';
import { Table,Icon,Tag,Button,Row,Col,Input,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ReactJson from 'react-json-view'

const LIST_URL=URI.LIST_CORE_BEANS.listAllCacheBeans;
const CLEAR_BEANCACHE_URL=URI.LIST_CORE_BEANS.clearBeanObjCacheUrl;
const CLEAR_ALLCACHE_URL=URI.LIST_CORE_BEANS.clearAllCache;
const Search = Input.Search;

class ListBeanObjCache extends React.Component {
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
    let url=CLEAR_BEANCACHE_URL.replace("{beanId}",record.beanId);
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
      }else{
        AjaxUtils.showInfo("成功从容器中清除缓存");
        this.loadData();
      }
    });
  }

  clearAllCache=(record)=>{
    let url=CLEAR_ALLCACHE_URL;
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
      }else{
        AjaxUtils.showInfo("成功从容器中清除缓存");
        this.loadData();
      }
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"beanId":value};
    sorter={"order":'ascend',"field":'beanId'};//使用userName升序排序
    let url=LIST_URL;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
    {
      title: '',
      dataIndex: '',
      width: '5%',
      render:(text,record)=>{return <Icon type="file" />;}
    },
    {
      title: '缓存的BeanId',
      dataIndex: 'beanId',
      width: '30%',
    },{
      title: '类路径',
      dataIndex: 'className',
      width: '45%'
    },{
      title: '缓存',
      dataIndex: 'cacheFlag',
      key: 'x',
      width:'15%',
      render: (text,record) => {
          return (<Tag color="blue" onClick={this.deleteCache.bind(this,record)}><Icon type="close" />清除</Tag>);
      }
    },];

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
            <Button  type="primary" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
            <span style={{float:'right'}} >
              搜索:{' '}<Search
               placeholder="beanId"
               style={{ width: 260 }}
               onSearch={value => this.search(value)}
             />
            </span>
          </Col>
        </Row>
        <Table
          bordered={true}
          rowKey={record => record.beanId}
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
export default ListBeanObjCache;
