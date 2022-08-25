import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Button,Modal,Input,Divider,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';

const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIPORTAL_CHANGE.list;
const LIST_URL_ME=URI.CORE_APIPORTAL_CHANGE.listMe;
const DEL_URL=URI.CORE_APIPORTAL_CHANGE.delete;
const READALL=URI.CORE_APIPORTAL_CHANGE.readall;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

class ListApiVersionChange extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters = {};
    this.sorter = {};
    this.defaultPagination = {pageSize:20,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`};
    this.state={
      pagination:{...this.defaultPagination},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      collapsed:false,
      currentRecord:'',
      status:'0',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
    this.sorter = sorter.order ? {'order':sorter.order,'field':sorter.field} : {};
    this.loadData(pagination);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {};
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination)=>{
    let url=LIST_URL+"?status="+this.state.status;
    let filters={};
    GridActions.loadData(this,url,pagination,filters,this.sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    value = value.trim();
    this.searchFilters= value ? {"apiUrl":value,"apiName":value,configName:value,tags:value} : {};
    this.loadData(this.defaultPagination);
  }

  showConfirm=()=>{
    var self=this;
    confirm({
    title: '您确认要删除选中应用吗?',
    content: '注意:删除后不可恢复!',
    onOk(){
      return self.deleteData();
    },
    onCancel() {},
    });
  }

  deleteData=(argIds)=>{
      GridActions.deleteData(this,DEL_URL,argIds);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false});
      this.loadData();
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  refuse=(currentRecord)=>{
      this.setState({currentRecord:currentRecord,visible: true,});
  }

  readApi=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(READALL,{},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功标记("+data.msg+")个未读记录!");
        this.loadData();
      }
    });
  }

  setStatus=(e)=>{
    let value=e.target.value;
    this.setState({status:value}, () => {
      this.loadData(this.defaultPagination);
    })
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (
        <Card>
        <Tabs defaultActiveKey="ParamsConfig"  >
          <TabPane tab="API变更详情" key="details">
              <h3>变更说明:{record.title}</h3>
              <h3><Icon type="user-add" style={{fontSize:'14px'}} />发布者:{record.creatorName}</h3>
              <h3><Icon type="clock-circle" style={{fontSize:'14px'}} />发布时间:{record.createTime}</h3>
              <h3>变更内容:</h3>
              <div>{record.body}</div>
          </TabPane>
          <TabPane tab="API文档" key="apidoc">
                <ShowApiDoc id={record.apiId} />
          </TabPane>
        </Tabs>
        </Card>
        );
    }

    const columns=[{
        title: '',
        dataIndex: 'readFlag',
        width: '5%',
        sorter: true,
        render:(text,record)=>{
          if(text===0){
            return <Tag color='red' >未读</Tag>;
          }else{
            return <Tag color='green' >已读</Tag>;
          }
        }
      },{
        title: '变更说明',
        dataIndex: 'title',
        width: '30%',
        ellipsis: true,
      },{
        title: 'API名称',
        dataIndex: 'apiName',
        width:'15%',
        ellipsis: true,
      },{
        title: '变更API',
        dataIndex: 'apiUrl',
        width: '20%',
        sorter: true,
        ellipsis: true,
      },{
        title: '发布者',
        dataIndex: 'creator',
        width:'8%',
        ellipsis: true,
      },{
        title: '发布时间',
        dataIndex: 'createTime',
        width:'15%',
        ellipsis: true,
      },{
        title: '版本',
        dataIndex: 'apiVersion',
        width:'6%',
      }];

    return (
        <div style={{ background: '#fff',padding:25,borderRadius:'4px'}} >
         <Row style={{marginBottom:5}} gutter={0} >
             <Col span={12} >
               <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
               <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >删除</Button>{' '}
               <Button  type="ghost" onClick={this.readApi} icon="check"  >全部标为已读</Button>
             </Col>
             <Col span={12}>
              <span style={{float:'right'}} >
                <Radio.Group  value={this.state.status} onChange={this.setStatus} >
                  <Radio.Button  value="0">通知我的 </Radio.Button>
                  <Radio.Button  value="1">我发布的</Radio.Button>
                </Radio.Group>

                API搜索:<Search
                 placeholder="URL|服务名"
                 style={{ width: 260 }}
                 onSearch={value => this.search(value)}
                 onChange={e=>{this.searchKeywords=e.target.value}}
               />
                </span>
             </Col>
           </Row>

           <Table
             bordered={false}
             rowSelection={rowSelection}
             rowKey={record => record.id}
             expandedRowRender={expandedRow}
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

export default ListApiVersionChange;
