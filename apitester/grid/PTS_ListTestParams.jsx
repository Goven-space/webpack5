import React from 'react';
import {Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider,Badge} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import PTS_NewTestParams from '../form/PTS_NewTestParams';

//压测参数配置

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_PTS_TESTPARAMA.list;
const DELETE_URL=URI.CORE_PTS_TESTPARAMA.delete;

class PTS_ListTestParams extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
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

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:record.id});
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id});
    }
  }

  runTask=(id)=>{
    let url=RUNTASK_URL.replace('{id}',id);
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          AjaxUtils.showInfo(data.msg);
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '变量Id',
        dataIndex: 'paramId',
        width:'20%'
      },{
        title: '变量名称',
        dataIndex: 'paramName',
        width: '30%'
      },{
        title: '随机变量',
        dataIndex: 'randomFlag',
        width:'10%',
        render: (text,record) => {
          if(text==1){
            return <Tag color='green' >是</Tag>
          }else{
            return <Tag color='blue' >否</Tag>
          }
        }
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'10%',
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width:'15%',
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'10%',
        render: (text,record) => {
          return  <a onClick={this.onActionClick.bind(this,'Edit',record)}>修改</a>;
        }
      },];

    return (
      <div>
        <Modal key={Math.random()} title="变量配置" maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='960px'
            style={{top:'20px'}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <PTS_NewTestParams appId={this.appId} id={currentId} close={this.closeModal} />
        </Modal>
         <div style={divStyle}>
          <ButtonGroup>
          <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增变量</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
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

export default PTS_ListTestParams;
