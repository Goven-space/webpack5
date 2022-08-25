import React from "react";
import {
  Form,
  Select,
  Input,
  Button,
  Spin,
  Radio,
  Tabs,
  Typography,
	Icon
} from "antd";
import * as URI from "../../../core/constants/RESTURI";
import * as AjaxUtils from "../../../core/utils/AjaxUtils";
import * as FormUtils from "../../../core/utils/FormUtils";
import AjaxSelect from "../../../core/components/AjaxSelect";
import JoinDataFieldConfig from "./components/JoinDataFieldConfig";
import JoinDataFieldConfig_Merge from "./components/JoinDataFieldConfig_Merge";
import JoinDataRulesConfig from "./components/JoinDataRulesConfig";

//多流合并节点

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl = URI.ETL.PROCESSNODE.props;
const SubmitUrl = URI.ETL.PROCESSNODE.save; //存盘地址
const SelectNodeUrl = URI.ETL.PROCESSNODE.selectNode; //节点选择

const { Text } = Typography;

class form extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.appId;
    this.nodeObj = this.props.nodeObj;
    this.eleId = this.props.eldId;
    this.processId = this.props.processId;
    this.selectNodeUrl =
      SelectNodeUrl + "?processId=" + this.processId + "&nodeType=*";
    this.pNodeRole = "compute";
    this.state = {
      mask: false,
      formData: {
        tableColumns: "[]",
        tableColumns_a: "[]",
        tableColumns_b: "[]",
      },
      /* joinNodeIds_a: "",
      joinNodeIds_b: "", */
			rulesData:'',
    };
  }

  componentDidMount() {
    this.loadNodePropsData();
  }

  loadNodePropsData = () => {
    let url =
      PropsUrl + "?processId=" + this.processId + "&nodeId=" + this.nodeObj.key;
    this.setState({ mask: true });
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (JSON.stringify(data) !== "{}") {
          this.setState({ formData: data, joinRulesFlag: data.joinRulesFlag?data.joinRulesFlag:'and'});
          FormUtils.setFormFieldValues(this.props.form, data);
        }
      }
    });
  };

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postData = {};
        Object.keys(values).forEach(function (key) {
          if (values[key] !== undefined) {
            let value = values[key];
            if (value instanceof Array) {
              postData[key] = value.join(","); //数组要转换为字符串提交
            } else {
              postData[key] = value;
            }
          }
        });
        postData = Object.assign({}, this.state.formData, postData);
        postData.appId = this.appId;
        postData.pNodeType = this.nodeObj.nodeType;
        postData.processId = this.processId;
        postData.pNodeRole = this.pNodeRole;
        postData.tableColumns = this.getTableColumns();
        let joinCondition=this.handleGetRules();
        if(this.handleGetRules()!==''){
            postData.joinCondition=joinCondition;
        }
        let title = postData.pNodeId + "#" + postData.pNodeName;
        this.setState({ mask: true });
        AjaxUtils.post(SubmitUrl, postData, (data) => {
          if (data.state === false) {
            this.showInfo(data.msg);
          } else {
            this.setState({ mask: false });
            AjaxUtils.showInfo("保存成功!");
            if (closeFlag) {
              this.props.close(true, title);
            }
          }
        });
      }
    });
  };

  //a+b表合并后的记录
  getTableColumns = () => {
    let a = JSON.parse(this.state.formData.tableColumns_a);
    a.forEach((item, index, array) => {
      item.tableName = "A";
    });
    let b = JSON.parse(this.state.formData.tableColumns_b);
    b.forEach((item, index, array) => {
      item.tableName = "B";
    });
    let c = this.MergeArray(a, b);
    return JSON.stringify(c);
  };

  //arr1=a,arr2=b
  MergeArray = (arr1, arr2) => {
    var _arr = new Array();
    for (var i = 0; i < arr1.length; i++) {
      _arr.push(arr1[i]);
    }
    for (var i = 0; i < arr2.length; i++) {
      var flag = false;
      var bColId = arr2[i].colId.toLowerCase();
      for (var j = 0; j < arr1.length; j++) {
        let aColId = arr1[j].colId.toLowerCase();
        if (bColId === aColId) {
          arr1[j].tableName = "B";
          //A表中的字段复制一行
          var newItem = JSON.parse(JSON.stringify(arr1[j]));
          newItem.tableName = "A";
          newItem.colId = newItem.colId + "_1";
          //_arr.push(newItem);
          flag = true; //说明b表中的字段已经在a表中存在
          break;
        }
      }
      if (flag == false) {
        _arr.push(arr2[i]);
      }
    }
    return _arr;
  };

  updateTableColumns_a = (data) => {
    this.state.formData.tableColumns_a = JSON.stringify(data);
  };

  updateTableColumns_b = (data) => {
    this.state.formData.tableColumns_b = JSON.stringify(data);
  };

  updateTableColumns_join = (data) => {};

  getNodeIds_a = () => {
    let joinNodeIds = this.props.form.getFieldValue("sourceNodeId_a");
    return joinNodeIds;
  };

  getNodeIds_b = () => {
    let joinNodeIds = this.props.form.getFieldValue("sourceNodeId_b");
    return joinNodeIds;
  };

  getNodeIds_join = () => {
    let a = this.props.form.getFieldValue("sourceNodeId_a");
    let b = this.props.form.getFieldValue("sourceNodeId_b");
    return a + "," + b;
  };

  /* handleSourceNodeIdChange = (flag, value) => {
    if (flag === "sourceNodeId_a") {
      this.setState({ joinNodeIds_a: value });
    } else {
      this.setState({ joinNodeIds_b: value });
    }
  }; */

	handleGetRules = () => {
		let dataStr = ''
		if(this.rulesConfigRef && this.rulesConfigRef.state) {
			const {data} = this.rulesConfigRef.state
			const connectMark = this.props.form.getFieldValue("joinRulesFlag")
			const filterData =  data.filter(item => item.sourceNodeId_a && item.sourceNodeId_b)
			filterData.forEach((item, index) => {
					dataStr += `a.${item.sourceNodeId_a}=b.${item.sourceNodeId_b}${index===filterData.length-1?'':` ${connectMark} `}`
			})
		}
		this.setState({
			rulesData:dataStr
		})
		return dataStr
	}

	handleTabChange = (activeKey) => {
		if(activeKey === 'props') {
			this.props.form.setFieldsValue({
				joinCondition: this.handleGetRules()
			})
		}
	}

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const formItemLayout4_16 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
        <Form onSubmit={this.onSubmit}>
          <Tabs size="large" onChange={this.handleTabChange}>
            <TabPane tab="基本属性" key="props">
              <FormItem
                label="节点名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本节点的说明"
              >
                {getFieldDecorator("pNodeName", {
                  rules: [{ required: false }],
                  initialValue: this.nodeObj.text,
                })(<Input />)}
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="节点id不能重复"
              >
                {getFieldDecorator("pNodeId", {
                  rules: [{ required: true }],
                  initialValue: this.nodeObj.key,
                })(<Input disabled={true} />)}
              </FormItem>
              <FormItem
                label="Join模式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定是leftjoin还是innerjoin(rightjoin方式请调整A，B表的位置即可)"
              >
                {getFieldDecorator("joinType", {
                  rules: [{ required: true }],
                  initialValue: "leftjoin",
                })(
                  <Select>
                    <Option value="leftjoin">leftjoin</Option>
                    <Option value="innerjoin">innerjoin</Option>
                    <Option value="cartesianjoin">笛卡尔积</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem
                label="指定A表字段"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定A表数据所在节点,方便查看A表字段"
              >
                {getFieldDecorator("sourceNodeId_a", {
                  rules: [{ required: true }],
                })(
                  <AjaxSelect
                    url={this.selectNodeUrl}
                    valueId="nodeId"
                    textId="nodeName"
                    options={{ showSearch: true }}
                    /* onChange={(value) =>
                      this.handleSourceNodeIdChange("sourceNodeId_a", value)
                    } */
                  />
                )}
              </FormItem>
              <FormItem
                label="指定A流"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定A流的来源节点,空表示与A表字段所在节点一致"
              >
                {getFieldDecorator("sourceStreamNodeId_a", {
                  rules: [{ required: false }],
                })(
                  <AjaxSelect
                    url={this.selectNodeUrl}
                    valueId="nodeId"
                    textId="nodeName"
                    options={{ showSearch: true}}
                  />
                )}
              </FormItem>
              <FormItem
                label="指定B表字段"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定B表数据所在节点方便查看B表字段"
              >
                {getFieldDecorator("sourceNodeId_b", {
                  rules: [{ required: true }],
                })(
                  <AjaxSelect
                    url={this.selectNodeUrl}
                    valueId="nodeId"
                    textId="nodeName"
                    options={{ showSearch: true }}
                    /* onChange={(value) =>
                      this.handleSourceNodeIdChange("sourceNodeId_b", value)
                    } */
                  />
                )}
              </FormItem>
              <FormItem
                label="指定B流"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="指定B流的来源节点,空表示与B表字段所在节点一致"
              >
                {getFieldDecorator("sourceStreamNodeId_b", {
                  rules: [{ required: false }],
                })(
                  <AjaxSelect
                    url={this.selectNodeUrl}
                    valueId="nodeId"
                    textId="nodeName"
                    options={{ showSearch: true }}
                  />
                )}
              </FormItem>
              <FormItem
                label="A,B表关联条件"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{
                  display:
                    this.props.form.getFieldValue("joinType") ===
                    "cartesianjoin"
                      ? "none"
                      : "",
                }}
                help="条件示例(字段不分大小写):a.id=b.id or|and a.userid=b.userid"
              >
                {getFieldDecorator("joinCondition", {
                  rules: [{ required: true }],
                  initialValue: "a.id=b.id",
                })(<Input  disabled={true} style={{color: '#000'}}/>)}
              </FormItem>
              <FormItem
                label="备注"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("remark")(<Input.TextArea autoSize />)}
              </FormItem>
            </TabPane>
            <TabPane tab="关联条件配置" key="joinRules">
              <div>
								<JoinDataRulesConfig
                    joinNodeIds_a={getFieldValue('sourceNodeId_a')}
                    joinNodeIds_b={getFieldValue('sourceNodeId_b')}
                    processId={this.processId}
										tableDataStr={getFieldValue('joinCondition')}
										joinRulesFlag={getFieldValue('joinRulesFlag')}
										ref={(rulesConfigRef) => this.rulesConfigRef = rulesConfigRef}
                ></JoinDataRulesConfig>
                <FormItem
									label="关联条件"
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 20 }}
                >

                  {getFieldDecorator("joinRulesFlag", { initialValue: "and" })(
                    <RadioGroup>
                      <Radio value="and">AND</Radio>
                      <Radio value="or">OR</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
								<FormItem
									label="关联数据展示:"
                  wrapperCol={{ span: 20 }}
									labelCol={{ span: 2 }}
                >
                    <Text style={{display:'inlineBlock', marginRight:50, fontSize:16}}>{this.state.rulesData}</Text>
										<Button type="link" style={{fontSize:16,marginLeft:20}} onClick={this.handleGetRules}>预览条件<Icon type="apartment" /></Button>
                </FormItem>
              </div>
            </TabPane>
            <TabPane tab="A表字段配置" key="tablea">
              <JoinDataFieldConfig
                parentForm={this.props.form}
                processId={this.processId}
                pNodeId={this.nodeObj.key}
								joinNodeIds={getFieldValue('sourceNodeId_a')}
                updateTableColumns={this.updateTableColumns_a}
                tableColumns={this.state.formData.tableColumns_a}
                /* getNodeIds={this.getNodeIds_a} */
              />
              注意:A表合并后的数据将以此字段配置为准，没有配置在本字段列表中的字段将被删除
            </TabPane>
            <TabPane tab="B表字段配置" key="tableb">
              <JoinDataFieldConfig
                parentForm={this.props.form}
                processId={this.processId}
                pNodeId={this.nodeObj.key}
								joinNodeIds={getFieldValue('sourceNodeId_b')}
                updateTableColumns={this.updateTableColumns_b}
                tableColumns={this.state.formData.tableColumns_b}
                /* getNodeIds={this.getNodeIds_b} */
              />
              注意:指定B表需要加入到A表中的字段，不需要加入的字段请删除
            </TabPane>
            <TabPane tab="合并后字段" key="jointab">
              <JoinDataFieldConfig_Merge
                getTableColumns={this.getTableColumns}
              />
              注意:A+B表的字段合将作为本节点输出数据流的字段
            </TabPane>
          </Tabs>

          <FormItem wrapperCol={{ span: 4, offset: 20 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this, true)}>
              保存
            </Button>{" "}
            <Button onClick={this.props.close.bind(this, false)}>关闭</Button>
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
