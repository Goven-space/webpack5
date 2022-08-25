import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';

//我收藏的APIS列表

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const LIST_URL=URI.MARKET.ADMIN.list;
const DELETE_URL=URI.MARKET.ADMIN.cancel;

class ListMyFavoriteApis extends React.Component {
  constructor(props) {
    super(props);
    this.appId='';
    this.userId=AjaxUtils.getCookie("userId");
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      tabActiveKey: 'home',
      panes:[],
      currentId:'',
      serviceId:'',
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


  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确认要取消收藏的API吗?',
      content: '注意:取消后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    //管理员看所有，其他用户只能看自已的
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: 'Method',
      dataIndex: 'methodType',
      width:'10%',
      render:text => {
        if(text==="POST"){
            return <Tag color="#87d068" style={{width:50}} >{text}</Tag>
        }else if(text==="GET"){
            return <Tag color="#108ee9" style={{width:50}} >{text}</Tag>
        }else if(text==="PUT" || text==="DELETE" ){
            return <Tag color="#f50" style={{width:50}} >{text}</Tag>
        }else if(text==="*"){
            return <Tag color="#f50" style={{width:50}} >全部</Tag>
        }
      },
      },{
        title: 'API URL',
        dataIndex: 'url',
        width: '35%',
        render:(text,record) => {
          return <a href={'../market/apis/details.html?id='+record.apiId} target='_balank' >{text}</a>
        }
      },{
        title: 'API名称',
        dataIndex: 'apiName',
        width: '35%',
      },{
        title: '收藏时间',
        dataIndex: 'createTime',
        width:'20%',
        sorter: true,
      }];

    return (
      <div>
           <div style={divStyle}>
            <ButtonGroup>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >取消收藏</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
            </ButtonGroup>
          </div>
          <Table
            bordered={false}
            rowKey={record => record.id}
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

export default ListMyFavoriteApis;
