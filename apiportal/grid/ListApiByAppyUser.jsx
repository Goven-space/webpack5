import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Button,Modal,Input,Divider,Radio,Form} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import ShowApiDoc from '../form/ShowApiDoc';
import ShowApiAppyInfo from '../form/ShowApiAppyInfo';

//我申请的API记录

const FormItem = Form.Item;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_APIPORTAL_APPY.myappys;
const DEL_URL=URI.CORE_APIPORTAL_APPY.delete;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

class ListApiByAppyUser extends React.Component {
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
      status:this.props.status||'1',
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

  showAppyInfo=(currentRecord)=>{
      this.setState({action:'showinfo',currentRecord:currentRecord,visible: true,});
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false});
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
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
        }else if(this.state.status=='3'){
          return <Tag color='red'>已过期</Tag>;
        }
      }
    },{
        title: 'API URI',
        dataIndex: 'apiUrl',
        width: '28%',
        sorter: true,
      },{
          title: 'API名称',
          dataIndex: 'apiName',
          width: '10%',
          sorter: true,
          ellipsis: true,
          render: (text,record) => {
            return <a  onClick={this.showAppyInfo.bind(this,record)} >{text}</a>;
          }
      },{
        title: '审批者',
        dataIndex: 'approverUserId',
        width:'8%'
      },{
        title: '申请者',
        dataIndex: 'appyUserId',
        width:'8%',
      },{
        title: '申请时间',
        dataIndex: 'createTime',
        width:'13%'
      },{
        title: '有效期',
        dataIndex: 'endDateTime',
        width:'12%',
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
            return text+",审批意见("+record.refuse+")";
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
          return <a onClick={AjaxUtils.showConfirm.bind(this,"删除确认","需要删除本API调用申请记录吗?删除后将失去调用权限!",this.delete.bind(this,record.id))} >删除</a>;
        }
      }];

    return (
        <div style={{ background: '#fff',padding:25,borderRadius:'4px'}} >
          <Modal key={Math.random()} title='API调用申请信息' maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='850px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <ShowApiAppyInfo record={this.state.currentRecord} close={this.closeModal} />;
          </Modal>
         <Row style={{marginBottom:5}} gutter={0} >
             <Col span={12} >
               <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
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
           />
        </div>
    );
  }
}

export default ListApiByAppyUser;
