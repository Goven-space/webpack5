import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card,Popover} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewConfig from '../form/NewConfig';
import ListActiveServerByConfigAppId from './ListActiveServerByConfigAppId';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_CONFIG_CENTER.list;
const DELETE_URL=URI.LIST_CONFIG_CENTER.delete;
const PUBLISH_URL=URI.LIST_CONFIG_CENTER.publish;

class ListNoPublishConfigs extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters={};
    this.sorter = {};
    this.defaultPagination = {pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`};
    this.state={
      pagination:{...this.defaultPagination},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      currentId:'',
      loading: true,
      visible:false,
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
    this.sorter = sorter.order ? {'order':sorter.order,'field':sorter.field} :　{};
    this.loadData(pagination);
  }
  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {};
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    let filters= {status:['0']}
    GridActions.loadData(this,LIST_URL,pagination,filters,this.sorter,this.searchFilters);
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
        if(text==='1'){
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
            <NewConfig id={this.state.currentId} close={this.closeModal} />
            }
        </Modal>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="primary" onClick={this.showModal} icon="plus-circle-o"  >新增配置</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除配置","确定要删除选中配置吗?",this.deleteData)} icon="delete" disabled={!hasSelected} >删除配置</Button>{' '}
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"发布配置","确定要发布选中配置吗?发布后服务实例会通过心跳自动拉取并更新到本地缓存中!",this.publish)} icon="check" disabled={!hasSelected}   >发布配置</Button>{' '}
              <Button  type="ghost" onClick={this.realTimePush} icon="sync" disabled={!hasSelected}   >手动同步</Button>{' '}
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={12}>
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
        />
      </div>
    );
  }
}

export default ListNoPublishConfigs;
