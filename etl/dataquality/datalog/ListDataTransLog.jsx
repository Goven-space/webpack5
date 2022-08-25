import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//数据传输日志

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.DATAQUALITY_DATALOG.listDataTransLog;
const DELETE_URL=URI.ETL.DATAQUALITY_DATALOG.deleteDataTransLog;

class ListDataTransLog extends React.Component {
  constructor(props) {
    super(props);
    this.logType=this.props.logType||'1';
    this.nodeId='';
    this.processId=this.props.processId;
    this.transactionId=this.props.transactionId||'';
    this.url=LIST_URL+"?processId="+this.processId+"&transactionId="+this.transactionId+"&nodeId="+this.nodeId+"&logType="+this.logType;
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
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  deleteData=(argIds)=>{
    let url=DELETE_URL+"?processId="+this.processId;
    GridActions.deleteData(this,url,argIds);
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

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={"order":'ascend',"field":'P_TAG_TIME'};
    let searchFilters={"P_TAG_ACTIONID":value};
    GridActions.loadData(this,this.url,this.state.pagination,filters,sorter,searchFilters);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '操作',
        dataIndex: 'P_TAG_ACTIONID',
        width: '10%',
        sorter:true,
        render:(text,record)=>{
          return <Tag color='#87d068'>{text}</Tag>;
        }
      },{
          title: '记录id',
          dataIndex: 'id',
          width: '20%',
      },{
          title: '节点Id',
          dataIndex: 'P_TAG_NODEID',
          width: '10%',
      },{
          title: '节点名称',
          dataIndex: 'P_TAG_NODENAME',
          width: '15%',
      },{
          title: '数据源',
          dataIndex: 'P_TAG_DATASOURCEID',
          width: '15%',
      },{
          title: '传输时间',
          dataIndex: 'P_TAG_TIME',
          width: '15%',
      },{
          title: '状态',
          dataIndex: 'P_TAG_STATUS',
          width: '10%',
          render: (text,record) => {
            if(text===1){
              return <Tag>失败</Tag>;
            }else{
              return <Tag>成功</Tag>;
            }
          }
      }];

      const expandedRow=(record)=>{
        let jsonStr=JSON.stringify(record);
        jsonStr=AjaxUtils.formatJson(jsonStr);
        return <Input.TextArea value={jsonStr} autosize={{ minRows: 2, maxRows: 16 }} />;
      }

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.showConfirm}  icon="delete" disabled={!hasSelected} >删除</Button>
                  <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                 <span style={{float:'right'}} >
                   搜索:<Search
                    placeholder="传输类型"
                    style={{ width: 260 }}
                    onSearch={value => this.search(value)}
                  />
                   </span>
                </Col>
              </Row>
              <Table
                bordered={false}
                rowKey={record => record.id}
                dataSource={rowsData}
                columns={columns}
                rowSelection={rowSelection}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
                expandedRowRender={expandedRow}
              />
      </div>
    );
  }
}

export default ListDataTransLog;
