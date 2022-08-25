import React from 'react';
import { Tabs,Table,Icon,Button,Select,Input } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import AppSelect from '../../../core/components/AppSelect';

const InputGroup = Input.Group;
const Option = Select.Option;
const listRestUrl=URI.LIST_CORE_SERVICES.listByPermissionSelect;

//权限中选择资源用
class ListSelectResourceByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      searchKeyWords:'',
      selectAppId:this.props.appId,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
   this.props.onSelect(selectedRowKeys);
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  //通过ajax远程载入数据
  search=()=>{
    this.setState({selectedRowKeys:[],selectedRows:[]});//搜索时先清空已经选择的
    this.props.onSelect([]); //搜索时清空
    let filters={appId:[this.state.selectAppId]};
    let sorter={};
    let searchFilters={"mapUrl":this.state.searchKeyWords,"configName":this.state.searchKeyWords};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    // GridActions.loadData(this,listRestUrl,this.state.pagination,filters,sorter,searchFilters);
    GridActions.loadData(this,listRestUrl,this.state.pagination,filters,sorter,searchFilters,(data)=>{
       this.state.pagination.total=data.total; //总数
       this.setState({rowsData:data.rows});
    });
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    filters.appId=[this.state.selectAppId];//增加默认过虑条件，只显示选中应用的服务
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    GridActions.loadData(this,listRestUrl,pagination,filters,sorter,{},(data)=>{
       this.state.pagination.total=data.total; //总数
       this.setState({rowsData:data.rows,pagination:pagination});
    });
  }

  appSelectChange=(appId)=>{
    this.state.selectAppId=appId;
    let filters={appId:[appId]};
    let sorter={};
    let searchFilters={};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    GridActions.loadData(this,listRestUrl,this.state.pagination,filters,sorter,searchFilters);
  }

  onSearchChange=(e)=>{
    this.state.searchKeyWords=e.target.value;
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const columns=[{
        title: '服务名',
        dataIndex: 'resourceName',
        width: '30%',
      },{
        title: '服务URL',
        dataIndex: 'resourceDesc',
        width: '55%',
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'15%',
      }];

    return (
      <div>
         <div style={{marginTop: '0px',marginBottom: '8px',}}>
          <InputGroup compact style={{fontSize:'14px'}} >
              <AppSelect value={this.state.selectAppId}  onChange={this.appSelectChange}  />
              <Input placeholder="请输入要搜索的资源" style={{ width: 300 }}  onChange={this.onSearchChange}  />
              <Button shape="circle" icon="search" onClick={this.search}/>
          </InputGroup>
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
          size='small'
        />
      </div>
    );
  }
}

export default ListSelectResourceByAppId;
