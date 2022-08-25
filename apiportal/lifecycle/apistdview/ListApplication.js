import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import { browserHistory } from 'react-router'
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.LIST_APIPORTAL_APPLICATION.listAll;
const TopCountUrl=URI.CORE_APIPORTAL_HOEMMENU.topCount;

class ListApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:150,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'',
      visible:false,
      data:{systemCount:0,apiregCount:0,apipublishCount:0,applicationUserCount:0}
    }
  }

  componentDidMount(){
      this.loadData();
      this.loadTopCountData();
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

  //载入统计数据
  loadTopCountData=()=>{
    AjaxUtils.get(TopCountUrl,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL;
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        // console.log(data);
        pagination.total=data.length; //总数
        this.setState({rowsData:data,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
      }
    });
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"portalAppName":value,"portalAppId":value,"creator":value,"creatorName":value};
    sorter={"order":'ascend',"field":'createTime'};//使用userName升序排序
    let url=LIST_URL+"?action=3";
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    let textDivStyle={width:'60%',height:'100%',float:'left',textAlign:'center',position:'relative',top:'10%'};

    const columns=[{
        title: '序号',
        dataIndex: 'index',
        width: '5%',
        render:(text,record,index)=>{return index+1;}
      },{
        title: '应用名称',
        dataIndex: 'portalAppName',
        width: '20%',
      },{
        title: '应用Id',
        dataIndex: 'portalAppId',
        width: '15%',
      },{
        title: 'API注册数',
        dataIndex: 'total_reg',
        width:'10%',
        render: (text,record) => {return <span style={{fontSize:'14px',color:'green'}}>{text}</span>}
      },{
        title: 'API发布数',
        dataIndex: 'total',
        width:'10%',
        render: (text,record) => {return <span style={{fontSize:'14px',color:'green'}}>{text}</span>}
      },{
        title: '管理员',
        dataIndex: 'appSuperAdmin',
        width:'10%',
        ellipsis: true,
      },{
        title: 'API审核者',
        dataIndex: 'approverUserId',
        width:'15%',
        ellipsis: true,
      },{
        title: '创建者',
        dataIndex: 'creatorName',
        width: '10%'
      },{
        title: '说明',
        dataIndex: 'remark',
        width: '10%'
      }];
    return (
      <div>
        <Row gutter={24} >
          <Col span={6}>
              <div style={{background:'#fff',height:'80px',border:'1px solid #f4f4f4'}}  >
                <div style={{width:'40%',float:'left',background:'#f4f4f4',height:'100%',textAlign:'center'}}>
                        <Icon type="appstore" style={{fontSize:'40px',color:'rgb(111, 191, 231)',paddingTop:'20px'}}/>
                </div>
                <div style={textDivStyle}>
                      <span style={{fontSize:'22px'}}><b>{this.state.data.systemCount}</b></span>
                      <div>接入系统数</div>
                  </div>
              </div>
          </Col>
          <Col span={6} >
            <div style={{background:'#fff',height:'80px',border:'1px solid #f4f4f4'}}  >
              <div style={{width:'40%',float:'left',background:'#f4f4f4',height:'100%',textAlign:'center'}}>
                      <Icon type="api" style={{fontSize:'40px',color:'rgb(111, 191, 231)',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.data.apiregCount}</b></span>
                        <div>API注册总数</div>
                  </div>
              </div>
          </Col>
          <Col span={6}>
          <div style={{background:'#fff',height:'80px',border:'1px solid #f4f4f4'}}  >
            <div style={{width:'40%',float:'left',background:'#f4f4f4',height:'100%',textAlign:'center'}}>
                      <Icon type="tag" style={{fontSize:'40px',color:'rgb(111, 191, 231)',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.data.apipublishCount}</b></span>
                        <div>我发布的API数</div>
                  </div>
              </div>
          </Col>
          <Col span={6}>
          <div style={{background:'#fff',height:'80px',border:'1px solid #f4f4f4'}}  >
            <div style={{width:'40%',float:'left',background:'#f4f4f4',height:'100%',textAlign:'center'}}>
                        <Icon type="user" style={{fontSize:'40px',color:'rgb(111, 191, 231)',paddingTop:'20px'}}/>
                  </div>
                <div style={textDivStyle}>
                        <span style={{fontSize:'22px'}}><b>{this.state.data.applicationUserCount}</b></span>
                        <div>API消费者总数</div>
                  </div>
              </div>
          </Col>
        </Row>
        <div style={{height:'30px'}}></div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={false}
        />
    </div>
    );
  }
}

export default ListApplication;
