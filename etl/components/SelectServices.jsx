import React from 'react';
import { Tabs,Table,Icon,Button,Select,Input,Tag} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxSelect from '../../core/components/AjaxSelect';

const InputGroup = Input.Group;
const Option = Select.Option;
const listRestUrl=URI.ETL.PROCESSNODE.listApplicationApis;
const applicationUrl=URI.ETL.PROCESSNODE.listApplications;

//服务选择用
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
      selectAppId:this.props.appId||'etl',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  //记录选中行的key关键字，可以翻页选
  onSelectChange=(selectedRowKeys)=>{
    this.setState({selectedRowKeys:selectedRowKeys});
  }

  //返回选中的所有行
  getSelectedRows=()=>{
    return this.state.selectedRows;
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onRowSelect=(record, selected, selectedRows)=>{
    let oldSelectedRows=this.state.selectedRows;
    if(selected){
      //选中加入
      if(!this.hadSelectedRow(oldSelectedRows,record)){
        oldSelectedRows.push(record);
      }
    }else{
      //取消选择
      oldSelectedRows=oldSelectedRows.filter((item)=>{
        return item.id!==record.id;
      });
    }
    // console.log(oldSelectedRows);
    this.setState({selectedRows:oldSelectedRows});
  }

  //看是否已经选中，如果已经选中不再加入
  hadSelectedRow=(selectedRows,record)=>{
    let r=false;
    selectedRows.forEach((item)=>{
      if(item.id===record.id){
        r=true;
      }
    });
    return r;
  }

  //通过ajax远程载入数据
  search=()=>{
    this.setState({selectedRowKeys:[],selectedRows:[]});//搜索时先清空已经选择的
    if(this.props.onSelect!==undefined){
      this.props.onSelect([]); //搜索时清空
    }
    let url=listRestUrl+"?appId="+this.state.selectAppId;
    let sorter={};
    let filters={};
    let searchFilters={"mapUrl":this.state.searchKeyWords,"configName":this.state.searchKeyWords};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters,(data)=>{
       this.state.pagination.total=data.total; //总数
       this.setState({rowsData:data.rows});
    });
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=listRestUrl+"?appId="+this.state.selectAppId;
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
       this.state.pagination.total=data.total; //总数
       this.setState({rowsData:data.rows,pagination:pagination});
    });
  }

  appSelectChange=(appId)=>{
    this.state.selectAppId=appId;
    let url=listRestUrl+"?appId="+this.state.selectAppId;
    let filters={appId:[appId]};
    let sorter={};
    let searchFilters={};
    sorter={"order":'ascend',"field":'mapUrl'};//使用mapUrl升序排序
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  onSearchChange=(e)=>{
    this.state.searchKeyWords=e.target.value;
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange:this.onSelectChange,onSelect:this.onRowSelect};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const columns=[{
        title: 'Method',
        dataIndex: 'methodType',
        width: '10%',
        render:(text,record) => {
            let method=record.methodType;
            if(method==="POST"){
                return <Tag color="#87d068" style={{width:50}} >POST</Tag>;
            }else if(method==="GET"){
                return <Tag color="#108ee9" style={{width:50}} >GET</Tag>;
            }else if(method==="DELETE" ){
                return <Tag color="#f50" style={{width:50}} >DELETE</Tag>;
            }else if(method==="PUT"){
                return <Tag color="pink" style={{width:50}} >PUT</Tag>;
            }else if(method==="*"){
                return <Tag color="#f50" style={{width:50}} >全部</Tag>;
            }
          }
      },{
        title: '服务名',
        dataIndex: 'configName',
        width: '30%',
        sorter: true,
      },{
        title: '服务URL',
        dataIndex: 'mapUrl',
        width: '50%',
        sorter: true,
      },{
        title: '应用',
        dataIndex: 'appId',
        width:'10%',
        sorter: true,
      }];

    return (
      <div>
         <div style={{marginTop: '0px',marginBottom: '8px',}}>
          <InputGroup compact style={{fontSize:'14px'}} >
              <AjaxSelect url={applicationUrl} value={this.state.selectAppId} valueId='portalAppId' textId='portalAppName' onChange={this.appSelectChange}  />
              <Input placeholder="请输入要搜索的API的URL或名称" style={{ width: 300 }}  onChange={this.onSearchChange}  />
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
