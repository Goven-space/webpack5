import React from 'react';
import ReactDOM from 'react-dom';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Radio} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ReactJson from 'react-json-view'


const RadioGroup = Radio.Group;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LISTDATAS_URL=URI.CORE_DATAMODELS.ListAllModelDatas;
const LISTCOLUMNS_URL=URI.CORE_DATAMODELS.ListModelDatasColumns;

class ListAllData extends React.Component {
  constructor(props) {
    super(props);
    this.modelId=this.props.modelId;
    this.parentId=this.props.id;
    this.appId=this.props.appId;
    this.keyId=this.props.keyId;
		this.defaultPagination = {pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`}
    this.state={
      pagination:{...this.defaultPagination},
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
    }
  }

  componentDidMount(){
    this.loadColumnsData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadDataModelDatas(pagination,filters,sorter);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadColumnsData();
  }

  //通过ajax远程载入模型的所有列
  loadColumnsData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LISTCOLUMNS_URL+"?parentId="+this.parentId;
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
      let columnsData=data.map((item,index)=>{
          let title=item.colName;
          if(title!==item.colId){title=item.colName+"("+item.colId+")";}
          let dateIndexId=item.colId;
          if(item.aliasId!=='' && item.aliasId!==undefined && item.aliasId!==null){
            dateIndexId=item.aliasId;
          }
          return {
              title: title,
              dataIndex: dateIndexId,
              sorter: true,
							key: dateIndexId,
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
              }, /**/
            };
      });
      this.setState({columns:columnsData},() => {
				this.loadDataModelDatas(); //载入数据
			});
     
      // console.log(columnsData);
    });
  }

  loadDataModelDatas=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LISTDATAS_URL+"?modelId="+this.modelId;
    if(this.state.searchKeyWords!==''){
      url+="&condition="+encodeURIComponent(this.state.searchKeyWords); //增加搜索条件
    }
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
      pagination.total = data.total; //总数
			data.rows.forEach(item =>{
				item.key = AjaxUtils.randomString()
			})
      this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
    });
  }

  //对数据进行搜索
  search=(value)=>{
    let pagination=this.defaultPagination;
    let url=LISTDATAS_URL+"?modelId="+this.modelId+"&condition="+encodeURIComponent(value);
    GridActions.loadData(this,url,pagination,{},{},{},(data)=>{
      pagination.total = data.total; //总数
			const newData = JSON.parse(JSON.stringify(data.rows))
      newData.forEach((item,index)=>{
        item.key=AjaxUtils.randomString();
      })
			/* data.rows.forEach(item =>{
				item.id = AjaxUtils.guid()
			}) */
      this.setState({rowsData:newData,pagination:pagination,selectedRows:[],selectedRowKeys:[],searchKeyWords:value});
    });
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,columns}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow= (record) => {
		return <Card><ReactJson src={record} /></Card>
	}
    return (
      <div style={{overflow:'auto'}} >
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={16} >
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading}  >刷新</Button>
              </Col>
              <Col span={8}>
               <span style={{float:'right'}} >
                 按SQL条件搜索:<Search
                  placeholder="userid='admin' or userid='test'"
                  style={{ width: 280 }}
                  onSearch={value => this.search(value)}
                />
                 </span>
              </Col>
            </Row>
            <Table
              size="small"
              bordered={false}
              rowKey={row => row.key} /**/
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
              expandedRowRender={expandedRow}
							key="table"
            />
      </div>
    );
  }
}

export default ListAllData;
