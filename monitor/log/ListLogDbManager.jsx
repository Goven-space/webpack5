import React, { PropTypes } from 'react';
import { Table,Row, Col,Card,Menu,Icon,message,Tag,Dropdown,Popconfirm,Button,Modal,Input} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
const confirm = Modal.confirm;

const Search = Input.Search;
const LIST_URL=URI.LIST_MONITOR_CENTER.logDbList;
const CHANGE_URL=URI.LIST_MONITOR_CENTER.changeLogDb;

//日志库管理

class ListLogDbManager extends React.Component {
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

  changeLogDb=(dbName)=>{
    this.setState({loading:true});
    AjaxUtils.post(CHANGE_URL,{dbName:dbName},(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        AjaxUtils.showInfo('日志库切换成功!');
        this.loadData();
      }
    })
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '数据库名',
        dataIndex: 'dbName',
        width: '20%',
      },{
        title: '数据库大小',
        dataIndex: 'dbSize',
        width: '30%',
      },{
      title: '数据量',
      dataIndex: 'count',
      width:'30%'
      },{
      title: '当前库',
      dataIndex: 'current',
      width:'10%',
      render:(text,record)=>{
        if(text){
          return <Tag color="red" >是</Tag>
        }else{
          return <Tag>否</Tag>
        }
      }
      }];

    return (
      <div>
      <Row style={{marginBottom:5}} gutter={0} >
        <Col span={12} >
            <Button  type="primary" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button> {' '}
          </Col>
          <Col span={12}>
          </Col>
        </Row>
        <Table bordered
          rowKey={record => record.id}
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

export default ListLogDbManager;
