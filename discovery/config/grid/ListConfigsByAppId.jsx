import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card,Popover} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewConfig from '../form/NewConfig';
import ListLogByConfigId from './ListLogByConfigId';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ListActiveServerByConfigAppId from './ListActiveServerByConfigAppId';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_CONFIG_CENTER.list;
const DELETE_URL=URI.LIST_CONFIG_CENTER.delete;
const PUBLISH_URL=URI.LIST_CONFIG_CENTER.publish;
const listAllEnvUrl=URI.CORE_ENVIRONMENTS.listAll;

class ListConfigsByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.configAppId=this.props.appId; //要显示应用的appId
    this.searchFilters = {};
    this.sorter = {};
    this.filters = {configAppId:[this.configAppId]};
    this.defaultPagination = {pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`};
    this.state={
      pagination:{...this.defaultPagination},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      currentId:'',
      loading: true,
      visible:false,
      env:'ALL',
      action:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }
  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }
  onPageChange=(pagination, filters, sorter)=>{
    this.sorter = sorter.order ? {'order' : sorter.order, 'field' : sorter.field} : {};
    this.loadData(pagination);
  }
  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {}
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    GridActions.loadData(this,LIST_URL,pagination,this.filters,this.sorter,this.searchFilters);
  }
  publish=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    AjaxUtils.post(PUBLISH_URL,{"ids":ids},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功发布("+data.msg+")个配置!");
        this.loadData();
      }
    });
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }
  editData=(record)=>{
      this.setState({visible: true,currentId:record.id,action:'edit'});
  }
  showModal=()=>{
    this.setState({visible: true,currentId:'',action:'new'});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag==true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  //通过ajax远程载入数据
  search=(value)=>{
    this.searchFilters = value ? {"configValue":value,"configId":value,"configAppId":value} : {};
    this.loadData(this.defaultPagination);
  }

  //当选择环境时
  onEnvChange=(value)=>{
    this.setState({env:value});
      this.filters.environment=[value];
    this.loadData(this.defaultPagination);
  }

  realTimePush=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({visible: true,currentId:ids,action:'realTime'});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '状态',
      dataIndex: 'status',
      width:'8%',
      sorter: true,
      render:(text,record)=>{
        if(text==="1"){
          return <Tag color='green'>已发布</Tag>
        }else{
          return <Tag>未发布</Tag>
        }
      }
    },{
      title: '配置Id',
      dataIndex: 'configId',
      width: '14%',
      sorter: true,
      render:(text,record)=>{
            return <Popover content={record.remark} title="备注" >{text}</Popover>;
      }
    },{
        title: '配置值',
        dataIndex: 'configValue',
        width:'20%',
        sorter: true
      },{
        title: '发布环境',
        dataIndex: 'environment',
        width: '10%',
        sorter: true,
        render:(text,record)=>{if(text==='ALL'){return "全部"}else{return text;}}
      },{
        title: '发布应用',
        dataIndex: 'configAppId',
        width:'10%',
        sorter: true,
          render:(text,record)=>{if(text==='ALL'){return <Tag>公共</Tag>}else{return text;}}
      },{
        title: '发布IP',
        dataIndex: 'ip',
        width:'10%',
        sorter: true,
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'15%',
        sorter: true
      },{
        title: '操作',
        dataIndex: 'state',
        width:'8%',
        render:(text,record)=>{return <a onClick={this.editData.bind(this,record)} >修改</a>}
      }];

      const expandedRow=function(record){
        return (
          <Card title="变更日记">
              <ListLogByConfigId configId={record.configId} env={record.environment} appId={record.configAppId} />
          </Card>
        );
      }

    return (
      <div>
        <Modal key={Math.random()} title={this.state.action==='realTime'?'实时推送配置':'配置属性'} maskClosable={false}
            visible={this.state.visible}
            width='950px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {this.state.action==='realTime'?
            <ListActiveServerByConfigAppId ids={this.state.currentId} close={this.closeModal} />
            :
            <NewConfig id={this.state.currentId} appId={this.configAppId} env={this.state.env} close={this.closeModal} />
            }
        </Modal>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={16} >
              <Button  type="primary" onClick={this.showModal} icon="plus-circle-o"  >新增配置</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除配置","确定要删除选中配置吗?",this.deleteData)} icon="delete" disabled={!hasSelected} >删除</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"发布配置","确定要发布选中配置吗?发布后服务实例会通过心跳自动拉取并更新到本地缓存中!",this.publish)} icon="check" disabled={!hasSelected}   >发布</Button>{' '}
              <Button  type="ghost" onClick={this.realTimePush} icon="sync" disabled={!hasSelected}   >手动同步</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
              环境:<AjaxSelect value={this.state.env} onChange={this.onEnvChange} url={listAllEnvUrl}  options={{showSearch:true,style:{minWidth:'80px'}} } valueId="configId" textId="configId" style={{minWidth:'250px'}} />
          </Col>
          <Col span={8}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索配置Id或配置值"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>

        <Table
          bordered={true}
          rowKey={record => record.id}
          rowSelection={rowSelection}
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

export default ListConfigsByAppId;
