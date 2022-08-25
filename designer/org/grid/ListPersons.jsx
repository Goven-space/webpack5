import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Layout,Input,Row,Col,Tag,Divider,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import NewPerson from '../form/NewPerson';
import DeptTree from '../../../core/components/DeptAsynTree';
import EditUserMapRoles from './EditUserMapRoles';
import ListUserLoginLogs from '../../../monitor/log/ListUserLoginLogs';
import ListAllApiLog from '../../../monitor/log/ListAllApiLogByUserId';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const { Sider, Content } = Layout;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_USER_PERSON.list; //显示全部人员
const LIST_DEPT_URL=URI.CORE_USER_PERSON.listByDept; //按部门显示人员
const DELETE_URL=URI.CORE_USER_PERSON.delete;//删除人员
const exporConfigUrl=URI.CORE_USER_PERSON.exporConfigUrl; //导出人员

class ListPersons extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',

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

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:''});
    }else if(action==="Delete"){
      this.deleteData(record.userId);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=(userId="")=>{
    if(userId===""){
      this.state.selectedRows.forEach(function(item){
        if(userId===''){
          userId=item.userId;
        }else{
          userId+=","+item.userId;
        }
      });
    }
    //调用ajax在后端删除数据，前端自动重载一次即可
    this.setState({loading:true});
    let postData={"userId":userId};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      if(data.state===false){
        AjaxUtils.showError(data.errorMsg);
        this.setState({loading:false});
      }else{
        AjaxUtils.showInfo("成功删除("+data.number+")条数据!");
        this.loadData();
      }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

  onTreeNodeSelect=(node)=>{
    let deptCode=node[0];
    this.url=LIST_DEPT_URL.replace("{deptCode}",deptCode);
    this.state.departmentCode=deptCode;
    this.loadData();
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"userName":value,"userId":value};
    sorter={"order":'ascend',"field":'userName'};//使用userName升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    this.state.pagination.current=1;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  //导出所有用户
  exportConfig=()=>{
    let url=exporConfigUrl;
    window.open(url);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '帐号名',
      dataIndex: 'userName',
      sorter: true,
      width:'15%',
      render:(text,record)=>{
          return (<span><Icon type="user" />{text}</span>);
        }
      },{
        title: '帐号Id',
        dataIndex: 'userId',
        width: '15%',
        sorter: true,
      },{
        title: '部门',
        dataIndex: 'departmentName',
        width: '20%'
      },{
        title: '职位',
        dataIndex: 'jobDesc',
        width: '15%'
      },{
        title: '类型',
        dataIndex: 'userType',
        width: '10%',
        render:(text,record)=>{
          if(text===1){return <Tag color="green">用户</Tag>;}
          else if(text===2){return <Tag color="blue">应用</Tag>;}
          else if(text===3){return <Tag color="pink">外网</Tag>;}
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'13%',
        render:(text,record)=>{
            return (
              <span>
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
              <Divider type="vertical" />
              <a  onClick={AjaxUtils.showConfirm.bind(this,"删除帐号","删除后不可恢复!",this.onActionClick.bind(this,"Delete",record))} >删除</a>
            </span>
          );
        }
      },];

    const expandedRow=(record)=>{
      return (
        <Card  bordered={true} bodyStyle={{padding:8}} >
          <Tabs size="large">
            <TabPane  tab="绑定的角色" key="roles"  >
                <EditUserMapRoles memberCode={record.userId} memberName={record.userName} orgResType='USER' />
            </TabPane>
            <TabPane  tab="API调用日志" key="apilog"  >
                <ListAllApiLog userId={record.userId} hiddenCard={true} />
            </TabPane>
            <TabPane  tab="登录日志" key="loginlog"  >
                <ListUserLoginLogs userId={record.userId} hiddenCard={true} />
            </TabPane>
          </Tabs>
        </Card>
        );
    }

    return (
      <Card title="帐号管理" >
      <Layout style={{ background: '#fff',padding:5,minHeight:600 }}>
        <Sider style={{ background: '#fff',maxWidth:'200px'}}  >
          <DeptTree onSelect={this.onTreeNodeSelect}/>
        </Sider>
        <Content style={{left:'-1px',background: '#fff',padding: '5px 20px',borderLeft:'1px solid #e9e9e9',position:'relative'}} >
            <Modal key={Math.random()}  maskClosable={false}
                visible={this.state.visible}
                width='900px'
                style={{ top: 10 }}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                <NewPerson id={currentId} departmentCode={this.state.departmentCode} closeModal={this.closeModal} />
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >注册帐号</Button>{' '}
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>{' '}
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出用户','导出用户后可以使用导入功能重新导入!',this.exportConfig)} icon="download"   >导出</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 <Search
                  placeholder="搜索帐号名或Id"
                  style={{ width: 160 }}
                  prefix={<Icon type="user" />}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              expandedRowRender={expandedRow}
            />
        </Content>
      </Layout>
      </Card>
    );
  }
}

export default ListPersons;
