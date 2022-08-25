import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditText from '../../../core/components/EditTextArea';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_SERVICECONTROLPLUGS.listByPage; //分页显示

class ListServiceControlStrategySelect extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      action:'edit',
      curEditIndex:-1,
    }
  }

  componentDidMount(){
      this.loadData();
  }


  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    filters.controlAppIds=['binding']; //过虑只显示本应用的服务
    filters.state=['1']; //只显示启用的
    GridActions.loadData(this,this.url,pagination,filters,sorter);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

 //记录选中行的key关键字，可以翻页选
  onSelectChange=(selectedRowKeys,selectedRows)=>{
    this.setState({selectedRowKeys:selectedRowKeys,selectedRows});
  }

  //返回选中的所有行
  getSelectedRows=()=>{
    return this.state.selectedRows;
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  /* onRowSelect=(record, selected, selectedRows)=>{
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

  onRowSelectAll=(selected, selectedRows, changeRows)=>{
    this.setState({selectedRows:selectedRows})
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
  } */

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }


  //通过ajax远程载入数据
  search=(value)=>{
    let filters={};
    filters.controlAppIds=['binding']; //过虑只显示本应用的服务
    filters.state=['1']; //只显示启用的
    let sorter={};
    let searchFilters={};
    searchFilters={"configName":value,"configId":value};
    sorter={"order":'ascend',"field":'configId'};
    let url=this.url;
    GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters);
  }

  handleChange(key, index, value) {
    const { rowsData } = this.state;
    rowsData[index][key] = value;
    rowsData[index].EditFlag=true; //标记为已经被修改过
    this.setState({ rowsData });
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange:this.onSelectChange,/* onSelect:this.onRowSelect */};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '策略名称',
        dataIndex: 'configName',
        width: '25%'
      },{
        title: '控制点',
        dataIndex: 'controlPoint',
        width: '15%',
        render:(text,record)=>{
          if(text==="BeforeServiceExecution"){
            return "服务执行前";
          }else if(text==='RequestInit'){
            return "请求初始化时";
          }else if(text==='ServiceRunException'){
            return "服务执行异常时";
          }else if(text==='AfterServiceExecution'){
            return "服务执行后";
          }else if(text==='ServiceRunFinally'){
            return "Finally始终";
          }else if(text==='BeforeConnectionUrl'){
            return "服务转发前";
          }else if(text==='UserContextInit'){
            return "用户初始化时";
          }else{
            return text;
          }
        }
      },{
        title: '备注',
        dataIndex: 'remark',
        width: '40%',
      },{
        title: '策略参数',
        dataIndex: 'paramsValue',
        width: '20%',
        render: (text, record, index) => {
          let value=text;
          if(text===''||text===undefined){value=record.defaultParamsValue;}
          return this.renderEditText(index,'paramsValue',value);
        }
      }];

    return (
      <div>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 搜索:<Search
                  style={{ width: 260 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              onRowClick={this.onRowClick}
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
      </div>
    );
  }
}

export default ListServiceControlStrategySelect;
