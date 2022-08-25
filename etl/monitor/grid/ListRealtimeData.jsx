import React from 'react';
import {Table,Icon,Menu,Dropdown,Card,Popconfirm,Button,Modal,Input,Row,Col,Tag,Divider,Badge,Tabs,Tooltip} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ReactJson from 'react-json-view'

//查看流程的实时数据

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.ETL.MONITOR.realtimedataUrl;
const TabPane = Tabs.TabPane;

class ListRealtimeData extends React.Component {
  constructor(props) {
    super(props);
    this.logType=this.props.logType||'1';
    this.nodeId='';
    this.transactionId=this.props.transactionId||'';
    this.url=LIST_URL+"?transactionId="+this.transactionId;
    this.state={
      pagination:{pageSize:50,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      panes:[],
      loading: true,
      visible:false,
      tabActiveKey: 'home',
      currentId:'',
      currentRecord:{},
      searchKeyWords:'',
      collapsed:false,
      data:{},
      action:'',
      columns:[],
      total:0,
    }
  }

  componentDidMount(){
      this.loadData();
  }


  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    AjaxUtils.get(this.url,(data)=>{
      if(data.state==false){
        AjaxUtils.showError(data.msg);
        this.setState({loading:false});
      }else{
        let columnsData=data.columns.map((item,index)=>{
            let title=item;
            let dateIndexId=item;
            return {
                title: title,
                dataIndex: dateIndexId,
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
        this.state.pagination.total=data.total; //总数
        this.setState({data:data,rowsData:data.rows,pagination:pagination,loading:false,columns:columnsData,total:data.total});
      }
    });
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,currentRecord}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const expandedRow=(record)=>{
        let jsonStr=JSON.stringify(record);
        jsonStr=AjaxUtils.formatJson(jsonStr);
        return <Input.TextArea value={jsonStr} autosize={{ minRows: 2, maxRows: 16 }} />;
    }

    return (
      <div>
              <Tabs size="large">
                <TabPane  tab="当前数据流" key="data"  >
                  <Row style={{marginBottom:5}} gutter={0} >
                    <Col span={12} >
                    <ButtonGroup>
                      <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                    </ButtonGroup>
                    </Col>
                  </Row>
                  <Table
                    size="small"
                    bordered={false}
                    rowKey={record => record.id}
                    dataSource={rowsData}
                    columns={this.state.columns}
                    loading={loading}
                    expandedRowRender={expandedRow}
                    footer={() => '当前总数据量:'+this.state.total+",本页仅显示top 50"}
                  />
              </TabPane>
              <TabPane  tab="局部变量" key="indoc"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.indoc))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
              <TabPane  tab="全局变量" key="variant"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.variantDoc))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
              <TabPane  tab="HTTP请求参数" key="http"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.requestDoc))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
            </Tabs>
      </div>
    );
  }
}

export default ListRealtimeData;
