import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_PLATFORMTEMLATE.list; //分页显示

//模板代码代码选择时使用

class ListTemplateCodeForSelect extends React.Component {
  constructor(props) {
    super(props);
    this.templateType=this.props.templateType;
    this.close=this.props.close;
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
    filters.templateType=[this.templateType];
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter);
  }

  //通过ajax远程载入数据
  search=(value)=>{
    let filters={templateType:[this.templateType]};
    let sorter={};
    let searchFilters={};
    searchFilters={"configName":value,"configId":value};
    sorter={"order":'ascend',"field":'configId'};
    GridActions.loadData(this,LIST_URL,this.state.pagination,filters,sorter,searchFilters);
  }

  onSelectOk=()=>{
    this.close(this.state.selectedRowKeys);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length === 1;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '模板id',
        dataIndex: 'configId',
        width: '30%',
        sorter:true,
      },{
        title: '模板说明',
        dataIndex: 'configName',
        width: '55%'
      },{
        title: '类型',
        dataIndex: 'templateType',
        width: '15%',
        render:(text,record)=>{if(text==='*'){return '其他模板';}else{return text;}}
      }];

    return (
      <div>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <Button  type="primary" onClick={this.onSelectOk} disabled={!hasSelected} icon="plus-circle-o"  >确定选择</Button>{' '}
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button> {' '}
                <Button onClick={this.close.bind(this,"")}  >取消</Button>
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
              size='small'
              bordered={false}
              rowKey={record => record.id}
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

export default ListTemplateCodeForSelect;
