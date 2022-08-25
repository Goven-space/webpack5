import React from 'react';
import {Table,Card,Icon,Menu,Popconfirm,Button,Modal,Input,Row,Col,Tag,Layout} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';

//数据异常监控-数据量异常监控

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.DATAQUALITY_PROCESSSTATUS_HISTORYLOG.list;
const DELETE_URL=URI.ETL.DATAQUALITY_PROCESSSTATUS_HISTORYLOG.delete;

class ListProcessStatusLog extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.url=LIST_URL+"?parentId="+this.id;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      menuData:[],
    }
  }

  componentDidMount(){
      this.loadData();
  }


  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.setState({pagination:pagination});
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    let postData={"ids":ids};
    AjaxUtils.post(DELETE_URL,postData,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
        this.loadData();
      }
    });
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '注意，删除后不可恢复!',
      content: '确认删除!',
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
      this.loadData();
      this.setState({visible: false,});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '检测时间',
        dataIndex: 'createTime',
        width: '20%',
      },{
          title: '备注',
          dataIndex: 'remark',
          width: '70%',
        },{
        title: '结果',
        dataIndex: 'result',
        width: '10%',
        render: (text,record) => {
          if(text==='1'){
            return <Tag color='green' >正常</Tag>
          }else{
            return <Tag color='red'>异常</Tag>
          }
        }
      }];

    return (
      <div >
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                  </ButtonGroup>
                  </Col>
                  <Col span={12}>
                  </Col>
                </Row>
                <Table
                  size='small'
                  bordered={false}
                  rowKey={record => record.id}
                  dataSource={rowsData}
                  columns={columns}
                  rowSelection={rowSelection}
                  loading={loading}
                  onChange={this.onPageChange}
                  pagination={pagination}
                />
      </div>
    );
  }
}

export default ListProcessStatusLog;
