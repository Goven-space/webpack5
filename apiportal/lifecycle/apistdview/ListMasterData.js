import React from 'react';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ListMasterDataFields from './ListMasterDataFields';
import ShowMasterDataJsonBody from '../../../standard/masterdata/form/ShowMasterDataJsonBody';
import ReactJson from 'react-json-view'

//主数据查看列表

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_MasterData.listView;

class ListMasterData extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      action:'',
      visible:false,
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


  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    let sorter={};
    let searchFilters={};
    searchFilters={"configName":value,"configId":value};
    sorter={"order":'ascend',"field":'createTime'};
    let url=this.url;
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  //导出服务
  exportData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=EXPORT+"?ids="+ids;
    window.location.href=url;
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '主数据名称',
        dataIndex: 'configName',
        width: '40%',
        sorter: true
      },{
        title: '唯一ID',
        dataIndex: 'id',
        width: '20%',
      },{
        title: '版本',
        dataIndex: 'version',
        width: '8%',
        ellipsis: true,
      },{
        title: '所属系统',
        dataIndex: 'systemName',
        width: '10%',
        ellipsis: true,
      },{
        title: '发布者',
        dataIndex: 'editor',
        width: '10%',
      },{
        title: '发布时间',
        dataIndex: 'editTime',
        width: '15%',
      }];

      const expandedRow=(record)=>{
        return (
          <Card size='small'>
            <Tabs
              size='large'
            >
              <TabPane tab="字段列表" key="fields" style={{padding:'0px'}}>
                <ListMasterDataFields id={record.id}  />
              </TabPane>
              <TabPane tab="查看JSON" key="json" style={{padding:'0px'}}>
                <ShowMasterDataJsonBody id={record.id} />
              </TabPane>
            </Tabs>
          </Card>
          );
      }

    return (
      <div>
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             搜索:<Search
              placeholder="主数据名称"
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
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
    </div>
    );
  }
}

export default ListMasterData;
