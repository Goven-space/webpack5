import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Button,Modal,Input,Divider,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';
import RefuseCallAppy from '../form/RefuseCallAppy';
import ShowApiAppyInfo from '../form/ShowApiAppyInfo';

//待我审批的api表列

const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIPORTAL_APPY.approvers;
const AGREE_URL=URI.CORE_APIPORTAL_APPY.agree;
const DEL_URL=URI.CORE_APIPORTAL_APPY.delete;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

class ListApiByApprover extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:20,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      collapsed:false,
      currentRecord:{},
      status:this.props.status||'0',
      currentIds:'',
      currentApiName:'',
      currentEndDateTime:'',
      action:'',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    this.state.pagination.current=1;
    if(nextProps.status!==this.status){
        this.state.status=nextProps.status;
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
    let url=LIST_URL+"?status="+this.state.status;
    let searchFilters={};
    GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  //通过ajax远程载入数据
  search=(value,pagination=this.state.pagination)=>{
      let filters={};
      let sorter={};
      let searchFilters={"apiUrl":value,"apiName":value,configName:value,tags:value};
      sorter={"order":'ascend',"field":'marpUrl'};//使用mapUrl升序排序
      let url=LIST_URL+"?status="+this.state.status;
      this.searchFilters=searchFilters;
      this.state.pagination.current=1;
      GridActions.loadData(this,url,pagination,filters,sorter,searchFilters);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false});
      this.loadData();
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  refuse=(currentRecord)=>{
      this.setState({action:'refuse',currentIds:currentRecord.id,currentApiName:currentRecord.apiName,currentEndDateTime:currentRecord.endDateTime,visible: true,});
  }

  showAppyInfo=(currentRecord)=>{
      this.setState({action:'showinfo',currentRecord:currentRecord,visible: true,});
  }

  delete=(id)=>{
    this.setState({loading:true});
    AjaxUtils.post(DEL_URL,{ids:id},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo("成功删除("+data.msg+")个申请记录!");
        this.loadData();
      }
    });
  }

  setStatus=(e)=>{
    let value=e.target.value;
    this.state.status=value;
    this.loadData();
  }

  //批量审批
  batchApprove=()=>{
    this.setState({currentIds:this.state.selectedRowKeys.join(","),currentApiName:'批量审批',currentEndDateTime:'-',visible: true,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
      return (
        <Card>
                <ShowApiDoc id={record.apiId} />
        </Card>
        );
    }

    const columns=[{
      title:'状态',
      width:'8%',
      render:(text,r)=>{
        if(this.state.status=='0'){
          return <Tag color='blue'>待审批</Tag>;
        }else if(this.state.status=='1'){
          return <Tag color='green'>已通过</Tag>;
        }else if(this.state.status=='2'){
          return <Tag color='red'>已拒绝</Tag>;
        }
      }
    },{
        title: 'API URI',
        dataIndex: 'apiUrl',
        width: '20%',
        sorter: true,
        ellipsis: true,
      },{
        title: 'API名称',
        dataIndex: 'apiName',
        width:'15%',
        ellipsis: true,
        render: (text,record) => {
          return <a  onClick={this.showAppyInfo.bind(this,record)} >{text}</a>;
        }
      },{
        title: '申请者',
        dataIndex: 'userName',
        width:'8%',
        ellipsis: true,
      },{
        title: '联系电话',
        dataIndex: 'tel',
        width:'10%',
        ellipsis: true,
      },{
        title: '申请时间',
        dataIndex: 'createTime',
        width:'13%',
        ellipsis: true,
      },{
        title: '有效期',
        dataIndex: 'endDateTime',
        width:'11%',
        render: (text,record) => {
          if(text===''){
            return "永久";
          }else{
            return text;
          }
        }
      },{
        title: '备注',
        dataIndex: 'remark',
        width:'15%',
        ellipsis: true,
        render: (text,record) => {
          if(record.refuse!==undefined){
            return "申请说明:"+text+",审批:"+record.refuse;
          }else{
            return text;
          }
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'6%',
        render: (text,record) => {
          return this.state.status==='0' ? <span><a  onClick={this.refuse.bind(this,record)} >审批</a></span>
          :
          <a onClick={AjaxUtils.showConfirm.bind(this,"删除确认","删除本API调用申请记录吗,用户将失去调用权限!",this.delete.bind(this,record.id))} >删除</a>;
        }
      }];

    let formContent;
    if(this.state.action==='showinfo'){
      formContent=<ShowApiAppyInfo record={this.state.currentRecord} close={this.closeModal} />;
    }else{
      formContent=<RefuseCallAppy id={this.state.currentIds} apiName={this.state.currentApiName} endDateTime={this.state.currentEndDateTime}  close={this.closeModal} />;
    }

    return (
        <div style={{ background: '#fff',padding:25,borderRadius:'4px'}} >
          <Modal key={Math.random()} title='API调用申请审批' maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='850px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            {formContent}
          </Modal>

         <Row style={{marginBottom:5}} gutter={0} >
             <Col span={12} >
               <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
              {
                this.state.status=='0'?
                <Button  type="ghost" onClick={this.batchApprove} icon="user" disabled={!hasSelected} >批量审批</Button>
                :''
              }
             </Col>
             <Col span={12}>
              <span style={{float:'right'}} >
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
             rowKey={record => record.id}
             expandedRowRender={expandedRow}
             dataSource={rowsData}
             columns={columns}
             loading={loading}
             onChange={this.onPageChange}
             pagination={pagination}
             rowSelection={rowSelection}
           />
        </div>
    );
  }
}

export default ListApiByApprover;
