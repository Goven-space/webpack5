import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewDataCacheRule from '../form/NewDataCacheRule';
import ListSecurityScopeItems from './ListSecurityScopeItems';
import ListAPIDataCache from './ListAPIDataCache';

//数据缓存规则

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_SECURITY.list;
const DELETE_URL=URI.CORE_GATEWAY_SECURITY.delete;
const ButtonGroup = Button.Group;
const exportServices=URI.CORE_GATEWAY_SECURITY.export;
const TabPane = Tabs.TabPane;

class ListDataCacheRule extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.securityType=7;
    this.state={
      pagination:{pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'',
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您确认要删除选中规则吗?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?securityType="+this.securityType;
    sorter={"order":'ascend',"field":'sortNum'};
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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

  //导出服务
  exportData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exportServices, { ids: ids });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configName":value,"configName":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=LIST_URL+"?securityType="+this.securityType;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '缓存规则',
        dataIndex: 'configName',
        width: '30%',
      },{
        title: '缓存时间(秒)',
        dataIndex: 'cacheTime',
        width: '10%'
      },{
        title: '缓存维度',
        dataIndex: 'keyType',
        width: '10%',
        render: (text,record) =>{
          if(text===1){return <Tag color='green'>按API</Tag>;}
          else if(text===2){return <Tag color='green'>按API及用户</Tag>;}
          else if(text===3){return <Tag color='green'>按API及参数</Tag>;}
          }
      },{
        title: '存储类型',
        dataIndex: 'storeType',
        width: '8%',
        render: (text,record) =>{
          if(text==="map"){return <Tag color='red'>内存中</Tag>;}
          else if(text=="mongo"){return <Tag color='blue'>MongoDB中</Tag>;}
          else if(text=="redis"){return <Tag color='green'>Redis中</Tag>;}
          }
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'10%',
      },{
        title: '最后修改',
        dataIndex: 'editTime',
        width:'15%',
      },{
        title: '状态',
        dataIndex: 'state',
        width:'10%',
        render: (text,record) => {if(text==='Y'){return <Tag color='green'>启用</Tag>} else if(text==='N'){return <Tag color='red'>停用</Tag>}else if(text==='D'){return <Tag color='red'>调试</Tag>}}
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
            return (<span>
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
            </span>);
        }
      },];

      const expandedRow=(record)=>{
        return (
        <Card>
          <Tabs defaultActiveKey="api" size='large' >
            <TabPane tab="API范围设置" key="api" animated={false}>
              <ListSecurityScopeItems id={record.id}></ListSecurityScopeItems>
            </TabPane>
            <TabPane tab="缓存数据" key="data" animated={false}>
              <ListAPIDataCache parentId={record.id} ></ListAPIDataCache>
            </TabPane>
          </Tabs>
        </Card>);
      }

    return (
      <div >
          <Modal key={Math.random()}  maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='1000px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewDataCacheRule  id={currentId}  close={this.closeModal} />
          </Modal>

        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >新增数据缓存规则</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportData)} icon="download"   disabled={!hasSelected}  >导出</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="规则名称"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table
          bordered={false}
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

export default ListDataCacheRule;
