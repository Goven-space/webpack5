import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Card} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AppSelect from '../../core/components/AppSelect';
import ApmLogByApiCharts from './ApmLogByApiCharts';

//按API查看每个API的依赖关系图

const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_SERVICES.list;

class ApmLogByApi extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.searchFilters={};
    this.state={
      pagination:{pageSize:30,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      appId:'',
      currentRecord:{},
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
    searchFilters={"mapUrl":value,"beanId":value};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  showModal=(record)=>{
    this.setState({visible: true,currentRecord:record});
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

 handleChange=(value)=>{
   this.appId=value;
   this.state.pagination.current=1;
   this.loadData()
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: 'Method',
        dataIndex: 'methodType',
        width:'8%',
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
        }
      },{
        title: 'API URL',
        dataIndex: 'mapUrl',
        width: '25%',
        sorter: true
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'20%',
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'6%',
      },{
        title: 'BeanId',
        dataIndex: 'beanId',
        width:'10%',
      },{
        title: '版本',
        dataIndex: 'version',
        width:'6%',
      },{
      title: '依赖关系',
      dataIndex: 'state',
      width:'10%',
      render:(text,record)=>{
        return (<a onClick={this.showModal.bind(this,record)}>查看依赖关系</a>);
      }
    }];

    return (
      <div style={{minHeight:'600px'}}>
        <Modal key={Math.random()} title={this.state.currentRecord.configName+'业务系统调用跟踪'} maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='1024px'
            style={{top:'20px'}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <ApmLogByApiCharts id={this.state.currentRecord.id} />
        </Modal>

        <Card>
        <Row  gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             应用:<AppSelect value={this.appId} onChange={this.handleChange} ></AppSelect>
             {' '}
             搜索:{' '}<Search
              placeholder="搜索服务url或beanId"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        </Card>
        <br/>
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          size='small'
          onChange={this.onPageChange}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default ApmLogByApi;
