import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout,Breadcrumb,BackTop} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';
import NewAppyApi from '../form/NewAppyApi';

//我发布的API列表

const { Sider, Content,Header } = Layout;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIPORTAL_APICONFIG.listMyPublishApis;
const DEL_URL=URI.CORE_APIPORTAL_APICONFIG.delete;
const FOLLOW_URL=URI.CORE_APIPORTAL_APICONFIG.follow;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

class ListApiByPublishUserId extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId=this.props.categoryId||'';
    this.appId=this.props.appId||'';
    this.state={
      pagination:{pageSize:20,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      collapsed:false,
      currentRecord:'',
      searchValue:'',
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
  loadData=(pagination=this.state.pagination,filters={},sorter={})=>{
    let searchFilters;
    if(this.searchFilters!=undefined && this.searchFilters.mapUrl!==''){
      searchFilters=this.searchFilters; //在搜索状态中
    }else{
      searchFilters={};
    }
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  search=(value,pagination=this.state.pagination)=>{
      let filters={};
      let sorter={};
      let searchFilters={"mapUrl":value,"beanId":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      this.searchFilters=searchFilters;
      this.state.pagination.current=1;
      this.state.searchValue=value;
      GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false});
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  appyApi=(currentRecord)=>{
      this.setState({currentRecord:currentRecord,visible: true,});
  }

 //删除API
  deleteAPI=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(DEL_URL,{ids:id},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功删除("+data.msg+")个API到回收站!");
        this.loadData();
      }
    });
  }

  //关注API
   followAPI=(id,action)=>{
     this.setState({loading:true});
     AjaxUtils.post(FOLLOW_URL,{id:id,action:action},(data)=>{
       this.setState({loading:false});
       if(data.state===false){
         AjaxUtils.showError(data.msg);
       }else{
         AjaxUtils.showInfo(data.msg);
         this.loadData();
       }
     });
   }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (<Card><ShowApiDoc id={record.id} /></Card>);
    }

    const columns=[{
      title: '方法',
      dataIndex: 'methodType',
      width:'8%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
        }else if(text==="DELETE" ){
            return <Tag color="#f50" style={{width:50}} >DEL</Tag>
        }else if(text==="PUT"){
            return <Tag color="pink" style={{width:50}} >{text}</Tag>
        }else if(text==="*"){
            return <Tag color="#f50" style={{width:50}} >全部</Tag>
        }else {
            return <Tag color="blue" style={{width:50}} >{text}</Tag>;
        }
      },
      },{
        title: 'URI',
        dataIndex: 'mapUrl',
        width: '30%',
        sorter: true,
        ellipsis: true,
        render:(text,record)=>{
          if(record.authType===0){
            return <span><Icon type="user-delete"  title='匿名访问' style={{color:'red'}} />{text}</span>;
          }else if(record.authType===2){
            return <span><Icon type="safety"  title='需要申请'  style={{color:'#108ee9'}} />{text}</span>;
          }else{
            return text;
          }
        }
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'23%',
        ellipsis: true,
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'8%',
        ellipsis: true,
      },{
        title: '评价',
        dataIndex: 'commitCount',
        width:'6%',
        render:(text,record)=>{
            return <span style={{fontSize:'16px'}}>{text}</span>;
        }
      },{
        title: '版本',
        dataIndex: 'version',
        width:'6%'
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'13%',
        sorter: true,
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'6%',
        render: (text,record) => {
          return <a onClick={AjaxUtils.showConfirm.bind(this,"下线确认","注意:本API的所有申请记录、关注、评价数据都将被删除!",this.deleteAPI.bind(this,record.id))} >下线</a>;
        }
      }];

    return (
        <div style={{ background: '#fff',padding:25,borderRadius:'4px'}} >
          <Modal key={Math.random()} title='申请API的调用权限' maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='850px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewAppyApi  apiId={this.state.currentRecord.id} apiName={this.state.currentRecord.configName} close={this.closeModal} />
          </Modal>

         <Row style={{marginBottom:5}} gutter={0} >
             <Col span={12} >
                 <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
             </Col>
             <Col span={12}>
              <span style={{float:'right'}} >
                API搜索：<Search
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

export default ListApiByPublishUserId;
