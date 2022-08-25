import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout,Breadcrumb,BackTop,List,Avatar,Badge,Typography} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ShowApiDoc from '../../form/ShowApiDoc';
import NewAppyApi from '../../form/NewAppyApi';

const { Title } = Typography;
const { Meta } = Card;
const { Sider, Content,Header } = Layout;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIPORTAL_APICONFIG.listByPage;
const DEL_URL=URI.CORE_APIPORTAL_APICONFIG.delete;
const FOLLOW_URL=URI.CORE_APIPORTAL_APICONFIG.follow;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

//已发布的API按图标展示的列表

class ListApiByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.categoryId=this.props.categoryId||''; //api所属应用分类
    this.appId=this.props.appId||''; //应用id
    this.searchKeyWords=this.props.searchKeyWords||''; //要搜索的关键字
    this.businessClassIds=this.props.businessClassIds||''; //业务域id
    this.tags=this.props.tags||''; //标签id
    this.state={
      pagination:{
        pageSize:20,current:1,showSizeChanger:true,
        showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`,
        onChange:(pageNo,pageSize) => {
          this.onPageChange(pageNo,pageSize);
        },
        onShowSizeChange:(pageNo,pageSize) => {
          this.onPageChange(pageNo,pageSize);
        }
      },
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      collapsed:false,
      currentRecord:'',
      showApiDocId:'',
      selectApiIds:[],
      selectApiNames:[],
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.state.pagination.current=1;
    if(nextProps.categoryId!==this.categoryId || this.appId!==nextProps.appId || this.searchKeyWords!==nextProps.searchKeyWords || nextProps.businessClassIds!==this.businessClassIds || nextProps.tags!==this.tags){
        this.categoryId=nextProps.categoryId||'';
        this.appId=nextProps.appId||'';
        this.searchKeyWords=nextProps.searchKeyWords||'';
        this.businessClassIds=nextProps.businessClassIds||'';
        this.tags=nextProps.tags||'';
        this.loadData();
    }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pageNo,pageSize)=>{
    let pagination=this.state.pagination;
    pagination.current=pageNo;
    pagination.pageSize=pageSize;
    this.setState({pagination:pagination});
    this.loadData(pagination,{},{})
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination,filters={},sorter={})=>{
    let url=LIST_URL+"?appId="+this.appId+"&categoryId="+this.categoryId+"&businessClassIds="+this.businessClassIds+"&tags="+this.tags;
    let searchFilters={};
    let value=this.searchKeyWords;
    if(value!==''){
      searchFilters={"mapUrl":value,"creator":value,"creatorName":value,configName:value,tags:value};
    }
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false});
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
    //this.setState({currentRecord:currentRecord,visible: true,});
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

   //显示API文档
   ShowApiDocPage=(record)=>{
     this.setState({showApiDocId:record.id,currentRecord:record});
   }

   backToApiList=()=>{
     this.setState({showApiDocId:''});
   }

  shareApiDoc=(id)=>{
    let url=host+"/market/apis/share.html?id="+this.state.currentRecord.id;
    window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    return (
        <div style={{ background: '#fff',padding:25,borderRadius:'4px'}} className="apiManage-home">
          <Modal key={Math.random()} title='申请API的调用权限' maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='850px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewAppyApi  apiIds={this.state.selectApiIds} apiNames={this.state.selectApiNames} close={this.closeModal} />
          </Modal>
          {this.state.showApiDocId!==''?
              <span>
                <div style={{marginBottom:10,border:'1px solid #ddd',padding:'10px',backgroundColor:'#fff'}} title='操作'>
                  <Button  type="primary" onClick={this.backToApiList} icon="caret-left"  >返回</Button>
                  {' '}
                  {this.state.currentRecord.authType===2?
                      <Button type="ghost" onClick={this.appyApi.bind(this,this.state.currentRecord)} icon='user' >调用申请</Button>:''
                  }
                  {' '}
                  {this.state.currentRecord.followFlag===true?
                      <Button type="ghost" onClick={this.followAPI.bind(this,this.state.currentRecord.id,"cancel")} icon="close" >取消关注</Button>:
                      <Button type="ghost" onClick={this.followAPI.bind(this,this.state.currentRecord.id,"follow")} icon="heart" >关注API</Button>
                  }
                  {' '}
                  <Button  type="ghost" onClick={this.shareApiDoc} icon="share-alt"  >分享链接</Button>
                </div>
                <Card>
                  <ShowApiDoc  id={this.state.showApiDocId} />
                </Card>
              </span>
          :
          <span>

                <List
                  grid={{ gutter: 32, column: 4 }}
                  pagination={this.state.pagination}
                  dataSource={rowsData}
                  renderItem={item => {
                    let aclItem;
                    if(item.authType===0){
                      aclItem= <img src="/res/iconres/images/anonymous-access.png" type="user-delete"  title='匿名访问' style={{color:'#fd8e98',width:'65px'}} />;
                    }else if(item.authType===2){
                      aclItem= <img type="safety"  title='需要申请' src="/res/iconres/images/safety.png" style={{color:'#3dd4db',width:'65px'}} />;
                    }else if(item.authType===3){
                      aclItem= <img type="key" src="/res/iconres/images/key.png" title='AppKey认证'  style={{color:'#3dd4db',width:'65px'}} />;
                    }else if(item.permission!=='' && item.permission!==undefined){
                      let title="绑定权限:"+item.permission;
                      aclItem= <img type="lock"  title={title} style={{color:'#3dd4db', width:'65px'}} src="/res/iconres/images/lock.png" />;
                    }else{
                      aclItem= <img src="/res/iconres/images/api.png" type="api" title='token认证' style={{color:'#3dd4db',width:'65px'}} />;
                    }
                    let method=item.methodType;
                    let methodTag;
                    if(method==="POST"){
                        methodTag = <Tag color="#95db77"  >POST</Tag>
                    }else if(method==="GET"){
                        methodTag = <Tag color="#4badf4" >GET</Tag>
                    }else if(method==="DELETE" ){
                        methodTag = <Tag color="#f50"  >DELETE</Tag>
                    }else if(method==="PUT"){
                        methodTag = <Tag color="pink"  >PUT</Tag>
                    }else if(method==="*"){
                        methodTag = <Tag color="#f50"  >全部</Tag>
                    }else if(method==="PATCH"){
                        methodTag= <Tag color="blue"  >PATCH</Tag>;
                    }
                    return (
                    <List.Item>
                      <Card
                        onClick={this.ShowApiDocPage.bind(this,item)}
                        hoverable={true}
                        style={{overflow:'hidden'}}
                      >
                      <div style={{minHeight:'250px',height:'250px',overflow:'hidden',textOverflow:'ellipsis'}}>
                        <div style={{marginBottom:'10px'}}>{aclItem}</div>
                        <div style={{fontSize:'16px',fontWeight:'bold',maxHeight:'52px',minHeight:'30px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.configName}</div>
                        <div style={{lineHeight:"25px",color:'#000'}}>
													<div className="apiManage-home-content-item"><span style={{marginRight:5}}><img src="/res/iconres/images/address.png" /></span>{item.mapUrl}</div>
													<div className="apiManage-home-content-item"><span style={{marginRight:5}}><img src="/res/iconres/images/publishUserId.png" /></span>{item.publishUserId}</div>
													<div className="apiManage-home-content-item"><span style={{marginRight:5}}><img src="/res/iconres/images/time.png" /></span>{item.editTime}</div>	
													<div className="apiManage-home-content-item"><span style={{marginRight:5}}><img src="/res/iconres/images/followCount.png" /></span>关注:{item.followCount} <span style={{marginRight:5,marginLeft:"15px"}}><img src="/res/iconres/images/commitCount.png" /></span>评价:{item.commitCount}</div>																						
												</div>
												<div style={{marginBottom:"0px",marginTop:"15px", }}>
													<div>{methodTag}  <span style={{border:"1px solid #ccc",padding:"3px",borderRadius:'5px', marginLeft:"10px"}}>版本:{item.version}</span></div>
												</div>
                      </div>
                      </Card>
                    </List.Item>
                    );
                  }}
                />	
          </span>
        }
        </div>
    );
  }
}

export default ListApiByAppId;
