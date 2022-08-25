import React, { PropTypes } from 'react';
import { Table, Icon,Tag,Select,Input,Button,Card,Modal} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const Search = Input.Search;
const Option = Select.Option;
const LIST_URL=URI.LIST_CORE_BEANS.list;
const CLEAR_BEANCACHE_URL=URI.LIST_CORE_BEANS.clearBeanObjCacheUrl;
const confirm = Modal.confirm;

class ListCoreBeans extends React.Component {
  constructor(props) {
    super(props);
    this.beanType=this.props.beanType;
    this.appId=this.props.appId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      searchBeanType:'',
      searchWords:'',
    }
  }

  componentDidMount(){
    this.loadData();
  }
  
  componentWillReceiveProps=(nextProps)=>{
    this.beanType=nextProps.beanType;
    this.appId=nextProps.appId;
    this.state.pagination.current=1;
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
    let searchFilters={};
    let beanType=this.beanType;
    if(beanType!==undefined && beanType!==''){
      filters.beanType=[beanType];
    }
    if(this.appId!==undefined && this.appId!==''){
      filters.appId=[this.appId];
    }

    let searchBeanType=this.state.searchBeanType;
    let searchWords=this.state.searchWords;
    if(searchBeanType!=='' || searchWords!=='' ){
      //表示是在搜索状态下进行分页
      searchFilters={"beanId":searchWords,"beanName":searchWords};
      if(searchBeanType!=='*' && searchBeanType!==''){
        filters={"beanType":[searchBeanType]};
      }
      sorter={"order":'ascend',"field":'beanId'};//使用mapUrl升序排序
      this.searchFilters=searchFilters;
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
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

  beanTypeChange=(value)=>{
    this.state.searchBeanType=value;
  }
  searchWordsChange=(e)=>{
    this.state.searchWords=e.target.value;
  }

  //通过ajax远程载入数据
  search=()=>{
    this.state.pagination.current=1;
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: 'BeanId',
      dataIndex: 'beanId',
      width: '25%',
      sorter: true
    },{
      title: '名称',
      dataIndex: 'beanName',
      width: '30%'
    },{
      title: '所属应用',
      dataIndex: 'appId',
      width: '10%'
    },{
      title: '属性',
      dataIndex: 'singleton',
      width:'25%',
      render:(text,record)=>{
        let singTags;
        if(record.singleton===true){
          singTags=<Tag color="cyan" >单例</Tag>;
        }else if(record.singleton===false){
          singTags=<Tag color="red" >多例</Tag>;
        }
        let typeTags=<Tag color="cyan" >{record.beanType}</Tag>;
        let hotType;
        if(record.useClassLoader){
          hotType=<Tag color="green" >Hot</Tag>;
        }
        return (<div>{typeTags}{singTags}{hotType}</div>);
      }
    },{
      title: '容器缓存',
      dataIndex: 'cacheFlag',
      key: 'x',
      width:'10%',
      render: (text,record) => {
        if(record.cacheFlag){
          return (<Tag color="blue" onClick={this.deleteCache.bind(this,record)}><Icon type="close" />清除</Tag>);
        }else{
          return "无";
        }
      }
    },];

    const expandedRow=function(record){
      return (<div>
      <p>类路径:{record.classPath}</p>
      <p>热加载:{record.useClassLoader?'是':'否'}</p>
      <p>自动装配:{record.autowired?'是':'否'}</p>
      <p>延迟加载:{record.lazyInit?'是':'否'}</p>
      <p>最后修改:{record.editor} {' '} 时间:{record.editTime}</p>
      <p>备注:{record.remark}</p>
      </div>);
    }

    return (
      <div>
      <Card style={{marginBottom:10,padding:'5px'}} >
        Bean类型:{' '}
        <Select defaultValue='*' onChange={this.beanTypeChange} style={{width:'200px'}}>
                <Option value="*">所有类型</Option>
                <Option value="Controller">Rest服务Conntroller</Option>
                <Option value="Service">业务逻辑ServiceBean</Option>
                <Option value="Dao">持久层DaoBean</Option>
                <Option value="Model">数据模型ModelBean</Option>
                <Option value="View">视图ViewBean</Option>
                <Option value="Validate">输入参数验证Bean</Option>
                <Option value="Event">事件EventBean</Option>
                <Option value="ControlStrategy">ControlStrategyBean</Option>
                <Option value="LoadBalance">负载均衡LoadBalanceBean</Option>
                <Option value="Scheduler">定时作业Bean</Option>
                <Option value="Component">其他JavaBean</Option>
          </Select>
          {' '}
          搜索BeanId或名称:{' '}
          <Search
                placeholder="请输入搜索关键字"
                style={{ width: 260 }}
                onChange={this.searchWordsChange}
                onSearch={value => this.search(value)}
          />
          {' '}
          <Button type="primary" onClick={this.search}  >
              搜索
          </Button>
        </Card>
        <Table
          bordered={true}
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
export default ListCoreBeans;
