import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Radio} from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import ReactJson from 'react-json-view'

const RadioGroup = Radio.Group;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LISTDATAS_URL=URI.ESB.DBTABLENODE.previewData;

class JdbcWriteNodePreviewData extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.state={
      pagination:{pageSize:10,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      rowKey:this.keyId,
      loading: true,
      currentId:'',
      searchKeyWords:'',
      columns:[],
      newIdNum:1000,
      visible:false,
      topNum:100,
    }
  }

  componentDidMount(){
      this.loadSqlData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadSqlData(pagination,filters,sorter);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadSqlData();
  }

  //通过ajax远程载入模型的所有列
  loadSqlData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let formData=this.form.getFieldsValue();
    formData.pageSize=pagination.pageSize;
    formData.pageNo=pagination.current;
    formData.topNum=this.state.topNum;
    this.setState({loading:true});
    AjaxUtils.post(LISTDATAS_URL,formData,(data)=>{
      if(data.state===false){
          this.setState({loading:false});
          AjaxUtils.showError(data.msg);
      }else{
          let columnsData=data.columns.map((item,index)=>{
              let title=item.colName;
              if(title!==item.colId){title=item.colName+"("+item.colId+")";}
              let dateIndexId=item.colId;
              if(item.aliasId!=='' && item.aliasId!==undefined && item.aliasId!==null){
                dateIndexId=item.aliasId;
              }
              return {
                  title: title,
                  dataIndex: dateIndexId,
                  sorter: false,
                  render: (text, record, index) => {
                    let value="";
                    if(Object.prototype.toString.call(text) === "[object String]"){
                      value = text;
                    }else{
                      value=JSON.stringify(text);
                    }
                    if(value!==undefined && value.length>150){
                        return 'Long String';
                    }else{
                        return value;
                    }
                  },
                };
          });
          pagination.total = data.total;
          this.setState({columns:columnsData,rowsData:data.rowsData,selectedRows:[],selectedRowKeys:[],loading:false,pagination:pagination});
      }
    });
  }

  changeTopNum=(e)=>{
    this.setState({topNum:e.target.value});
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=function(record){
      return <Card><ReactJson src={record} /></Card>
    }

    return (
      <div>
        <div style={{paddingBottom:10}} >
            最大显示数量:<Input  style={{width:'100px'}} onChange={this.changeTopNum} value={this.state.topNum} />{' '}
            <Button  type='primary' onClick={this.refresh} icon="reload"    >刷新</Button>
        </div>
            <Table
              size="small"
              bordered={false}
              rowKey={this.state.rowKey}
              dataSource={rowsData}
              columns={this.state.columns}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              scroll={{ x: this.state.columns.length>10?2500:1000}}
              expandedRowRender={expandedRow}
            />
            注意:超过最大显示数量的页数将显示为空
      </div>
    );
  }
}

export default JdbcWriteNodePreviewData;
