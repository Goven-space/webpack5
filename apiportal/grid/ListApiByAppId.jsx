import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Popover,Radio,Layout,Breadcrumb,BackTop,List,Avatar,Badge,Typography} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';
import NewAppyApi from '../form/NewAppyApi';

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
    this.categoryId=this.props.categoryId||'';
    this.appId=this.props.appId||'';
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
    if(nextProps.categoryId!==this.categoryId || this.appId!==nextProps.appId){
        this.categoryId=nextProps.categoryId;
        this.appId=nextProps.appId;
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
    if(this.appId===undefined){this.appId='';}
    let url=LIST_URL+"?appId="+this.appId+"&categoryId="+this.categoryId;
    let searchFilters;
    if(this.searchFilters!=undefined && this.searchFilters.mapUrl!==''){
      searchFilters=this.searchFilters; //在搜索状态中
    }else{
      searchFilters={};
    }
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  search=(value,pagination=this.state.pagination)=>{
      let filters={};
      let sorter={};
      let searchFilters={"mapUrl":value,"creator":value,"creatorName":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      let url=LIST_URL+"?appId="+this.appId;
      this.searchFilters=searchFilters;
      this.state.pagination.current=1;
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
          {this.state.showApiDocId!==''?
              <span>
                <div style={{marginBottom:10,border:'1px solid #ccc',padding:'10px',backgroundColor:'#fcfcfc'}} title='操作'>
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
                  grid={{ gutter: 16, column: 4 }}
                  pagination={this.state.pagination}
                  dataSource={rowsData}
                  renderItem={item => {
                    let aclItem;
                    if(item.authType===0){
                      aclItem= <Icon type="user-delete"  title='匿名访问' style={{color:'#fd8e98',fontSize:'65px'}} />;
                    }else if(item.authType===2){
                      aclItem= <Icon type="safety"  title='需要申请'  style={{color:'#3dd4db',fontSize:'65px'}} />;
                    }else if(item.authType===3){
                      aclItem= <Icon type="key"  title='AppKey认证'  style={{color:'#3dd4db',fontSize:'65px'}} />;
                    }else if(item.permission!=='' && item.permission!==undefined){
                      let title="绑定权限:"+item.permission;
                      aclItem= <Icon type="lock" title={title} style={{color:'#3dd4db',fontSize:'65px'}} />;
                    }else{
                      aclItem= <Icon type="api" title='token认证' style={{color:'#3dd4db',fontSize:'65px'}} />;
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
                    }
                    return (
                    <List.Item>
                      <Card
                        onClick={this.ShowApiDocPage.bind(this,item)}
                        hoverable={true}
                        style={{ maxWidth: 240,maxHeight:290,overflow:'hidden'}}
                        actions={[
                          methodTag,
                          <span style={{fontSize:'9pt'}}>关注:{item.followCount} 评价:{item.commitCount} </span>,
                          <Tag>版本:{item.version}</Tag>,
                        ]}
                      >
                      <center style={{minHeight:'180px',maxHeight:'200px',overflow:'hidden',textOverflow:'ellipsis'}}>
                        <div style={{marginBottom:'20px'}}>{aclItem}</div>
                        <div style={{fontSize:'16px',fontWeight:'bold',maxHeight:'52px',minHeight:'30px',overflow:'hidden',textOverflow:'ellipsis'}}>{item.configName}</div>
                        <div style={{fontSize:'9pt'}}>{item.mapUrl}</div>
                        <div>{item.publishUserId} at {item.editTime}</div>
                      </center>
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
