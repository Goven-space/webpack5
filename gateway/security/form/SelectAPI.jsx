import React from "react";
import {
  Typography,
  Table,
  Icon,
  Spin,
  Select,
  Input,
  Tag,
  Tree,
  Row,
  Col,
  Menu,
} from "antd";
import * as URI from "../../../core/constants/RESTURI";
import * as AjaxUtils from "../../../core/utils/AjaxUtils";
import * as GridActions from "../../../core/utils/GridUtils";
import AjaxSelect from "../../../core/components/AjaxSelect";

const TypographyTitle = Typography.Title;

const InputGroup = Input.Group;
const Option = Select.Option;
const listRestUrl = URI.CORE_GATEWAY_APICONFIG.selectApi;
const applicationUrl = URI.CORE_GATEWAY_APICONFIG.selectAPP;

//服务选择用
class SelectAPI extends React.Component {
  constructor(props) {
    super(props);
    this.defaultPagination = {
      pageSize: 15,
      current: 1,
      showSizeChanger: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    };
    this.state = {
      pagination: { ...this.defaultPagination },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
      loading: true,
      searchKeyWords: "",
      /* selectAppId: this.props.appId || "gateway", */
      onSelect: [],
      selectedKeys: [""],
      openKeys: [],
      treeData: [],
      menuData: [],
      mask: false,
    };
  }

  componentDidMount() {
    this.loadData();
    /*this.getMenuData()*/
    this.getTreeData();
  }

  getMenuData = () => {
    this.setState({ mask: true });
    AjaxUtils.get(applicationUrl, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (data.length) {
          const newData = data.map((item) => (
            <Menu.Item key={item.portalAppId}>
              <Icon type="appstore" />
              {item.portalAppName}
            </Menu.Item>
          ));
          this.setState({
            menuData: newData,
          });
        }
      }
    });
  };

  //载入菜单
  getTreeData = () => {
    this.setState({ mask: true });
    AjaxUtils.get(applicationUrl, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        const newTreeData = [];
        const openKeys = []; /* 获取默认需要全部展开的父项 */
        const selectedKeys = []; /* 获取默认选中的第一项 */
        if (data.length) {
          data.forEach((item) => {
            /* if (item.appId !== 'allapis') {} */
            const obj = {
              key: item.portalAppId,
              title: item.portalAppName,
              children: [],
              selectable: true,
              parentNodeId: "root",
            };
            if (item.children && item.children.length) {
              openKeys.push(item.key);
              obj.children = this.dealTreeData(
                item.children,
                openKeys,
                selectedKeys
              );
              obj.selectable = false;
            } else {
              if (!selectedKeys.length) {
                selectedKeys.push(item.key);
              }
            }
            newTreeData.push(obj);
          });
        }
        this.setState({ treeData: newTreeData /* openKeys,selectedKeys */ });
      }
    });
  };

  dealTreeData = (arr = [], openKeyArr = [], selectedKeyArr = []) => {
    return arr.map((item) => {
      const obj = {
        key: item.portalAppId,
        title: item.portalAppName,
        children: [],
        selectable: true,
      };
      if (item.children && item.children.length) {
        openKeyArr.push(item.key);
        obj.children = this.dealTreeData(
          item.children,
          openKeyArr,
          selectedKeyArr
        );
        obj.selectable = false;
      } else {
        if (!selectedKeyArr.length) {
          selectedKeyArr.push(item.key);
        }
      }
      return obj;
    });
  };

  //通过ajax远程载入数据
  loadData = (
    pagination = this.state.pagination,
    filters = {},
    sorter = {}
  ) => {
    let url = listRestUrl + "?appId=" + this.state.selectedKeys[0];
    sorter = { order: "ascend", field: "mapUrl" }; //使用mapUrl升序排序
    let searchFilters = this.state.searchKeyWords
      ? {
          mapUrl: this.state.searchKeyWords,
          configName: this.state.searchKeyWords,
        }
      : {};
    GridActions.loadData(
      this,
      url,
      pagination,
      filters,
      sorter,
      searchFilters,
      (data) => {
        this.state.pagination.total = data.total; //总数
        this.setState({ rowsData: data.rows, pagination: pagination });
      }
    );
  };

  //记录选中行的key关键字，可以翻页选
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows });
  };

  //返回选中的所有行
  getSelectedRows = () => {
    return this.state.selectedRows;
  };

  onPageChange = (pagination, filters, sorter) => {
    this.loadData(pagination, { appId: this.state.selectedKeys }, sorter);
  };

  onRowSelect = (record, selected, selectedRows) => {
    let oldSelectedRows = this.state.selectedRows;
    if (selected) {
      //选中加入
      if (!this.hadSelectedRow(oldSelectedRows, record)) {
        oldSelectedRows.push(record);
      }
    } else {
      //取消选择
      oldSelectedRows = oldSelectedRows.filter((item) => {
        return item.id !== record.id;
      });
    }
    this.setState({ selectedRows: oldSelectedRows });
  };

  //看是否已经选中，如果已经选中不再加入
  hadSelectedRow = (selectedRows, record) => {
    let r = false;
    selectedRows.forEach((item) => {
      if (item.id === record.id) {
        r = true;
      }
    });
    return r;
  };

  //通过ajax远程载入数据
  search = () => {
    this.setState({ selectedRowKeys: [], selectedRows: [] }); //搜索时先清空已经选择的
    if (this.props.onSelect !== undefined) {
      this.props.onSelect([]); //搜索时清空
    }
    if(this.state.selectedKeys.join(",")!==''){
      this.loadData(this.defaultPagination, { appId: this.state.selectedKeys });
    }else{
      this.loadData(this.defaultPagination);
    }
  };


  onSearchChange = (e) => {
    this.setState({
      searchKeyWords: e.target.value,
    });
  };

  onSelect = (selectedKeys, e) => {
    const {
      node: { props },
    } = e;
    this.setState(
      {
        selectedKeys,
        searchKeyWords: "",
      },
      () => {
        this.loadData(this.defaultPagination, { appId: selectedKeys }, {}, {});
      }
    );
  };

  searchApp = (value) => {
    if(!value) {
      this.getTreeData()
    }else {
      const newTreeData = []
      this.state.treeData.forEach(item => {
        if(item.title.indexOf(value) != -1) {
          newTreeData.push(item)
        }
      })
      this.setState({
        treeData:newTreeData
      })
    }

  }

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      type: "radio",
      /* onSelect: this.onRowSelect ,*/
    };
    const { rowsData, pagination, selectedRowKeys, loading } = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const columns = [
      {
        title: "Method",
        dataIndex: "methodType",
        width: "10%",
        render: (text, record) => {
          let method = record.methodType;
          if (method === "POST") {
            return (
              <Tag color="#87d068" style={{ width: 50 }}>
                POST
              </Tag>
            );
          } else if (method === "GET") {
            return (
              <Tag color="#108ee9" style={{ width: 50 }}>
                GET
              </Tag>
            );
          } else if (method === "DELETE") {
            return (
              <Tag color="#f50" style={{ width: 50 }}>
                DELETE
              </Tag>
            );
          } else if (method === "PUT") {
            return (
              <Tag color="pink" style={{ width: 50 }}>
                PUT
              </Tag>
            );
          } else if (method === "*") {
            return (
              <Tag color="#f50" style={{ width: 50 }}>
                全部
              </Tag>
            );
          }else{
            return (
              <Tag color="blue" style={{ width: 50 }}>
                {text}
              </Tag>
            );
          }
        },
      },
      {
        title: "服务名",
        dataIndex: "configName",
        width: "30%",
        sorter: true,
      },
      {
        title: "服务URL",
        dataIndex: "mapUrl",
        width: "40%",
        sorter: true,
      },
      {
        title: "应用",
        dataIndex: "appId",
        width: "10%",
        sorter: true,
      },
      {
        title: "创建者",
        dataIndex: "creatorName",
        width: "10%",
        sorter: true,
      }
    ];

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
        <div style={{ minHeight: 300 }}>
          <Row /* style={{height: 689, overflowY:'auto'}} */>
            <Col
              span={6}
              style={{ height: 689, overflowY: "auto", marginRight: 20 }}
            >
              <TypographyTitle level={3}>
                <Tag color="magenta">应用分类:</Tag>
              </TypographyTitle>
              <div >
                <Input.Search
                  placeholder="请输入要搜索的应用名称"
                  style={{ width: "95%"}}
                  onSearch={this.searchApp}
                />
              </div>
              <div>
                <Tree
                  style={{
                    /* height: 689, overflowY:'auto' */ paddingRight: 20,
                  }}
                  onSelect={this.onSelect}
                  expandedKeys={this.state.openKeys}
                  selectedKeys={this.state.selectedKeys}
                  onExpand={this.onOpenChange}
                  showIcon={true}
                  showLine={true}
                  treeData={this.state.treeData}
                  defaultExpandAll={true}
                  autoExpandParent={true}
                ></Tree>
              </div>
            </Col>
            <Col span={17} style={{ height: 689, overflowY: "auto" }}>
              <div style={{ marginTop: "0px", marginBottom: "8px" }}>
                <InputGroup compact style={{ fontSize: "14px" }}>
                  {/* <AjaxSelect url={applicationUrl} value={this.state.selectAppId} valueId='portalAppId' textId='portalAppName' styleOption={{ width: '300px' }} onChange={this.appSelectChange} /> */}
                  <Input.Search
                    placeholder="请输入要搜索的API的URL或名称"
                    style={{ width: "30%", float: "right" }}
                    onChange={this.onSearchChange}
                    value={this.state.searchKeyWords}
                    onSearch={this.search}
                  />
                  {/* <Button shape="circle" icon="search" onClick={this.search} /> */}
                </InputGroup>
              </div>
              <Table
                /* style={{height:689, overflowY:'auto'}} */
                bordered={false}
                rowKey={(record) => record.id}
                rowSelection={rowSelection}
                dataSource={rowsData}
                columns={columns}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
                size="small"
                /*scroll={{y:689}} */
              />
            </Col>
          </Row>
        </div>
      </Spin>
    );
  }
}

export default SelectAPI;
