import React from "react";
import ReactDOM from "react-dom";
import {
  Layout,
  Input,
  Button,
  Spin,
  Card,
  Modal,
  Icon,
  Drawer,
  Menu,
  Dropdown,
  Tabs,
  Row,
  Col,
} from "antd";
import * as URI from "../../core/constants/RESTURI";
import * as AjaxUtils from "../../core/utils/AjaxUtils";
import { get } from "../../core/utils/AxiosUtils";
import ProcessRunOption from "./grid/ProcessRunOption";
import ProcessMonitor from "./ProcessMonitor";
import LeftMenu from "./ProcessDesignerLeftMenu";
import ProcessFrame from "./ProcessFrame";
import StartNode from "./form/StartNode";
import RouterNode from "./form/RouterNode";
import ProcessNode from "./form/ProcessNode";
import EndNode from "./form/EndNode";
import GatewayNode from "./form/GatewayNode";
import ApiNode from "./form/ApiNode";
import WebServiceNode from "./form/WebServiceNode";
import EventNode from "./form/EventNode";
import TimeNode from "./form/TimeNode";
import MsgNode from "./form/MsgNode";
import TextNode from "./form/TextNode";
import DubboNode from "./form/dubboNode";
import WeiXinNode from "./form/WeiXinNode";
import DingNode from "./form/DingNode";
import KafkaNode from "./form/KafkaNode";
import DataMapNode from "./form/DataMapNode";
import DataMergeNode from "./form/DataMergeNode";
import VariableNode from "./form/VariableNode";
import ManualConfirmNode from "./form/ManualConfirmNode";
import DataOutputNode from "./form/DataOutputNode";
import JavaBeanNode from "./form/JavaBeanNode";
import MqttNode from "./form/MqttNode";
import ResponseCropNode from "./form/ResponseCropNode";
import VariableRuleNode from "./form/VariableRuleNode";
import ShowProcessLog from "../monitor/form/ShowProcessLog";
import SQLExecuterNode from "./form/SQLExecuterNode";
import AsyncCallbackNode from "./form/AsyncCallbackNode";
import AsyncQueueNode from "./form/AsyncQueueNode";
import Xml2JsonNode from "./form/Xml2JsonNode";
import Json2XmlNode from "./form/Json2XmlNode";
import UploadByteNode from "./form/ApiUploadNode";
import DownloadByteNode from "./form/ApiDownloadNode";
import DataSplitNode from "./form/DataSplitNode";
import JmsWriteNode from "./form/JmsWriteNode";
import VelocityNode from "./form/VelocityNode";
import ShellExecuterNode from "./form/ShellExecuterNode";
import DataTransformNode from "./form/DataTransformNode";
import PythonNode from "./form/PythonNode";
import SubProcessNode from "./form/SubProcessNode";
import DataValueMapNode from "./form/DataValueMapNode";
import RabbitMQNode from "./form/RabbitMQNode";
import MappingTemplateNode from "./form/MappingTemplateNode";
import TCPNode from "./form/TCPNode";
import HtmlPageNode from "./form/HtmlPageNode";
import JavaScriptCodeNode from "./form/JavaScriptCodeNode";
import JavaCodeNode from "./form/JavaCodeNode";
import JdbcWriteNode from "./write/JdbcWriteNode";
import TableReadNode from "./read/TableReadNode";
import ProcessSaveVersion from "./grid/ProcessSaveVersion";
import AppFlowNode from "./form/AppFlowNode";
import LinkerImg from "./img/linker.png";
import "./linker.less";

const { Header, Footer, Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const saveProcessUrl = URI.ESB.CORE_ESB_CONFIG.saveProcessModel;
const getProcessUrl = URI.ESB.CORE_ESB_CONFIG.getById;
const deleteProcessNodeUrl = URI.ESB.CORE_ESB_PROCESSNODE.delete;
const copyProcessNodeUrl = URI.ESB.CORE_ESB_PROCESSNODE.copyUrl;
const RUN_URL = URI.ESB.CORE_ESB_CONFIG.run;
const LIST_INSTANCE_URL = URI.ESB.CORE_ESB_MONITOR.listProcess;
const connectorListUrl = URI.CORE_CONNECTOR.listApps;
const connectorApiCategory = URI.CORE_CONNECTOR.menuUrl;
const connectorApiListUrl = URI.CORE_APIPORTAL_APIMANAGER.ListApisUrl;

class ProcessDesigner extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.appId;
    this.processId = this.props.processId;
    this.applicationId = this.props.applicationId;
    this.state = {
      mask: true,
      visible: false,
      drawerKey: new Date().getTime(),
      processUrl: webappsProjectName + "/res/esb/designer/FlowDesigner.html",
      currentNodeObj: {},
      currentEleId: "",
      currentNodeType: "",
      selectedKeys: [],
      modulesShow: false,
      modulesType: 0,
      menuAppId: "",
      appType: "",
      appName: "",
      linkerList: [],
      linkerOpts: {},
      apiCategoryList: [],
      apiMenuSelectKey: undefined,
      apiList: [],
      checkedApi: {},
    };
  }

  componentDidMount() {}

  //改变状态
  changeState = (stateObj) => {
    this.setState(stateObj);
  };

  handleCancel = (e) => {
    this.setState({ visible: false });
  };

  getLinker = (params) => {
    const url = `${connectorListUrl}?categoryId=*`;
    get(url, {
      ...params,
    }).then((res) => {
      this.setState({
        linkerList: res.data,
      });
    });
  };

  getApiCategory = (id) => {
    const url = `${connectorApiCategory}?appId=${id}`;
    AjaxUtils.get(url, (data) => {
      if (data.rows[0]) {
        this.getApiList(id, data.rows[0].value);
      }
      this.setState({
        apiCategoryList: data.rows,
        apiMenuSelectKey: data.rows[0] ? [data.rows[0].value] : undefined,
      });
    });
  };

  getApiList = (id, category, params) => {
    const url = `${connectorApiListUrl}?appId=${id}`;
    get(url, {
      pageSize: 9999,
      filters: {
        appId: id,
        categoryId: category,
      },
      ...params,
    }).then((res) => {
      this.setState({
        apiList: res.data.rows,
      });
    });
  };

  //创建链接器
  createLinker = (type, position) => {
    this.getLinker();
    this.setState({
      modulesShow: true,
      modulesType: 0,
      linkerOpts: {
        type,
        position,
      },
    });
  };

  //过程属性
  editProcessProps = () => {
    this.setState({
      visible: true,
      drawerKey: new Date().getTime(),
      currentEleId: "process",
      currentNodeType: "process",
    });
  };

  //任务节点，自动活动
  editNodeProps = (eleId) => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    let nodeObj = winobj.getGraph().node(winobj.getRemovePrefixId(eleId));
    const { text, nodeType } = nodeObj;
    const textData = text.split("<br />");
    this.setState({
      visible: true,
      drawerKey: new Date().getTime(),
      currentNodeObj: nodeObj,
      currentEleId: eleId,
      currentNodeType: nodeObj.nodeType,
      appName: nodeType === "dataConnectorNode" ? textData[0] : "",
      checkedApi:
        nodeType === "dataConnectorNode"
          ? {
              configName: textData[1],
            }
          : {},
    });
  };

  //路由属性
  editRouterProps = (routerObj) => {
    this.setState({
      visible: true,
      drawerKey: new Date().getTime(),
      currentNodeObj: routerObj,
      currentEleId: routerObj.eleId,
      currentNodeType: routerObj.nodeType,
    });
  };

  saveProcess = (showtip) => {
    let winobj = this.refs.ProcessFrame.getProcessObj();
    var allNodeObjs = winobj.getCurrentFlowDoc();
    let postData = {
      appId: this.appId,
      processId: this.processId,
      processModel: JSON.stringify(allNodeObjs),
    };
    // return;
    this.setState({ mask: true });
    AjaxUtils.post(saveProcessUrl, postData, (data) => {
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        this.setState({ mask: false });
        if (showtip != false) {
          AjaxUtils.showInfo(data.msg);
        }
      }
    });
  };

  runProcess = (e) => {
    this.setState({
      currentNodeType: "processRunOption",
      drawerKey: new Date().getTime(),
      visible: true,
    });
  };

  saveProcessVersion = (e) => {
    this.setState({
      currentNodeType: "processSaveVersion",
      drawerKey: new Date().getTime(),
      visible: true,
    });
  };

  deleteProcessNode = (nodeIds) => {
    this.setState({ mask: true });
    AjaxUtils.post(
      deleteProcessNodeUrl,
      { processId: this.processId, nodeId: nodeIds.join(",") },
      (data) => {
        this.setState({ mask: false, currentNodeObj: {} });
        if (data.state === false) {
          AjaxUtils.showError(data.msg);
        } else {
          // AjaxUtils.showInfo("节点删除成功!");
        }
      }
    );
  };

  copyProcessNode = (sourceNodeId, targetNodeId) => {
    this.setState({ mask: true });
    AjaxUtils.post(
      copyProcessNodeUrl,
      {
        processId: this.processId,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId,
      },
      (data) => {
        this.setState({ mask: false });
        if (data.state === false) {
          AjaxUtils.showError(data.msg);
        } else {
          AjaxUtils.showInfo(data.msg);
        }
      }
    );
  };

  closeModal = (reLoadFlag, text, nodeType) => {
    this.setState({ visible: false });
    if (text === undefined && nodeType === undefined) {
      return;
    } //流程过程属性关闭时是undefined的
    if (reLoadFlag === true) {
      let processFrame = this.refs.ProcessFrame;
      let winobj = processFrame.getProcessObj();
      var eleId = this.state.currentEleId;
      if (nodeType === "router") {
        //路由线
        winobj.setRouterLabel(
          winobj.$(eleId).attr("sourceId"),
          winobj.$(eleId).attr("targetId"),
          text
        );
      } else {
        //普通节点
        this.state.currentNodeObj.text = text;
        let nodeObj = winobj.$("#" + this.state.currentNodeObj.key);
        winobj.addTextToNode(nodeObj, text);
      }
    }
  };

  //图形监控
  showProcessMonitor = () => {
    this.setState({ mask: true });
    let url =
      LIST_INSTANCE_URL +
      "?processId=" +
      this.processId +
      "&runType=1&pageSize=1";
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (data.rows.length > 0) {
          this.setState({
            transactionId: data.rows[0].transactionId,
            visible: true,
            drawerKey: new Date().getTime(),
            currentNodeType: "ProcessMonitor",
          });
        } else {
          AjaxUtils.showError(
            "提示:未发现正在执行中的任务，可以在任务监控列表中查看所有执行记录!"
          );
        }
      }
    });
  };

  //新增节点
  newProcessNode = (nodeType, templateId = "", nodeName = "") => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    if (nodeType === undefined) {
      return;
    }
    winobj.$("#Container").css("cursor", "pointer");
    winobj.GoalNewNodeType = nodeType; //要新增节点的类型
    winobj.GoalNodeTemplateId = templateId; //设置全局性质的模板Id
    winobj.GoalNodeName = nodeName; //设置全局性的节点名称
  };
  processMouseTool = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.mouseTool();
  };
  processConnectionTool = (lineType) => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.connectionTool(lineType);
  };
  processGrid = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.showGrid();
  };
  processUnDo = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.undo();
  };
  processReDo = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.redo();
  };
  processSetting = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.setting();
  };
  saveProcessPhoto = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.save2Photo();
  };
  processSelectedAll = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.selectedAll();
  };

  changeTransform = (e) => {
    let action = e.key;
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.ChangeTransform(action);
  };

  //显示日志内容
  showLog = () => {
    this.setState({
      visible: true,
      drawerKey: new Date().getTime(),
      currentNodeType: "log",
    });
  };

  unMask = () => {
    this.setState({ mask: false });
  };

  addLinker = (item) => {
    this.getApiCategory(item.appId);
    this.setState({
      modulesType: 1,
      menuAppId: item.appId,
      appType: item.appId,
      appName: item.appName,
    });
  };

  apiMenuFormatter = (data) => {
    return data.map((item) => {
      if (item.children && item.children.length) {
        return (
          <Menu.SubMenu key={item.value} title={item.label}>
            {this.apiMenuFormatter(item.children)}
          </Menu.SubMenu>
        );
      } else {
        return <Menu.Item key={item.value}>{item.label}</Menu.Item>;
      }
    });
  };

  apiMenuClick = ({ key }) => {
    this.getApiList(this.state.menuAppId, key);
    this.setState({
      apiMenuSelectKey: [key],
    });
  };

  selectApi = (item) => {
    let processFrame = this.refs.ProcessFrame;
    let iframeWindow = processFrame.refs.iframe.contentWindow;
    iframeWindow.GoalNodeName = this.state.appName + "<br />" + item.configName;
    this.setState({
      currentEleId: "",
      checkedApi: item,
      modulesShow: false,
      currentNodeObj: {},
      visible: true,
      drawerKey: new Date().getTime(),
      currentNodeType: "dataConnectorNode",
    });
  };

  handleSearch = (value) => {
    this.getLinker(
      value
        ? {
            searchFilters: {
              appName: value,
            },
          }
        : undefined
    );
  };

  handleApiSearch = (value) => {
    this.getApiList(
      this.state.menuAppId,
      this.state.apiMenuSelectKey[0],
      value
        ? {
            searchFilters: {
              mapUrl: value,
              creator: value,
              creatorName: value,
              configName: value,
              tags: value,
            },
          }
        : undefined
    );
  };

  render() {
    const transformmenu = (
      <Menu onClick={this.changeTransform}>
        <Menu.Item key="1">缩小</Menu.Item>
        <Menu.Item key="2">放大</Menu.Item>
      </Menu>
    );
    const undomenu = (
      <Menu>
        <Menu.Item key="1" onClick={this.processUnDo}>
          撤销
        </Menu.Item>
        <Menu.Item key="2" onClick={this.processReDo}>
          重做
        </Menu.Item>
      </Menu>
    );
    let nodePropsForm;
    let nodeType = this.state.currentNodeType;
    if (nodeType === "start") {
      nodePropsForm = (
        <StartNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eleId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "end") {
      nodePropsForm = (
        <EndNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "router") {
      nodePropsForm = (
        <RouterNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "process") {
      nodePropsForm = (
        <ProcessNode
          appId={this.appId}
          id={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "gateWay") {
      nodePropsForm = (
        <GatewayNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "taskNode") {
      nodePropsForm = (
        <TaskNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "apiNode") {
      nodePropsForm = (
        <ApiNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "timeNode") {
      nodePropsForm = (
        <TimeNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "msgNode") {
      nodePropsForm = (
        <MsgNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "weixinNode") {
      nodePropsForm = (
        <WeiXinNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dingNode") {
      nodePropsForm = (
        <DingNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "textNode") {
      nodePropsForm = (
        <TextNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "eventNode") {
      nodePropsForm = (
        <EventNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "webService") {
      nodePropsForm = (
        <WebServiceNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dubbo") {
      nodePropsForm = (
        <DubboNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "kafkaNode") {
      nodePropsForm = (
        <KafkaNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataMapNode") {
      nodePropsForm = (
        <DataMapNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataMergeNode") {
      nodePropsForm = (
        <DataMergeNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "variableNode") {
      nodePropsForm = (
        <VariableNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "manualConfirmNode") {
      nodePropsForm = (
        <ManualConfirmNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataOutputNode") {
      nodePropsForm = (
        <DataOutputNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "javaBeanNode") {
      nodePropsForm = (
        <JavaBeanNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "mqttNode") {
      nodePropsForm = (
        <MqttNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "variableRuleNode") {
      nodePropsForm = (
        <VariableRuleNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "responseCropNode") {
      nodePropsForm = (
        <ResponseCropNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "log") {
      nodePropsForm = (
        <ShowProcessLog
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "sqlExecuterNode") {
      nodePropsForm = (
        <SQLExecuterNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "asyncCallbackNode") {
      nodePropsForm = (
        <AsyncCallbackNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "asyncQueueNode") {
      nodePropsForm = (
        <AsyncQueueNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "xml2jsonNode") {
      nodePropsForm = (
        <Xml2JsonNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "json2xmlNode") {
      nodePropsForm = (
        <Json2XmlNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "uploadByteNode") {
      nodePropsForm = (
        <UploadByteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "downloadByteNode") {
      nodePropsForm = (
        <DownloadByteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataSplitNode") {
      nodePropsForm = (
        <DataSplitNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "jmsWriteNode") {
      nodePropsForm = (
        <JmsWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "velocityNode") {
      nodePropsForm = (
        <VelocityNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "shellNode") {
      nodePropsForm = (
        <ShellExecuterNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataTransformNode") {
      nodePropsForm = (
        <DataTransformNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "pythonNode") {
      nodePropsForm = (
        <PythonNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "subProcessNode") {
      nodePropsForm = (
        <SubProcessNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataValueMapNode") {
      nodePropsForm = (
        <DataValueMapNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "rabbitMQNode") {
      nodePropsForm = (
        <RabbitMQNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "mappingTemplateNode") {
      nodePropsForm = (
        <MappingTemplateNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "tcpNode") {
      nodePropsForm = (
        <TCPNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "ProcessMonitor") {
      nodePropsForm = (
        <ProcessMonitor
          status="current"
          processId={this.processId}
          transactionId={this.state.transactionId}
          appId={this.appId}
        />
      );
    } else if (nodeType === "htmlPageNode") {
      nodePropsForm = (
        <HtmlPageNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "processRunOption") {
      nodePropsForm = (
        <ProcessRunOption
          appId={this.appId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "processSaveVersion") {
      nodePropsForm = (
        <ProcessSaveVersion
          appId={this.appId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "javaScriptCodeNode") {
      nodePropsForm = (
        <JavaScriptCodeNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "javaCodeNode") {
      nodePropsForm = (
        <JavaCodeNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataConnectorNode") {
      // 数据链接器
      nodePropsForm = (
        <AppFlowNode
          key={this.state.drawerKey}
          appId={this.appId}
          appType={this.state.appType}
          refObj={this.refs.ProcessFrame} // 流程设计iframe的refs
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          applicationId={this.applicationId}
          opts={this.state.checkedApi} // 选中api的数据
          appName={this.state.appName} // 应用名称
          linkerOpts={this.state.linkerOpts} // 链接器数据
          close={this.handleCancel}
        />
      );
    } else if (nodeType === "jdbcWriteNode") {
      nodePropsForm = (
        <JdbcWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "tableReadNode") {
      nodePropsForm = (
        <TableReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    }

    const {
      drawerKey,
      modulesShow,
      modulesType,
      appName,
      linkerList,
      apiCategoryList,
      apiMenuSelectKey,
      apiList,
      currentNodeType,
      checkedApi,
    } = this.state;

    return (
      <Spin spinning={this.state.mask} tip="Loading...">
        <div style={{ border: "1px #cccccc solid", margin: "0px" }}>
          <Drawer
            key={Math.random()}
            title={
              currentNodeType === "dataConnectorNode" ? (
                <div>
                  <span style={{ fontSize: "16px", marginRight: 10 }}>
                    {appName}
                  </span>
                  <span style={{ fontSize: "14px", color: "#999" }}>|</span>
                  <span
                    style={{ marginLeft: 10, fontSize: "14px", color: "#999" }}
                  >
                    {checkedApi.configName}
                  </span>
                </div>
              ) : (
                ""
              )
            }
            placement="right"
            width={currentNodeType === "dataConnectorNode" ? 760 : 1250}
            headerStyle={{ borderBottom: "none" }}
            bodyStyle={{
              padding: currentNodeType === "dataConnectorNode" ? 0 : 24,
            }}
            closable={currentNodeType === "dataConnectorNode"}
            onClose={this.handleCancel}
            visible={this.state.visible}
          >
            {nodePropsForm}
          </Drawer>
          <Modal
            title={
              modulesType === 0 ? (
                "选择组件"
              ) : (
                <span>
                  <Icon
                    type="left"
                    onClick={() => this.setState({ modulesType: 0 })}
                  />
                  {appName}
                </span>
              )
            }
            visible={modulesShow}
            width={800}
            footer={null}
            onCancel={() => this.setState({ modulesShow: false })}
          >
            <div className="modules-wrapper">
              <div
                className="modules-scroll"
                style={{
                  transform: modulesType
                    ? "translate(-50%, 0)"
                    : "translate(0, 0)",
                }}
              >
                <div className="modules-item">
                  <Input.Search
                    placeholder="搜索链接器"
                    onSearch={this.handleSearch}
                  />
                  <Tabs>
                    <Tabs.TabPane tab="设计链接器">
                      <div className="linker-list">
                        {linkerList.map((item) => (
                          <div
                            className="linker-item"
                            key={item.appId}
                            onClick={() => this.addLinker(item)}
                          >
                            <img src={LinkerImg} alt="链接器图标" />
                            {item.appName}
                          </div>
                        ))}
                      </div>
                    </Tabs.TabPane>
                  </Tabs>
                </div>
                <div className="modules-item">
                  <Row className="modules-row">
                    <Col span={6} className="modules-col">
                      <Menu
                        className="modules-api-menu"
                        selectedKeys={apiMenuSelectKey}
                        onClick={this.apiMenuClick}
                        mode="inline"
                      >
                        {this.apiMenuFormatter(apiCategoryList)}
                      </Menu>
                    </Col>
                    <Col span={18} className="modules-col">
                      <div className="modules-api-body">
                        <Input.Search
                          className="modules-api-search"
                          placeholder="搜索"
                          onSearch={this.handleApiSearch}
                        />
                        <ul className="modules-api-list">
                          {apiList.map((item) => (
                            <li onClick={() => this.selectApi(item)}>
                              {item.configName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </Modal>
          <div
            style={{
              padding: "10px 20px 10px 20px",
              borderBottom: "1px #cccccc solid",
              background: "#fff",
            }}
          >
            <Button onClick={this.saveProcess} type="primary" icon="save">
              保存
            </Button>{" "}
            <Button onClick={this.saveProcessVersion} icon="save">
              另存版本
            </Button>{" "}
            <Button onClick={this.runProcess} icon="play-circle">
              运行
            </Button>{" "}
            <Button
              onClick={this.processConnectionTool.bind(this, "Flowchart")}
              icon="rollback"
            >
              流程线
            </Button>{" "}
            <Button
              onClick={this.processConnectionTool.bind(this, "Straight")}
              icon="arrows-alt"
            >
              直线
            </Button>{" "}
            <Button onClick={this.processSelectedAll} icon="border-outer">
              全选
            </Button>{" "}
            <Dropdown overlay={undomenu}>
              <Button icon="reload">
                撤销
                <Icon type="down" />
              </Button>
            </Dropdown>{" "}
            <Dropdown overlay={transformmenu}>
              <Button icon="fullscreen-exit">
                缩放
                <Icon type="down" />
              </Button>
            </Dropdown>{" "}
            <Button icon="profile" onClick={this.editProcessProps}>
              流程属性
            </Button>{" "}
            <Button icon="file-text" onClick={this.showLog}>
              调试日志
            </Button>{" "}
            <Button icon="file" onClick={this.showProcessMonitor}>
              任务监控
            </Button>{" "}
          </div>

          <div
            style={{
              border: "0 #cccccc solid",
              margin: "0px",
              borderRadius: "0px",
            }}
          >
            <ProcessFrame
              ref="ProcessFrame"
              src={this.state.processUrl}
              processId={this.processId}
              editNodeProps={this.editNodeProps}
              editRouterProps={this.editRouterProps}
              editProcessProps={this.editProcessProps}
              saveProcess={this.saveProcess}
              deleteProcessNode={this.deleteProcessNode}
              copyProcessNode={this.copyProcessNode}
              runProcess={this.runProcess}
              changeState={this.changeState}
              unMask={this.unMask}
              createLinker={this.createLinker}
            />
          </div>
        </div>
      </Spin>
    );
  }
}

export default ProcessDesigner;
