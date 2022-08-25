import React from 'react';
import { Steps, Button, Spin, Form, Select, Input, Tabs, Table, Row, Col, Card, Menu, Icon, Tag, Dropdown, Popconfirm, Modal, Popover, Radio, Layout } from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import * as GridActions from '../utils/GridUtils';
import TreeNodeSelect from '../components/TreeNodeSelect';

const { Step } = Steps;
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const ImportUrl = URI.CORE_OPENAPI.ImportUrl;
const MenuUrl = URI.CORE_GATEWAY_ROUTER.leftMenus
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;

const steps = [{
  title: 'OpenAPI文档',
}, {
  title: 'API预览与导入',
}];
const { TextArea } = Input;

class ImportAPIFromOpenApi extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.importurl = host+"/rest/core/v2/openapi/import";
    this.analysisurl = host+"/rest/core/v2/openapi/analysis?appId="+this.appId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=服务分类";
    this.state = {
      searchFlag: 'backendUrl',
      InputValue: "",
      current: 0,
      mask: true,
      pagination: { pageSize: 15, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
      apiData: [],
      loading: false,
      tabActiveKey: 'home',
      panes: [],
      visible: false,
      serviceId: '',
      tableType: 'AllServiceList',
      beanId: '',
      collapsed: false,
      categoryList: [],
      categorySign: ''
    };
  }
  componentDidMount() {
    this.loadData();
    this.setState({ mask: false })
  }
  //载入菜单
  loadData = () => {
    let url = this.appServiceCategroyUrl;
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        this.setState({ categoryList: data });
      }
    });
  }
  deselect=()=>{
    this.setState({selectedRowKeys:[]})
  }
  refresh=()=>{
    const {apiData}=this.state;
    this.setState({
      rowsData:apiData
    });
  }
  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  handleGetInputValue = (event) => {
    this.setState({
      InputValue: event.target.value,
    })
  };
  formatRequestBodyJsonStr = () => {
    const { InputValue } = this.state;
    let value = AjaxUtils.formatJson(InputValue);
    this.setState({ InputValue: value.trim() });
  }
  analysisPost = () => {
    const { InputValue } = this.state;
    if(InputValue==""||InputValue==null){
      AjaxUtils.showError("您未填写OpenAPI文档，请先填写文档再进行下一步！！")
    }else{
    let header = { "Content-Type": "application/json;charset=UTF-8" };
    this.setState({ mask: true });
    AjaxUtils.ajax(this.analysisurl, InputValue, "post", "json", header, (data) => {
      this.setState({ mask: false });
      if (data.state == false) {
        AjaxUtils.showError(data.msg)
      } else {
        this.setState({ rowsData: data, apiData: data })
        this.next();
      }

    }, header);
  }
  };
  importPost=()=>{
    let selectedRowKeys = this.state.selectedRowKeys;
    if(this.state.categorySign==""){
      AjaxUtils.showError("您未选择分类，请选择您要导入的分类！！")
    }else
    if(selectedRowKeys==[]){
      AjaxUtils.showError("您未选择API，请选择您要导入的API！！")
    }else{
    let keysStr="";
    let importList=[];
    let key=""
    selectedRowKeys.map(item=>{
       key="/"+item+"/";
       keysStr=keysStr+key;
     });
    this.state.apiData.map(item=>{
        if(keysStr.indexOf(item.configId)>-1){
          item["categoryId"]=this.state.categorySign;
          importList.push(item)
        }
      })
    let header = { "Content-Type": "application/json;charset=UTF-8" };
    this.setState({ mask: true });
   let body= JSON.stringify(importList)
    AjaxUtils.ajax(this.importurl, body, "post", "json", header, (data) => {
      this.setState({ mask: false });
      if (data.state == false) {
        AjaxUtils.showError(data.msg)
      } else {
        AjaxUtils.showInfo("成功导入"+data+"个API");
        this.setState({selectedRowKeys:[]});
        const { InputValue } = this.state;
        let header = { "Content-Type": "application/json;charset=UTF-8" };
        this.setState({ mask: true });
        AjaxUtils.ajax(this.analysisurl, InputValue, "post", "json", header, (data) => {
          this.setState({ mask: false });
          if (data.state == false) {
            AjaxUtils.showError(data.msg)
          } else {
            this.setState({ rowsData: data, apiData: data })
          }

        }, header);
      }

    }, header);
  }
  }


  showConfirm = () => {
    var self = this;
    confirm({
      title: 'Are you sure delete the selected rows?',
      content: '注意:删除后不可恢复!',
      onOk() {
        return self.deleteData();
      },
      onCancel() { },
    });
  }
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
  }
  onPageChange = (pagination, filters, sorter) => {
    this.setState({ pagination })
  }

  render() {
    const { current } = this.state;
    const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange, getCheckboxProps: record => ({
      disabled: record.state === 'exist', // Column configuration not to be checked
     }), };
    const { rowsData, pagination, selectedRowKeys, loading } = this.state;

    const columns = [
      {
        title: 'configId',
        dataIndex: 'configId',
        width: '15%',
      }, {
        title: 'Method',
        dataIndex: 'methodType',
        width: '10%',
        render: (text, record) => {
          let method = record.methodType;
          if (method === "POST") {
            return <Tag color="#87d068" style={{ width: 50 }} >POST</Tag>;
          } else if (method === "GET") {
            return <Tag color="#108ee9" style={{ width: 50 }} >GET</Tag>;
          } else if (method === "DELETE") {
            return <Tag color="#f50" style={{ width: 50 }} >DELETE</Tag>;
          } else if (method === "PUT") {
            return <Tag color="pink" style={{ width: 50 }} >PUT</Tag>;
          } else if (method === "*") {
            return <Tag color="#f50" style={{ width: 50 }} >全部</Tag>;
          }
        },
      }, {
        title: '网关暴露URI',
        dataIndex: 'mapUrl',
        width: '20%',

      }, {
        title: '后端服务URI',
        dataIndex: 'backendUrl',
        width: '25%',

      }, {
        title: 'API名称',
        dataIndex: 'configName',
        width: '20%',

      }, {
        title: '状态',
        dataIndex: 'state',
        width: '10%',
        render: (text, record) => {
          let stateTags;
          if (record.state == 'exist') {
            stateTags = <Tag color="red" >已存在</Tag>;
          }
          else {
            stateTags = <Tag color="green" >未存在</Tag>;
          }
          return (<div style={{ textAlign: 'center' }}>{stateTags}</div>);
        }
      }
    ];

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
        </Modal>
        <div style={{ margin: '10px 50px 5px 50px' }} >
          <Steps current={current}  >
            {steps.map(item => <Step key={item.title} title={item.title} />)}
          </Steps>
        </div>
        <div style={{ display: current === 0 ? '' : 'none' }}  >
          OpenApi：
          <TextArea rows={8}
            value={this.state.InputValue}
            onChange={this.handleGetInputValue}
          />
        <br /><br />
        <center>
          <span>JSON数据:<a onClick={this.formatRequestBodyJsonStr} >格式化JSON</a></span>{' '}
          <Button type="primary" onClick={this.analysisPost}>下一步</Button>
        </center>
        </div>
        <div style={{ display: current === 1 ? '' : 'none' }}   >
          {/* <ListServicesByAppId />    */}
          <div>

            <Tabs
              onChange={this.onTabChange}
              onEdit={this.onTabEdit}
              type="editable-card"
              activeKey={this.state.tabActiveKey}
              animated={false}
              hideAdd={true}
            >
              <TabPane tab="API接口列表" key="home" style={{ padding: '0px' }}>
                <div style={{ minHeight: '500px', border: '1px #e9e9e9 solid', margin: '0px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '2px' }}>
                  <Row style={{ marginBottom: 5 }} gutter={0} >
                    <Col span={12}>
                      <ButtonGroup>
                        请选择分类:<TreeNodeSelect value={this.state.categorySign}  url={this.appServiceCategroyUrl} onChange={value => {this.setState({ categorySign: value })} } options={{placeholder:'请选择分类',style:{minWidth:'100px'},multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />
                        <Button type="primary" onClick={this.importPost}> 开始导入 </Button>
                      </ButtonGroup>
                    </Col>
                    <Col span={12}>
                      <span style={{ float: 'right' }} >
                        <Button type="ghost" onClick={this.refresh} icon="reload" loading={loading} >重置搜索</Button>
                          搜索:<Select defaultValue={this.state.searchFlag} onChange={value => this.setState({ searchFlag: value })}>
                          <Option value="backendUrl">后端服务URL</Option>
                          <Option value="mapUrl">网关暴露URL</Option>
                          <Option value="configName">API名称</Option>
                        </Select><Search
                          placeholder="input search text"
                          onSearch={value => {
                            let rowsData = [];
                            this.state.apiData.forEach((item, index, arr) => {
                              // console.log(item[this.state.searchFlag])
                              if (item[this.state.searchFlag].indexOf(value) > -1) {
                                rowsData.push(item);
                              }
                              this.setState({ rowsData })
                            })
                          }}
                          style={{ width: 200 }}
                        />
                      </span>
                    </Col>
                  </Row>
                  <Table
                    bordered={false}
                    rowKey={record => record.configId}
                    rowSelection={rowSelection}
                    // expandedRowRender={expandedRow}
                    dataSource={rowsData}
                    columns={columns}
                    loading={loading}
                    onChange={this.onPageChange}
                    pagination={pagination}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
          <br></br><br></br>
          <center><Button type='primary' onClick={() => this.prev()}>上一步  </Button></center>

        </div>

      </Spin>
    );

  }
}


export default ImportAPIFromOpenApi;
