import React, { PropTypes } from 'react';
import { Table,Icon,Tag,Button,Modal,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ShowCacheItems from  '../form/ShowCacheItems';

const ListAllCachesUrl=URI.LIST_CORE_BEANS.listAllCaches;
const clearCacheByConfigName=URI.LIST_CORE_BEANS.clearCacheByConfigName;
const CLEAR_ALLCACHE_URL=URI.LIST_CORE_BEANS.clearAllCache;

class ListAllCaches extends React.Component {
  constructor(props) {
    super(props);
    this.beanType="";
    this.appId="";
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible: false,
      cacheKey:'',
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
    GridActions.loadData(this,ListAllCachesUrl,pagination,filters,sorter);
  }

  deleteCache=(record)=>{
    let url=clearCacheByConfigName.replace("{configname}",record.cacheKey);
    AjaxUtils.get(url,(data)=>{
      if(data.state===false){
        AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
      }else{
        AjaxUtils.showInfo("成功从容器中清除缓存("+record.cacheKey+")");
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

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  showCacheItems=(cacheKey)=>{
    this.setState({cacheKey:cacheKey,visible: true,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '',
      dataIndex: '',
      width: '5%',
      render:(text,record)=>{return <Icon type="file" />;}
    },{
      title: '缓存key',
      dataIndex: 'cacheKey',
      width: '25%',
    },{
      title: '当前缓存数',
      dataIndex: 'cacheSize',
      width: '15%'
    },{
      title: '创建时间',
      dataIndex: 'startTime',
      width: '20%'
    },{
      title: '缓存有效期',
      dataIndex: 'cacheSeconds',
      width: '10%',
      render:(text)=>{
        if(text==0){return "永久";}else{return text+"(秒)";}
      }
    },{
      title: '当前状态',
      dataIndex: 'cacheStatus',
      width: '10%',
      render:(text)=>{
        if(text===0){
          return (<Tag color='red'>停用</Tag>);
        }else if(text===1){
          return (<Tag color='green'>启用</Tag>);
        }
      }
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
        <Card  bordered={true} bodyStyle={{padding:8}} title={record.cacheKey+"的缓存对象"} >
          <ShowCacheItems cacheKey={record.cacheKey} close={this.closeModal}  />
        </Card>
        );
    }

    return (
      <div>
        <Modal key={Math.random()} title="查看缓存对象" maskClosable={false}
                  visible={this.state.visible}
                  width='700px'
                  footer=''
                  onOk={this.handleCancel}
                  onCancel={this.handleCancel} >
                  <ShowCacheItems cacheKey={this.state.cacheKey} close={this.closeModal}  />
        </Modal>

        <div style={divStyle}>
          <Button  type="primary" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
        </div>
        <Table
          bordered={true}
          rowKey={record => record.cacheKey}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          expandedRowRender={expandedRow}
          pagination={pagination}
        />
    </div>
    );
  }
}
export default ListAllCaches;
