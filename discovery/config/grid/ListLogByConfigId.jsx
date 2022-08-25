import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card,Popover,Popconfirm} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.LIST_CONFIGCENTER_LOG.list;
const DELETE_URL=URI.LIST_CONFIGCENTER_LOG.delete;
const CLEAR_URL=URI.LIST_CONFIGCENTER_LOG.clear;
const RECOVERY_URL=URI.LIST_CONFIGCENTER_LOG.recover;

class ListLogByConfigId extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.configId;
    this.env=this.props.env;
    this.configAppId=this.props.appId;
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      currentId:'',
      loading: true,
      visible:false,
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
    filters.configId=[this.configId];
    filters.configAppId=[this.configAppId];
    sorter={"order":'desc',"field":'editTime'};//使用configId升序排序
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  recover=(record)=>{
    this.setState({loading:true});
    AjaxUtils.post(RECOVERY_URL,{id:record.id},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功恢复("+data.msg+")个配置!");
        this.loadData();
      }
    });
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }
  editData=(record)=>{
      this.setState({visible: true,currentId:record.id});
  }
  showModal=()=>{
    this.setState({visible: true,currentId:''});
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
    let filters={};
    filters.configId=[this.configId];
    filters.configAppId=[this.configAppId];
    let sorter={};
    let searchFilters={};
    searchFilters={"configValue":value,"configId":value,"configAppId":value};
    sorter={"order":'ascend',"field":'configId'};//使用configId升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
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
        render:(text,record)=>{if(text==='ALL'){return "全部"}else{return text;}}
      },{
        title: '发布IP',
        dataIndex: 'ip',
        width:'10%',
        sorter: true
      },{
        title: '操作者',
        dataIndex: 'editor',
        width:'10%',
        sorter: true
      },{
        title: '作废时间',
        dataIndex: 'editTime',
        width:'15%',
        sorter: true
      },{
        title: '操作',
        dataIndex: 'state',
        width:'8%',
        render:(text,record)=>{return <a><Popconfirm title="确定恢复?" onConfirm={this.recover.bind(this,record)}>恢复</Popconfirm></a>}
      }];

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除日记","确定要删除选中日记吗?",this.deleteData)} icon="delete" disabled={!hasSelected} >删除日记</Button>{' '}
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
          size='small'
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default ListLogByConfigId;
