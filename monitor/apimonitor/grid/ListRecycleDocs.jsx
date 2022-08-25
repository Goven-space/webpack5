import React, { PropTypes } from 'react';
import { Table,Row, Col,Card,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal,Input} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
const confirm = Modal.confirm;

const Search = Input.Search;
const LIST_URL=URI.CORE_RECYCLEDOC.list;
const DELETE_URL=URI.CORE_RECYCLEDOC.delete;
const CLEAR_URL=URI.CORE_RECYCLEDOC.clear;
const GETBYID=URI.CORE_RECYCLEDOC.getById;
const RESTORE=URI.CORE_RECYCLEDOC.restore;

//系统回收站
class ListRecycleDocs extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:10,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
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

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  clearData=()=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(CLEAR_URL,{ids:ids},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        this.loadData();
        AjaxUtils.showInfo(data.msg);
      }
    })
  }

  restoreData=(id)=>{
    this.setState({loading:true});
    let ids=this.state.selectedRowKeys.join(",");
    AjaxUtils.post(RESTORE,{ids:ids},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo(data.msg);
      }
    })
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL,"");
  }


  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"editor":value,"mapUrl":value,"configId":value};
    sorter={"order":'ascend',"field":'_id'};//使用serverId升序排序
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '数据类型',
        dataIndex: 'P_TrashTypeFlag',
        width:'20%',
        render:text => {
          if(text==="API"){
              return <Tag color='blue'>API配置</Tag>;
          }else if(text==="SQL"){
              return <Tag color='blue'>SQL语句</Tag>;
          }else if(text==="VIEW"){
              return <Tag color='blue'>视图模板</Tag>;
          }else if(text==="MODEL"){
              return <Tag color='blue'>数据模型</Tag>;
          }else if(text==="BEAN"){
              return <Tag color='blue'>JavaBean</Tag>;
          }else if(text==="APIDOC"){
              return <Tag color='blue'>API文档</Tag>;
          }
        },
      },{
        title: 'id',
        dataIndex: 'id',
        width: '30%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width: '20%',
      },{
      title: '删除时间',
      dataIndex: 'editTime',
      width:'30%'
      }];

      let expandedRow=function(record){
        return (<Card>
                <Input.TextArea autoSize value={AjaxUtils.formatJson(JSON.stringify(record))} />
              </Card>);
      }

    return (
      <div>
      <Row style={{marginBottom:5}} gutter={0} >
        <Col span={12} >
            <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,"恢复确认","确认要恢复选中的数据吗?",this.restoreData)} icon="check" disabled={!hasSelected}   >恢复</Button>{' '}
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"删除确认","确认永久删除数据吗?",this.deleteData)} icon="delete" disabled={!hasSelected}   >永久删除</Button>{' '}
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,"清空确认","确认永久清空回收站中的数据吗?",this.clearData)} icon="delete"  >清空回收站</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="用户id"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table bordered
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          size='small'
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
    </div>
    );
  }
}

export default ListRecycleDocs;
