import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Divider} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';

//压力测试结果列表

const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const LIST_URL=URI.CORE_PTS_TESTRESULT.list;
const DELETE_URL=URI.CORE_PTS_TESTRESULT.delete;

class PTS_ListTestResult extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.url=LIST_URL+"?parentId="+this.parentId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      panes:[],
      currentId:'',
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '线程',
        dataIndex: 'maxThreadCount',
        width: '6%',
    },{
        title: '总请求',
        dataIndex: 'maxRequestCount',
        width: '8%',
      },{
          title: '成功/失败',
          dataIndex: 'successCount',
          width: '10%',
          render:(text,record)=>{
              return (<div><span>{text}</span>/<span style={{color:'red'}}>{record.errorCount}</span></div>)
          }
      },{
          title: '超时时间',
          dataIndex: 'conntionTimeOut',
          width: '8%',
      },{
          title: '吞吐率(QPS)',
          dataIndex: 'qps',
          width: '10%'
      },{
          title: '最大/最小',
          dataIndex: 'maxResponseTime',
          width: '12%',
          render:(text,record)=>{
              return (text+'ms/'+record.minResponseTime+"ms")
          }
      },{
          title: '平均耗时',
          dataIndex: 'avgResponseTime',
          width: '8%',
          render:(text,record)=>{
              return (text+'ms')
          }
      },{
          title: '测试者',
          dataIndex: 'creator',
          width: '10%'
      },{
        title: '开始时间',
        dataIndex: 'startTime',
        width:'13%'
      },{
        title: '总耗时(秒)',
        dataIndex: 'totalRunTime',
        width:'10%',
      }];

      const expandedRow=(record)=>{
        return (
          <Card  bordered={true} title='压力测试结果' bodyStyle={{padding:8}}>

          </Card>
          );
      }

    return (
      <div>
         <div style={divStyle}>
          <ButtonGroup>
          <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
          <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
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

export default PTS_ListTestResult;
