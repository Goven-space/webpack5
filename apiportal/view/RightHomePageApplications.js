import React from 'react';
import { Tabs,Table,Card,Icon,Tag,Button,Input,Divider,Radio,List,Badge,Typography,Avatar} from 'antd';
import { browserHistory } from 'react-router'
import * as GridActions from '../../core/utils/GridUtils';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//右则首页的-应用列表

const { Title } = Typography;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const LIST_URL=URI.LIST_APIPORTAL_APPLICATION.list;
const { Meta } = Card;
const TabPane = Tabs.TabPane;

class HomePageApplications extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:1500,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'1',
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

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?action="+this.state.action;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  setAction=(e)=>{
    let value=e.target.value;
    this.state.action=value;
    this.loadData();
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"portalAppName":value,"portalAppId":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL+"?action="+this.state.action;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  openapp=(portalAppId)=>{
    browserHistory.push(URI.adminIndexUrl+"/apiportal/view?appid="+portalAppId);
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}

    let defaultImg=webappsProjectName+'/res/iconres/images/portal/app4.png';
    return (
      <div style={{minHeight:'500px'}}>
            <div style={{marginBottom:5,textAlign:'center'}} gutter={0} >
                 <Radio.Group  value={this.state.action} onChange={this.setAction} >
                   <Radio.Button  value="1">所有应用 </Radio.Button>
                   <Radio.Button  value="3">我的应用</Radio.Button>
                 </Radio.Group>
                 {' '}<Search
                  placeholder="搜索应用,名称或应用id"
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
            </div>
            <br/>
            <List
              grid={{ gutter: 16, column: 4 }}
              size="large"
              pagination={{
                onChange: page => {
                //  console.log(page);
                },
                pageSize: 16,
              }}
              dataSource={this.state.rowsData}
              renderItem={item => {
                return (
                <List.Item>
                  <Card
                    onClick={this.openapp.bind(this,item.portalAppId)}
                    hoverable={true}
                    style={{ maxWidth:240,maxHeight:200,overflow:'hidden'}}
                  >
                  <center style={{minHeight:'80px'}}>
                    <div style={{marginBottom:'5px'}}>
                        <Badge count={item.total} showZero overflowCount={999}  style={{ backgroundColor: item.countColor||'#1aa5bb' }} >
                          <Avatar size={65}  src={item.src||defaultImg} />
                        </Badge>
                    </div>
                    <Title level={4}>{item.portalAppName}</Title>
                    <div>应用ID:<b>{item.portalAppId}</b></div>
                    <div style={{fontSize:'9pt'}}>审批者:{item.approverUserId}</div>
                    <div style={{fontSize:'9pt'}}>管理员:{item.appSuperAdmin}</div>
                    <div style={{fontSize:'9pt'}}>{item.remark}</div>
                  </center>
                  </Card>
                </List.Item>
                );
              }}
            />
    </div>
    );
  }
}

export default HomePageApplications;
