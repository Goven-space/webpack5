import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,TreeSelect,Divider} from 'antd';
import NewCategoryData from '../form/NewAuthenticationConfig';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';

//认证数据配置界面

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LISTALL_URL=URI.MARKET.ADMIN.authorizationDataList;
const DELETE_URL=URI.MARKET.ADMIN.authorizationDataDelete;

class ListAuthenticationConfig extends React.Component {
  constructor(props) {
    super(props);
    this.categoryRecord=this.props.record;
    this.categoryId=this.props.categoryId;
    this.appId=this.props.appId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      columns:[],
      loading: true,
      visible:false,
      currentId:'',
      parentNodeId:'',
    }
  }

  componentDidMount(){
      this.loadColumnsData();
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
      this.setState({visible: true,currentId:'',parentNodeId:''});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }else if(action==="NewSubNode"){
      this.setState({visible: true,currentId:'',parentNodeId:record.nodeId});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '您要删除选中配置吗?',
      content: '注意:删除数据后不可恢复!',
      onOk(){
        let ids=self.state.selectedRowKeys.join(",");
        return self.deleteData(ids);
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
    let url=LISTALL_URL+"?categoryId="+this.categoryId;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    if(argIds==='root'){AjaxUtils.showError("不能删除根节点!");return;}
    let postData={"ids":argIds};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      this.setState({loading:false});
      AjaxUtils.showInfo(data.msg);
      this.loadData();
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

  //动态组装列
  loadColumnsData=()=>{
    let inParams=this.categoryRecord.inParams;
    let inParamsData=JSON.parse(inParams);
    inParamsData=inParamsData.filter(dataItem=>dataItem.hidden!==true); //隐藏的列不显示
    let columnsData=inParamsData.map((item,index)=>{
      return {title: item.paramsName,dataIndex: item.paramsId,sorter: true,ellipsis: true};
    });

    //追加一列最后更新时间
    let editTimeCloumns={
      title: '最后更新',
      dataIndex: 'editTime',
      key: 'editTime',
      width:'12%'
    };
    columnsData.push(editTimeCloumns);

    //追加一列操作列
    let actionCloumns={
      title: '操作',
      dataIndex: '',
      key: 'x',
      width:'8%',
      render: (text,record) => {
          //编平结构
          return (<span>
          <a href="javascript:void(0)"  onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>{' '}
          </span>);
      }
    };
    columnsData.push(actionCloumns);

    this.setState({columns:columnsData});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,parentNodeId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}

    return (
      <div>
        <Modal key={Math.random()} title="修改配置" maskClosable={false}
            visible={this.state.visible}
            footer=''
            onOk={this.handleCancel}
            width='950px'
            style={{top:'20px'}}
            onCancel={this.handleCancel} >
            <NewCategoryData id={currentId}  appId={this.appId} categoryId={this.categoryId} parentNodeId={parentNodeId} closeModal={this.closeModal} />
        </Modal>
        <div style={divStyle}>
          <ButtonGroup  style={{marginTop:2}} >
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增配置</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
          </ButtonGroup>
        </div>
        <Table
          bordered={false}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={this.state.columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          defaultExpandAllRows={true}
          size='small'
          rowSelection={rowSelection}
        />
    </div>
    );
  }
}

export default ListAuthenticationConfig;
