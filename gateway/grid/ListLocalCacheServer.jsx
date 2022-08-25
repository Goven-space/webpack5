import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card} from 'antd';
import * as GridActions from '../../core/utils/GridUtils';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.CORE_GATEWAY_MONITOR.listServiceNames;

class ListLocalCacheServer extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters={};
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }
  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }
  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=()=>{
    GridActions.deleteData(this,DELETE_URL);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '服实例名称',
        dataIndex: 'serviceName',
        width:'10%'
      },{
        title: '集群标识',
        dataIndex: 'serverClusterFlag',
        width: '8%'
      },{
        title: 'IP',
        dataIndex: 'serverIP',
        width:'12%',
        render:(text,record)=>{return text+":"+record.serverPort;}
      },{
        title: 'Host',
        dataIndex: 'serviceBaseUrl',
        width:'20%',
        render:(text,record)=>{if(text===''){return '-'}else{return text;} }
      },{
        title: '上线时间',
        dataIndex: 'startTime',
        width:'12%'
      },{
        title: '最后更新',
        dataIndex: 'lastUpdateTime',
        width:'12%'
      },{
        title: '权重',
        dataIndex: 'weight',
        width:'6%',
      }];

    return (
      <div  style={{minHeight:'600px'}} >
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="primary" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={12}>
          </Col>
        </Row>

        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={pagination}
        />
    </div>
    );
  }
}

export default ListLocalCacheServer;
