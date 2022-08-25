import reqwest from 'reqwest';
import React, { PropTypes } from 'react';
import {hashHistory} from 'react-router';
import { Table,Menu,Icon,message,Tag,Dropdown,Popconfirm,Input,Button} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_BEANS.listSpringBeans;

class ListSpringBean extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:20,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      searchWords:'',
    }
  }

  componentDidMount(){
      this.loadData();
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
    let url=LIST_URL+"?serarchBeanId="+this.state.searchWords;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }

  searchWordsChange=(e)=>{
    this.state.searchWords=e.target.value;
  }

  //通过ajax远程载入数据
  search=()=>{
    this.state.pagination.current=1;
    this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '',
      dataIndex: '',
      width: '5%',
      render:(text,record)=>{return <Icon type="file" />;}
    },{
      title: 'BeanId',
      dataIndex: 'beanId',
      width: '40%'
    },{
    title: 'ClassPath',
    dataIndex: 'classPath',
    width:'45%',
    },{
      title: '单例',
      dataIndex: 'isSingleton',
      width:'10%',
      render:(text,record)=>{
        let singTags;
        if(record.isSingleton===true){
          singTags=<Tag color="cyan" >单例</Tag>;
        }else if(record.isSingleton===false){
          singTags=<Tag color="red" >多例</Tag>;
        }
        return singTags;
      }
    }
   ];

    return (
      <div>
        <div style={{marginBottom:'5px'}}>
        搜索BeanId:{' '}
        <Search
              placeholder="请输入搜索关键字"
              style={{ width: 360 }}
              onChange={this.searchWordsChange}
              onSearch={value => this.search(value)}
        />
        {' '}
        <Button type="primary" onClick={this.search}  >
            搜索
        </Button>
        </div>
        <Table bordered
          rowKey={record => record.beanId}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
        />
    </div>
    );
  }
}

export default ListSpringBean;
