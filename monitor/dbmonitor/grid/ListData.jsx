import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ReactJson from 'react-json-view'

const ButtonGroup = Button.Group;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DBMGR_MONGODB.getAllDocByCollectionName;
const exportUrl=URI.CORE_DBMGR_MONGODB.export;
const FIND_URL=URI.CORE_DBMGR_MONGODB.searchData;

class ListData extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.runType=this.props.runType||"2"; //2表示全部包括成功和失败的
    this.dbName=this.props.dbName; //按指定流程显示
    this.collName=this.props.collName;
    this.url=LIST_URL+"?dbName="+this.dbName+"&collName="+this.collName; //流程id
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      panes:[],
      loading: true,
      visible:false,
      tabActiveKey: 'home',
      currentId:'',
      currentRecord:{},
      searchKeyWords:'',
      collapsed:false,
      action:''
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
     if (this.userId==='admin') {
        filters={};
      } else {
        filters.creator=[this.userId];
      }
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

   parse1(str) {
    return AjaxUtils.formatJson(JSON.stringify(JSON.parse(JSON.stringify(str)),null,2));
    }
  //Tab相关函数
  onTabChange=(tabActiveKey)=>{
      this.setState({ tabActiveKey });
  }
  //Tab的各种触发事件
  onTabEdit=(targetKey, action)=>{
    if(action==="remove"){
        this.tabRemove(targetKey);
    }
  }
  //点击X时关闭点击的Tab
  tabRemove=(targetKey)=>{
      let tabActiveKey = this.state.tabActiveKey;
      let lastIndex;
      this.state.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.state.panes.filter(pane => pane.key !== targetKey);
      if (lastIndex >= 0 && tabActiveKey === targetKey) {
        tabActiveKey = panes[lastIndex].key;
      }else{
        tabActiveKey="home";
      }
      this.setState({ panes, tabActiveKey });
  }
  //关闭当前活动的Tab并刷新Grid数据
  closeCurrentTab=(reLoadFlag)=>{
    this.tabRemove(this.state.tabActiveKey);
    if(reLoadFlag!==false){
      this.loadData();
    }
  }
  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let str = String( ids );
    let dbName=this.props.dbName;
    let collName=this.props.collName;
    GridActions.downloadBlob(this, exportUrl, { ids: str, dbName: dbName, collName: collName });
  }

  containsTab(arr, obj) {
      var i = arr.length;
      while (i--) {
          if (arr[i].key === obj.key) {
              return true;
          }
      }
      return false;
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let dbName=this.props.dbName;
    let collName=this.props.collName;
    this.setState({loading:true});
    AjaxUtils.post(FIND_URL,{dbName:dbName,collName:collName,filters:value},(data)=>{
      this.state.pagination.total=data.rows.length;
      this.setState({loading:false,rowsData:data.rows})
     });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const content = (
      <div>
    <p>单个条件等于:Filters.eq(&quot;userId&quot;,&quot;admin&quot;),模糊搜索标签:Filters.regex(&quot;tags&quot;,&quot;100001&quot;),</p>
    <p>多个条件:Filters.and(Filters.eq(&quot;userId&quot;,&quot;admin&quot;),Filters.eq(&quot;ip&quot;,&quot;127.0.0.1&quot;))</p>
      </div>
    );

    const columns=[
      {
        title: '_id',
        dataIndex: '_id',
        width:'35%',
      },{
        title: '创建时间',
        dataIndex: 'createTime',
        width: '20%',
        sorter:true,
      },{
          title: '创建者',
          dataIndex: 'creator',
          width: '15%',

      },{
          title: '最后修改时间',
          dataIndex: 'editTime',
          width: '20%',
      },{
      title: '修改者',
      dataIndex: 'editor',
      width:'10%'
    }];

    const expandedRow=(record)=>{
      // console.log(record)
      return (
        <Card bordered={true} >
          <ReactJson src={record} displayDataTypes={false} />
        </Card>
        );
    }

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>{' '}
                  <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出数据','注意：若不勾选数据则会导出本集合中的全部数据!',this.exportConfig)} icon="download"  >导出数据</Button>
                </Col>
                <Col span={12}>
                  <Popover content={content} title="查询条件filters提示">
                    <span style={{float:'right'}} >
                       搜索:<Search
                        placeholder='Filters.eq("字段ID","值")'
                        style={{ width: 330 }}
                        onSearch={value => this.search(value)}
                      />
                    </span>
                  </Popover>
                </Col>
              </Row>
              <Table
                bordered={false}
                rowKey={record => record._id}
                dataSource={rowsData}
                columns={columns}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
                expandedRowRender={expandedRow}
              />
          {/* </TabPane> */}
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>{pane.content}</TabPane>)}
        {/* </Tabs> */}
      </div>
    );
  }
}

export default ListData;
