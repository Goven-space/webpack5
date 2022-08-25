import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout,Breadcrumb,BackTop} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';
import NewAppyApi from '../form/NewAppyApi';

//需要申请的apis

const { Sider, Content,Header } = Layout;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIPORTAL_APICONFIG.listByPageRequireAppy;
const DEL_URL=URI.CORE_APIPORTAL_APICONFIG.delete;
const FOLLOW_URL=URI.CORE_APIPORTAL_APICONFIG.follow;
const ExportExcel=URI.CORE_APIPORTAL_APICONFIG.exportExcel;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

class ListApiByRequireAppy extends React.Component {
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
      selectApiIds:[],
      selectApiNames:[],
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.state.pagination.current=1;
    if(nextProps.categoryId!==this.categoryId || this.appId!==nextProps.appId){
        this.categoryId=nextProps.categoryId;
        this.appId=nextProps.appId;
        this.loadData();
    }
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
    let url=LIST_URL+"?appId="+this.appId+"&categoryId="+this.categoryId;
    let searchFilters={};
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  search=(value,pagination=this.state.pagination)=>{
      let filters={};
      let sorter={};
      let searchFilters={"mapUrl":value,"beanId":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      let url=LIST_URL+"?appId="+this.appId;
      this.searchFilters=searchFilters;
      this.state.pagination.current=1;
      GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false});
      if(reLoadFlag){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  appyApi=(currentRecord)=>{
      this.state.selectApiIds=[];
      this.state.selectApiNames=[];
      this.state.selectApiIds[0]=currentRecord.id;
      this.state.selectApiNames[0]=currentRecord.configName;
      this.setState({visible: true,});
  }

  //批量申请api调用
  batchAppyApis=()=>{
    this.state.selectApiIds=[];
    this.state.selectApiNames=[];
    this.state.selectedRows.forEach((item, i) => {
      this.state.selectApiIds[i]=item.id;
      this.state.selectApiNames[i]=item.configName;
    });
    this.setState({visible: true,});
  }

//导出到excel
  downloadApis=()=>{
    let selectApiIds=[];
    this.state.selectedRows.forEach((item, i) => {
      selectApiIds[i]=item.id;
    });
    let url=ExportExcel+"?ids="+selectApiIds.join(",");
    AjaxUtils.get(url,(data)=>{
      window.open(URI.baseResUrl+data.msg);
    });
  }

 //删除API
  deleteAPI=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(DEL_URL,{ids:id},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功删除("+data.msg+")个API!");
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
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.appyStatus === 0 || record.appyStatus === 1,
        name: record.name,
      })
    };
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
        title: 'URL',
        dataIndex: 'mapUrl',
        width: '25%',
        sorter: true,
        ellipsis: true,
        render:(text,record)=>{
          if(record.authType===0){
            return <span><Icon type="user-delete"  title='匿名访问' style={{color:'red'}} />{text}</span>;
          }else if(record.authType===2){
            return <span><Icon type="safety"  title='需要申请'  style={{color:'#108ee9'}} />{text}</span>;
          }else if(record.authType===3){
            return <span><Icon type="key"  title='AppKey认证'  style={{color:'#FF7F50'}} />{text}</span>;
          }else{
            return text;
          }
        }
      },{
        title: '名称',
        dataIndex: 'configName',
        width:'20%',
        ellipsis: true,
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width:'8%',
      },{
        title: '版本',
        dataIndex: 'version',
        width:'8%'
      },{
        title: '注册者',
        dataIndex: 'creatorName',
        width:'10%',
        sorter: true,
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'15%',
        sorter: true,
      },{
        title: '申请状态',
        dataIndex: 'appyStatusInfo',
        width:'8%',
        render:(text,record)=>{
          if(record.appyStatus==0){
            return <Tag color='red'>审批中</Tag>;
          }else if(record.appyStatus==1){
            return <Tag color='green'>已通过</Tag>;
          }else if(record.appyStatus==2){
            return <a onClick={this.appyApi.bind(this,record)}>再次申请</a>;
          }else{
            return <a onClick={this.appyApi.bind(this,record)}>申请调用</a>;
          }
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
            <NewAppyApi  apiIds={this.state.selectApiIds} apiNames={this.state.selectApiNames} close={this.closeModal} />
          </Modal>

         <Row style={{marginBottom:5}} gutter={0} >
             <Col span={12} >
                 <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
                 <Button  type="ghost" onClick={this.batchAppyApis} icon="user"  disabled={!hasSelected} >批量申请</Button>{' '}
                 <Button  type="ghost" onClick={this.downloadApis} icon="file"  disabled={!hasSelected} >导出清单</Button>
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

export default ListApiByRequireAppy;
