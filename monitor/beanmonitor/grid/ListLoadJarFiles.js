import reqwest from 'reqwest';
import React, { PropTypes } from 'react';
import {hashHistory} from 'react-router';
import { Table,Menu,Icon,message,Tag,Dropdown,Popconfirm,Input,Button,Modal} from 'antd';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import UploadFile from '../form/UploadFile';

const Search = Input.Search;
const LIST_URL=URI.LIST_CORE_BEANS.listLoadJarFiles;

class ListLoadJarFiles extends React.Component {
  constructor(props) {
    super(props);
    this.appId='core',
    this.state={
      pagination:{pageSize:20,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      visible:false,
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
    let url=LIST_URL+"?searchKeyWord="+this.state.searchWords;
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

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false});
  }

  showModal=(reLoadFlag)=>{
      this.setState({visible: true});
  }

  handleCancel=(e)=>{
      this.setState({visible: false});
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
      render:(text,record)=>{return <Icon type="folder-add" />;}
    },{
    title: 'Jar包所在路径',
    dataIndex: 'path',
    width:'95%',
    }
   ];

    return (
      <div>
        <Modal key={Math.random()} title="上传JAR文件" maskClosable={false}
            visible={this.state.visible}
            width='600px'
            footer=''
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <UploadFile  appId={this.appId}  close={this.closeModal} loadData={this.loadData} />
        </Modal>
        <div style={{marginBottom:'5px'}}>
        搜索Jar包:{' '}
        <Search
              placeholder="请输入搜索关键字"
              style={{ width: 360 }}
              onChange={this.searchWordsChange}
              onSearch={value => this.search(value)}
        />
        {' '}
        <Button type="primary" onClick={this.showModal}  >
            上传Jar包
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

export default ListLoadJarFiles;
