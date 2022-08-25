import React from 'react';
import {Table,Row, Col,Icon,Tag,Button,Input,Modal,Tabs,Card} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ShowJvmInfo from './ShowJvmInfo';

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const LIST_URL=URI.CORE_INSSERVER.listByPage;

class ListActiveServer extends React.Component {
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
    filters.state=['1']; //过虑只显示本应用的服务
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,this.searchFilters);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={state:['1']};
    let sorter={};
    let searchFilters={};
    searchFilters={"serverId":value,"serverName":value,"runAppIds":value};
    sorter={"order":'ascend',"field":'serverId'};//使用serverId升序排序
    let url=this.url;
    this.searchFilters=searchFilters;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '服务实例名',
      dataIndex: 'serviceName',
      width: '15%'
    },{
        title: '集群标识',
        dataIndex: 'serverClusterFlag',
        width: '8%'
      },{
        title: 'IP',
        dataIndex: 'serverIP',
        width:'15%',
        render:(text,record)=>{return text+":"+record.serverPort;}
      },{
        title: '线程数',
        dataIndex: 'activeThreadCount',
        width:'8%',
        render:(text,record)=>{if(text===''){return '-'}else{return text;} }
      },{
        title: 'API数',
        dataIndex: 'serviceNum',
        width:'8%',
      },{
        title: '平均响应',
        dataIndex: 'avgResponseTime',
        width:'10%',
        render:(text,record)=>{return text+'秒';}
      },{
        title: '今日异常',
        dataIndex: 'exceptionNum',
        render:(text,record)=>{
          if(text==='0'){
            return text+'次';
          }else{
            return <Tag color='red'>{text}次</Tag>
          }
        },
        width:'8%'
      },{
        title: '最后更新',
        dataIndex: 'lastUpdateTime',
        width:'15%'
      },{
        title: '状态',
        dataIndex: 'state',
        width:'5%',
        render:(text,record)=>{if(record.manualMode=='0'){return <Tag color="green" >活跃</Tag>}else{return <Tag color="red" >手动</Tag>} }
      }];

    const expandedRow=function(record){
      return (
        <Card >
            <ShowJvmInfo serviceBaseUrl={record.serviceBaseUrl} />
      </Card>
      );
    }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
              <Button  type="ghost" onClick={this.refresh} icon="reload"   >刷新</Button>{' '}
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:{' '}<Search
              placeholder="搜索ServerId"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>

        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
      </div>
    );
  }
}

export default ListActiveServer;
