import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//内存流数据监控top 100

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.listTopEngineMemroyDataDocs;

class ListEngineMemroyIndocs_topdata extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL+"?key="+this.props.id;
    this.state={
      pagination:{pageSize:50,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
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
    GridActions.loadData(this,this.url,pagination,filters,sorter,{},(data)=>{
      this.state.pagination.total=data.total; //总数
      this.setState({rowsData:data.rows,columns:data.columns,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
    });
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=this.state.columns;

      const expandedRow=(record)=>{
        let jsonStr=JSON.stringify(record);
        jsonStr=AjaxUtils.formatJson(jsonStr);
        return <Input.TextArea value={jsonStr} autosize={{ minRows: 2, maxRows: 16 }} />;
      }

    return (
      <div>
              <Row style={{marginBottom:5}} gutter={0} >
                <Col span={12} >
                <ButtonGroup>
                  <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
                </Col>
                <Col span={12}>
                </Col>
              </Row>
              <Table
                bordered={false}
                rowKey={record => record.index_id}
                dataSource={rowsData}
                columns={columns}
                rowSelection={rowSelection}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
                expandedRowRender={expandedRow}
              />
      </div>
    );
  }
}

export default ListEngineMemroyIndocs_topdata;
