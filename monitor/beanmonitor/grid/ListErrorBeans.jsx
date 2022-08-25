import React, { PropTypes } from 'react';
import { Table, Icon,Tag,Select,Input,Button,Modal} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI  from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const Search = Input.Search;
const Option = Select.Option;
const LIST_URL=URI.LIST_CORE_BEANS.ListErrorBeans;
const DELETE_URL=URI.LIST_CORE_BEANS.delete;
const confirm = Modal.confirm;

class ListErrorBeans extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      searchBeanType:'',
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
    let searchFilters={};
    GridActions.loadData(this,LIST_URL,pagination,filters,sorter,searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
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

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: 'BeanId',
      dataIndex: 'beanId',
      width: '25%',
      sorter: true
    },{
      title: '名称',
      dataIndex: 'beanName',
      width: '30%'
    },{
      title: '所属应用',
      dataIndex: 'appId',
      width: '10%'
    },{
      title: '属性',
      dataIndex: 'singleton',
      width:'25%',
      render:(text,record)=>{
        let singTags;
        if(record.singleton===true){
          singTags=<Tag color="cyan" >单例</Tag>;
        }else if(record.singleton===false){
          singTags=<Tag color="red" >多例</Tag>;
        }
        let typeTags=<Tag color="cyan" >{record.beanType}</Tag>;
        let hotType;
        if(record.useClassLoader){
          hotType=<Tag color="green" >Hot</Tag>;
        }
        return (<div>{typeTags}{singTags}{hotType}</div>);
      }
    },{
      title: '实例化失败',
      dataIndex: 'instanceError',
      key: 'x',
      width:'10%',
      render: (text,record) => {return <Tag color='red'>失败</Tag>}
    },];

    const expandedRow=function(record){
      return (<div>
      <p>类路径:{record.classPath}</p>
      <p>热加载:{record.useClassLoader?'是':'否'}</p>
      <p>自动装配:{record.autowired?'是':'否'}</p>
      <p>延迟加载:{record.lazyInit?'是':'否'}</p>
      <p>最后修改:{record.editor} {' '} 时间:{record.editTime}</p>
      <p>备注:{record.remark}</p>
      </div>);
    }

    return (
      <div>
        <div style={{marginBottom:5}} >
            <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除选中Bean配置</Button>{' '}
            <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
        </div>
        <Table
          bordered={true}
          rowKey={record => record.id}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          rowSelection={rowSelection}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
    </div>
    );
  }
}
export default ListErrorBeans;
