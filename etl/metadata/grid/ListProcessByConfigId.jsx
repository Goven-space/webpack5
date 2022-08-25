import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ProcessDesigner from '../../process/ProcessDesigner';

//元数据关联的流程列表

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.METADATAMGR.processList;

class ListProcessByConfigId extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.configId;
    this.url=LIST_URL+"?configId="+this.configId;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      collapsed:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.setState({pagination});
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[
      {
        title: '流程名称',
        dataIndex: 'processName',
        width: '25%',
      },
      {
        title: '所属应用',
        dataIndex: 'applicationId',
        width: '15%'
      },
      {
        title: '节点名称',
        dataIndex: 'pNodeName',
        width: '25%'
      },{
        title: '节点Id',
        dataIndex: 'pNodeId',
        width: '10%',
      },{
        title: '创建者',
        dataIndex: 'creator',
        width: '10%',
      },{
        title: '最后更新',
        dataIndex: 'editTime',
        width: '20%',
      }];

      const expandedRow=(record)=>{
        return <ProcessDesigner processId={record.processId} appId={record.appId}   applicationId={record.applicationId}  />
      }
      
    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </Col>
                <Col span={12}>
                </Col>
              </Row>
              <Table
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

export default ListProcessByConfigId;
