import React from 'react';
import {Table,Card,Icon,Menu,Popconfirm,Button,Modal,Input,Row,Col,Tag,Layout} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import ReactJson from 'react-json-view'

//数据异常监控-数据量异常监控

const { Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const SubMenu = Menu.SubMenu;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.DATAQUALITY_DATACONTENT_ERRORDATA.list;
const DELETE_URL=URI.ETL.DATAQUALITY_DATACONTENT_ERRORDATA.delete;
const EXCEL_URL=URI.ETL.DATAQUALITY_DATACONTENT_ERRORDATA.excel;

class ListDataContentErrorData extends React.Component {
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
   this.loadData(pagination,filters,sorter);
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
    this.setState({loading:true});
    let postData={"parentId":this.id};
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
      title: '注意，清空后不可恢复!',
      content: '确认清空!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  exportExcel=()=>{
      let url=EXCEL_URL+"?parentId="+this.id;
      GridActions.loadData(this,url,this.state.pagination,{},{},{},(data)=>{
          window.open(URI.baseResUrl+data.msg);
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
        title: 'id',
        dataIndex: 'id',
        width: '20%'
      },{
          title: '错误原因',
          dataIndex: 'P_ErrorRuleName',
          width: '40%',
          ellipsis: true,
      },{
        title: '检测时间',
        dataIndex: 'P_CreateTime',
        width: '15%',
      },{
        title: '事务Id',
        dataIndex: 'P_TransactionId',
        width: '20%',
      }];

      const expandedRow=(record)=>{
        return (
          <div style={{width:this.state.width,backgroundColor:'#ffffff',border:'1px solid #f4f4f4',padding:8}}>
            <ReactJson src={record} />
          </div>
          );
      }

    return (
      <div >
                <Row style={{marginBottom:5}} gutter={0} >
                  <Col span={12} >
                  <ButtonGroup>
                    <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    <Button  type="ghost" onClick={this.showConfirm} icon="delete"  >清空</Button>
                    <Button  type="ghost" onClick={this.exportExcel} icon="file"  >导出</Button>
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
                  loading={loading}
                  onChange={this.onPageChange}
                  pagination={pagination}
                  expandedRowRender={expandedRow}
                />
      </div>
    );
  }
}

export default ListDataContentErrorData;
