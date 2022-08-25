import { Button, Input, Select, Table } from 'antd';
import React from 'react';
import AppSelect from '../../../core/components/AppSelect';
import * as URI from '../../../core/constants/RESTURI';
import * as GridActions from '../../../core/utils/GridUtils';

const InputGroup = Input.Group;
const Option = Select.Option;
const listRestUrl = URI.LIST_CORE_SERVICES.list;

//服务选择用
class ListSelectResourceByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.searchFilters = {}
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      searchKeyWords: '',
      selectAppId: this.props.appId,
    }
  }

  componentDidMount() {
    this.loadData();
  }

  //记录选中行的key关键字，可以翻页选
  onSelectChange=(selectedRowKeys,selectedRows)=>{
    this.setState({selectedRowKeys:selectedRowKeys,selectedRows});
  }

  //返回选中的所有行
  getSelectedRows = () => {
    return this.state.selectedRows;
  }

  onPageChange = (pagination, filters, sorter) => {
    this.loadData(pagination, filters, sorter);
  }

  /* onRowSelect=(record, selected, selectedRows)=>{
    let oldSelectedRows=this.state.selectedRows;
    if(selected){
      //选中加入
      if (!this.hadSelectedRow(oldSelectedRows, record)) {
        oldSelectedRows.push(record);
      }
    } else {
      //取消选择
      oldSelectedRows = oldSelectedRows.filter((item) => {
        return item.id !== record.id;
      });
    }
    // console.log(oldSelectedRows);
    this.setState({ selectedRows: oldSelectedRows });
  }


  onRowSelectAll=(selected, selectedRows,changeRows) => { 
    this.setState({selectedRows:selectedRows});
  }

  //看是否已经选中，如果已经选中不再加入
  hadSelectedRow = (selectedRows, record) => {
    let r = false;
    selectedRows.forEach((item) => {
      if (item.id === record.id) {
        r = true;
      }
    });
    return r;
  } */

  //通过ajax远程载入数据
  search=()=>{
    const pagination = {
      ...this.state.pagination,
      pageSize:15,
      current:1  //页数初始化
    }
    this.setState({selectedRowKeys:[],selectedRows:[],pagination});//搜索时先清空已经选择的
    if(this.props.onSelect!==undefined){
      this.props.onSelect([]); //搜索时清空
    }
    let filters={appId:[this.state.selectAppId]};
    let sorter={};
    this.searchFilters=this.state.searchKeyWords ? {"mapUrl":this.state.searchKeyWords,"configName":this.state.searchKeyWords} : {};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    // GridActions.loadData(this,listRestUrl,this.state.pagination,filters,sorter,searchFilters);
    GridActions.loadData(this,listRestUrl,pagination,filters,sorter,this.searchFilters,(data)=>{
       this.state.pagination.total=data.total; //总数
       this.setState({rowsData:data.rows});
    });
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    filters.appId=[this.state.selectAppId];//增加默认过虑条件，只显示选中应用的服务
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    GridActions.loadData(this,listRestUrl,pagination,filters,sorter,this.searchFilters,(data)=>{
       this.state.pagination.total=data.total; //总数
       this.setState({rowsData:data.rows,pagination:pagination});
    });
  }

  appSelectChange=(appId)=>{
    const pagination = {
      ...this.state.pagination,
      pageSize:15,
      current:1     //页数初始化
    }
    this.setState({
      selectAppId:appId,
      pagination
    })
    // this.state.selectAppId=appId;
    let filters={appId:[appId]};
    let sorter={};
    this.searchFilters={}
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    GridActions.loadData(this,listRestUrl,pagination,filters,sorter,this.searchFilters);
  }

  onSearchChange = (e) => {
    this.state.searchKeyWords = e.target.value;
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange:this.onSelectChange,/* onSelect:this.onRowSelect */};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const columns = [{
      title: 'Method',
      dataIndex: 'methodType',
      width: '10%',
    }, {
      title: '服务名',
      dataIndex: 'configName',
      width: '30%',
      sorter: true,
    }, {
      title: '服务URL',
      dataIndex: 'mapUrl',
      width: '50%',
      sorter: true,
    }, {
      title: '应用',
      dataIndex: 'appId',
      width: '10%',
      sorter: true,
    }];

    return (
      <div>
        <div style={{ marginTop: '0px', marginBottom: '8px', }}>
          <InputGroup compact style={{ fontSize: '14px' }} >
            <AppSelect value={this.state.selectAppId} onChange={this.appSelectChange} />
            <Input placeholder="请输入要搜索的资源" style={{ width: 300 }} onChange={this.onSearchChange} />
            <Button shape="circle" icon="search" onClick={this.search} />
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
