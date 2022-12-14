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
import ProcessMonitor from "./ProcessMonitor";
import LeftMenu from "./ProcessDesignerLeftMenu";
import ProcessFrame from "./ProcessFrame";
import StartNode from "./event/StartNode";
import RouterNode from "./common/RouterNode";
import ProcessNode from "./common/ProcessNode";
import EndNode from "./event/EndNode";
import GatewayNode from "./common/GatewayNode";
import ApiNode from "./apinode/ApiNode";
import ApiWriteNode from "./apinode/ApiWriteNode";
import FieldMappingNode from "./compute/FieldMappingNode";
import EventNode from "./event/EventNode";
import TimeNode from "./event/TimeNode";
import MsgNode from "./message/MsgNode";
import TextNode from "./common/TextNode";
import DataJoinNode from "./compute/DataJoinNode";
import WeiXinNode from "./message/WeiXinNode";
import DingNode from "./message/DingNode";
import KafkaWriteNode from "./write/KafkaWriteNode";
import KafkaReadNode from "./read/KafkaReadNode";
import JsonMapNode from "./event/JsonMapNode";
import DataMergeNode from "./compute/DataMergeNode";
import VariableNode from "./event/VariableNode";
import VariableRuleNode from "./event/VariableRuleNode";
import SqlReadNode from "./read/SqlReadNode";
import IncrementDataNode from "./compute/IncrementDataNode";
import JdbcWriteNode from "./write/JdbcWriteNode";
import MetaDataReadNode from "./read/MetaDataReadNode";
import MetaDataWriteNode from "./write/MetaDataWriteNode";
import DataFilterNode from "./compute/DataFilterNode";
import ValueMappingNode from "./compute/ValueMappingNode";
import SubProcessNode from "./common/SubProcessNode";
import DataUnionAllNode from "./compute/DataUnionAllNode";
import DataOutputNode from "./write/DataOutputNode";
import DataSortNode from "./compute/DataSortNode";
import DuplicateValueNode from "./compute/DuplicateValueNode";
import DataGroupbyNode from "./compute/DataGroupbyNode";
import MongoDbReadNode from "./read/MongoDbReadNode";
import MongoDBWriteNode from "./write/MongoDBWriteNode";
import ManualConfirmNode from "./common/ManualConfirmNode";
import ExcelWriteNode from "./file/ExcelWriteNode";
import ExcelReadNode from "./file/ExcelReadNode";
import MiddleDbWriteNode from "./write/MiddleDbWriteNode";
import MiddleDbReadNode from "./read/MiddleDbReadNode";
import RedisReadNode from "./read/RedisReadNode";
import RedisWriteNode from "./write/RedisWriteNode";
import ElasticWriteNode from "./write/ElasticWriteNode";
import ElasticReadNode from "./read/ElasticReadNode";
import DataSecurityNode from "./compute/DataSecurityNode";
import DataTransformNode from "./compute/DataTransformNode";
import DataGenerationNode from "./compute/DataGenerationNode";
import SequenceNode from "./compute/SequenceNode";
import FieldToRowsNode from "./compute/FieldToRowsNode";
import ValueComputeNode from "./compute/ValueComputeNode";
import DataTagNode from "./compute/DataTagNode";
import SFTPReadNode from "./file/SFTPReadNode";
import SFTPUploadNode from "./file/SFTPUploadNode";
import TxtFileReadNode from "./file/TxtFileReadNode";
import TxtFileWriteNode from "./file/TxtFileWriteNode";
import TableBatchReadNode from "./dbsync/TableBatchReadNode";
import TableBatchWriteNode from "./dbsync/TableBatchWriteNode";
import DataCryptNode from "./compute/DataCryptNode";
import ApiDownloadNode from "./apinode/ApiDownloadNode";
import ApiUploadNode from "./apinode/ApiUploadNode";
import ColumnToRowsNode from "./compute/ColumnToRowsNode";
import RowsToColumnsNode from "./compute/RowsToColumnsNode";
import FieldToColumnsNode from "./compute/FieldToColumnsNode";
import SQLExecuterNode from "./event/SQLExecuterNode";
import IncrementPageDataNode from "./compute/IncrementPageDataNode";
import ShowProcessLog from "../monitor/form/ShowProcessLog";
import AliOSSWriteNode from "./file/AliOSSWriteNode";
import DataSplitNode from "./compute/DataSplitNode";
import JmsWriteNode from "./write/JmsWriteNode";
import Xml2JsonNode from "./compute/Xml2JsonNode";
import Json2XmlNode from "./compute/Json2XmlNode";
import MulRowsToOneRowNode from "./compute/MulRowsToOneRowNode";
import MoveFileNode from "./file/MoveFileNode";
import ReadFilePathNode from "./file/ReadFilePathNode";
import DataSummaryNode from "./compute/DataSummaryNode";
import ShellExecuterNode from "./event/ShellExecuterNode";
import PythonNode from "./event/PythonNode";
import DistributedDataSplitNode from "./read/DistributedDataSplitNode";
import CreateTableNode from "./write/CreateTableNode";
import ZipFileNode from "./file/ZipFileNode";
import UnZipFileNode from "./file/UnZipFileNode";
import ProcedureNode from "./read/ProcedureNode";
import DataRecordTotalNode from "./compute/DataRecordTotalNode";
import MonitorFileNode from "./file/MonitorFileNode";
import ThreadPoolExecutorNode from "./common/ThreadPoolExecutorNode";
import ReadBigTxtFileNode from "./file/ReadBigTxtFileNode";
import CosWriteNode from "./file/CosWriteNode";
import JavaBeanNode from "./event/JavaBeanNode";
import CosDownloadNode from "./file/CosDownloadNode";
import OneRowToMulRowsNode from "./compute/OneRowToMulRowsNode";
import DeleteTableDataNode from "./dbsync/DeleteTableDataNode";
import WebServiceNode from "./apinode/WebServiceNode";
import ProcessRunOption from "./grid/ProcessRunOption";
import ProcessSaveVersion from "./grid/ProcessSaveVersion";
import SgingleTableCopyNode from "./dbsync/SgingleTableCopyNode";
import SgingleTableUpdateNode from "./dbsync/SgingleTableUpdateNode";
import JavaCodeNode from "./event/JavaCodeNode";
import JavaScriptCodeNode from "./event/JavaScriptCodeNode";
import PlatformConfigNode from "./event/PlatformConfigNode";
import RunKettleNode from "./event/RunKettleNode";
import DataValueCompareNode from "./compute/DataValueCompareNode";
import DBFFileReadNode from "./file/DBFFileReadNode";
import AppFlowNode from "./form/AppFlowNode";
import LinkerImg from "./img/linker.png";
import "./linker.less";

const { Header, Footer, Sider, Content } = Layout;
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
const saveProcessUrl = URI.ETL.CONFIG.saveProcessModel;
const getProcessUrl = URI.ETL.CONFIG.getById;
const deleteProcessNodeUrl = URI.ETL.PROCESSNODE.delete;
const copyProcessNodeUrl = URI.ETL.PROCESSNODE.copy;
const RUN_URL = URI.ETL.CONFIG.run;
const LIST_INSTANCE_URL = URI.ETL.MONITOR.listProcess;
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
      processUrl: webappsProjectName + "/res/etl/designer/FlowDesigner.html",
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

  //????????????
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

  //???????????????
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

  //????????????
  editProcessProps = () => {
    this.setState({
      visible: true,
      currentEleId: "process",
      currentNodeType: "process",
    });
  };

  //???????????????????????????
  editNodeProps = (eleId) => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    let nodeObj = winobj.getGraph().node(winobj.getRemovePrefixId(eleId));
    const { text, nodeType } = nodeObj;
    const textData = text.split("<br />");
    this.setState({
      visible: true,
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

  checkerror = () => {
    let winobj = this.refs.ProcessFrame.getProcessObj();
    var allNodeObjs = winobj.getCurrentFlowDoc();
    let postData = {
      appId: this.appId,
      processId: this.processId,
      processModel: JSON.stringify(allNodeObjs),
    };
    this.setState({ mask: true });
    AjaxUtils.post(CHECKERRORURL, postData, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        AjaxUtils.showInfo(data.msg);
      }
    });
  };

  //????????????
  saveProcess = (showmessage) => {
    let winobj = this.refs.ProcessFrame.getProcessObj();
    var allNodeObjs = winobj.getCurrentFlowDoc();
    // console.log(allNodeObjs);
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
        if (!showmessage == false) {
          AjaxUtils.showInfo("??????????????????!");
        }
      }
    });
  };
  //????????????
  editRouterProps = (routerObj) => {
    this.setState({
      visible: true,
      currentNodeObj: routerObj,
      currentEleId: routerObj.eleId,
      currentNodeType: routerObj.nodeType,
    });
  };

  //????????????
  saveProcess = (showmessage) => {
    let winobj = this.refs.ProcessFrame.getProcessObj();
    var allNodeObjs = winobj.getCurrentFlowDoc();
    // console.log(allNodeObjs);
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
        if (!showmessage == false) {
          AjaxUtils.showInfo("??????????????????!");
        }
      }
    });
  };

  runProcess = (e) => {
    this.setState({ currentNodeType: "processRunOption", visible: true });
  };

  saveProcessVersion = (e) => {
    this.setState({ currentNodeType: "processSaveVersion", visible: true });
  };

  deleteProcessNode = (nodeIds) => {
    this.setState({ mask: true });
    AjaxUtils.post(
      deleteProcessNodeUrl,
      { processId: this.processId, nodeId: nodeIds.join(",") },
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
    // console.log(text+"===="+nodeType);
    if (text === undefined && nodeType === undefined) {
      return;
    } //??????????????????????????????undefined???
    if (reLoadFlag === true) {
      let processFrame = this.refs.ProcessFrame;
      let winobj = processFrame.getProcessObj();
      var eleId = this.state.currentEleId;
      if (nodeType === "router") {
        //?????????
        winobj.setRouterLabel(
          winobj.$(eleId).attr("sourceId"),
          winobj.$(eleId).attr("targetId"),
          text
        );
      } else {
        //????????????
        this.state.currentNodeObj.text = text;
        let nodeObj = winobj.$("#" + this.state.currentNodeObj.key);
        winobj.addTextToNode(nodeObj, text, nodeType);
      }
    }
  };

  //????????????
  newProcessNode = (
    nodeType,
    templateId = "",
    nodeName = "",
    nodeStyle = "defaultNode"
  ) => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    if (nodeType === undefined) {
      return;
    }
    //??????????????????????????????????????????????????????????????????????????????????????????????????????
    winobj.$("#Container").css("cursor", "pointer");
    winobj.GoalNewNodeType = nodeType; //????????????????????????
    winobj.GoalNodeTemplateId = templateId; //???????????????????????????Id
    winobj.GoalNodeName = nodeName; //??????????????????????????????
    winobj.GoalNodeStyle = nodeStyle; //??????????????????????????????
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
    winobj.save2Photo()();
  };
  changeTransform = (e) => {
    let action = e.key;
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.ChangeTransform(action);
  };

  //??????????????????
  showLog = () => {
    this.setState({ visible: true, currentNodeType: "log" });
  };

  //????????????
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
            currentNodeType: "ProcessMonitor",
          });
        } else {
          AjaxUtils.showError(
            "??????:??????????????????????????????????????????????????????????????????????????????????????????!"
          );
        }
      }
    });
  };

  unMask = () => {
    this.setState({ mask: false });
  };
  processSelectedAll = () => {
    let processFrame = this.refs.ProcessFrame;
    let winobj = processFrame.getProcessObj();
    winobj.selectedAll();
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
            searchFilters: JSON.stringify({
              appName: value,
            }),
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
            searchFilters: JSON.stringify({
              mapUrl: value,
              creator: value,
              creatorName: value,
              configName: value,
              tags: value,
            }),
          }
        : undefined
    );
  };

  render() {
    const transformmenu = (
      <Menu onClick={this.changeTransform}>
        <Menu.Item key="1">??????</Menu.Item>
        <Menu.Item key="2">??????</Menu.Item>
      </Menu>
    );
    const undomenu = (
      <Menu>
        <Menu.Item key="1" onClick={this.processUnDo}>
          ??????
        </Menu.Item>
        <Menu.Item key="2" onClick={this.processReDo}>
          ??????
        </Menu.Item>
      </Menu>
    );
    let nodePropsForm;
    let nodeType = this.state.currentNodeType;
    // console.log(this.state.currentNodeObj);
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
    } else if (nodeType === "dataUnionAllNode") {
      nodePropsForm = (
        <DataUnionAllNode
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
    } else if (nodeType === "apiWriteNode") {
      nodePropsForm = (
        <ApiWriteNode
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
    } else if (nodeType === "fieldMappingNode") {
      nodePropsForm = (
        <FieldMappingNode
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
    } else if (nodeType === "kafkaWriteNode") {
      nodePropsForm = (
        <KafkaWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "kafkaReadNode") {
      nodePropsForm = (
        <KafkaReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "jsonMapNode") {
      nodePropsForm = (
        <JsonMapNode
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
    } else if (nodeType === "sqlReadNode") {
      nodePropsForm = (
        <SqlReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "incrementDataNode") {
      nodePropsForm = (
        <IncrementDataNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
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
    } else if (nodeType === "metaDataReadNode") {
      nodePropsForm = (
        <MetaDataReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "metaDataWriteNode") {
      nodePropsForm = (
        <MetaDataWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataFilterNode") {
      nodePropsForm = (
        <DataFilterNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "valueMappingNode") {
      nodePropsForm = (
        <ValueMappingNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataJoinNode") {
      nodePropsForm = (
        <DataJoinNode
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
    } else if (nodeType === "dataSortNode") {
      nodePropsForm = (
        <DataSortNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "duplicateValueNode") {
      nodePropsForm = (
        <DuplicateValueNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataGroupbyNode") {
      nodePropsForm = (
        <DataGroupbyNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "mongoDbReadNode") {
      nodePropsForm = (
        <MongoDbReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "mongoDbWriteNode") {
      nodePropsForm = (
        <MongoDBWriteNode
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
    } else if (nodeType === "excelWriteNode") {
      nodePropsForm = (
        <ExcelWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "excelReadNode") {
      nodePropsForm = (
        <ExcelReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "middleDbWriteNode") {
      nodePropsForm = (
        <MiddleDbWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "middleDbReadNode") {
      nodePropsForm = (
        <MiddleDbReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "redisReadNode") {
      nodePropsForm = (
        <RedisReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "redisWriteNode") {
      nodePropsForm = (
        <RedisWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "elasticWriteNode") {
      nodePropsForm = (
        <ElasticWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "elasticReadNode") {
      nodePropsForm = (
        <ElasticReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataSecurityNode") {
      nodePropsForm = (
        <DataSecurityNode
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
    } else if (nodeType === "dataGenerationNode") {
      nodePropsForm = (
        <DataGenerationNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "sequenceNode") {
      nodePropsForm = (
        <SequenceNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "fieldToRowsNode") {
      nodePropsForm = (
        <FieldToRowsNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "valueComputeNode") {
      nodePropsForm = (
        <ValueComputeNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataTagNode") {
      nodePropsForm = (
        <DataTagNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "sftpReadNode") {
      nodePropsForm = (
        <SFTPReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "sftpUploadNode") {
      nodePropsForm = (
        <SFTPUploadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "txtFileReadNode") {
      nodePropsForm = (
        <TxtFileReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "txtFileWriteNode") {
      nodePropsForm = (
        <TxtFileWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataCryptNode") {
      nodePropsForm = (
        <DataCryptNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "apiDownloadNode") {
      nodePropsForm = (
        <ApiDownloadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "apiUploadNode") {
      nodePropsForm = (
        <ApiUploadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "columnToRowsNode") {
      nodePropsForm = (
        <ColumnToRowsNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "rowsToColumnsNode") {
      nodePropsForm = (
        <RowsToColumnsNode
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
    } else if (nodeType === "fieldToColumnsNode") {
      nodePropsForm = (
        <FieldToColumnsNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
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
    } else if (nodeType === "incrementPageDataNode") {
      nodePropsForm = (
        <IncrementPageDataNode
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
    } else if (nodeType === "tableBatchReadNode") {
      nodePropsForm = (
        <TableBatchReadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "tableBatchWriteNode") {
      nodePropsForm = (
        <TableBatchWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "aliOSSWriteNode") {
      nodePropsForm = (
        <AliOSSWriteNode
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
    } else if (nodeType === "mulRowsToOneRowNode") {
      nodePropsForm = (
        <MulRowsToOneRowNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "moveFileNode") {
      nodePropsForm = (
        <MoveFileNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "readFilePathNode") {
      nodePropsForm = (
        <ReadFilePathNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataSummaryNode") {
      nodePropsForm = (
        <DataSummaryNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "shellCmdNode") {
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
    } else if (nodeType === "distributedDataSplitNode") {
      nodePropsForm = (
        <DistributedDataSplitNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "createTableNode") {
      nodePropsForm = (
        <CreateTableNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "zipFileNode") {
      nodePropsForm = (
        <ZipFileNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "unZipFileNode") {
      nodePropsForm = (
        <UnZipFileNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "procedureNode") {
      nodePropsForm = (
        <ProcedureNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataRecordTotalNode") {
      nodePropsForm = (
        <DataRecordTotalNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "monitorFileNode") {
      nodePropsForm = (
        <MonitorFileNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "threadPoolExecutorNode") {
      nodePropsForm = (
        <ThreadPoolExecutorNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "readBigTxtFileNode") {
      nodePropsForm = (
        <ReadBigTxtFileNode
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
    } else if (nodeType === "cosWriteNode") {
      nodePropsForm = (
        <CosWriteNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "cosDownloadNode") {
      nodePropsForm = (
        <CosDownloadNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "oneRowToMulRowsNode") {
      nodePropsForm = (
        <OneRowToMulRowsNode
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
    } else if (nodeType === "deleteTableDataNode") {
      nodePropsForm = (
        <DeleteTableDataNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "webServiceNode") {
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
    } else if (nodeType === "sgingleTableCopyNode") {
      nodePropsForm = (
        <SgingleTableCopyNode
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
    } else if (nodeType === "sgingleTableUpdateNode") {
      nodePropsForm = (
        <SgingleTableUpdateNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "platformConfigNode") {
      nodePropsForm = (
        <PlatformConfigNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "runKettleNode") {
      nodePropsForm = (
        <RunKettleNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataValueCompareNode") {
      nodePropsForm = (
        <DataValueCompareNode
          appId={this.appId}
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          close={this.closeModal}
          applicationId={this.applicationId}
        />
      );
    } else if (nodeType === "dataConnectorNode") {
      // ???????????????
      nodePropsForm = (
        <AppFlowNode
          key={this.state.drawerKey}
          appId={this.appId}
          appType={this.state.appType}
          refObj={this.refs.ProcessFrame} // ????????????iframe???refs
          nodeObj={this.state.currentNodeObj}
          eldId={this.state.currentEleId}
          processId={this.processId}
          applicationId={this.applicationId}
          opts={this.state.checkedApi} // ??????api?????????
          appName={this.state.appName} // ????????????
          linkerOpts={this.state.linkerOpts} // ???????????????
          close={this.handleCancel}
        />
      );
    } else if (nodeType === "dbfFileReadNode") {
      nodePropsForm = (
        <DBFFileReadNode
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
                "????????????"
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
                    placeholder="???????????????"
                    onSearch={this.handleSearch}
                  />
                  <Tabs>
                    <Tabs.TabPane tab="???????????????">
                      <div className="linker-list">
                        {linkerList.map((item) => (
                          <div
                            className="linker-item"
                            key={item.appId}
                            onClick={() => this.addLinker(item)}
                          >
                            <img src={LinkerImg} alt="???????????????" />
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
                          placeholder="??????"
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
              ??????
            </Button>{" "}
            <Button onClick={this.saveProcessVersion} icon="save">
              ????????????
            </Button>{" "}
            <Button onClick={this.runProcess} icon="play-circle">
              ??????
            </Button>{" "}
            <Button
              onClick={this.processConnectionTool.bind(this, "Flowchart")}
              icon="rollback"
            >
              ?????????
            </Button>{" "}
            <Button
              onClick={this.processConnectionTool.bind(this, "Straight")}
              icon="arrows-alt"
            >
              ??????
            </Button>{" "}
            <Button onClick={this.processSelectedAll} icon="border-outer">
              ??????
            </Button>{" "}
            <Dropdown overlay={undomenu}>
              <Button icon="reload">
                ??????
                <Icon type="down" />
              </Button>
            </Dropdown>{" "}
            <Dropdown overlay={transformmenu}>
              <Button icon="fullscreen-exit">
                ??????
                <Icon type="down" />
              </Button>
            </Dropdown>{" "}
            <Button icon="profile" onClick={this.editProcessProps}>
              ????????????
            </Button>{" "}
            <Button icon="file-text" onClick={this.showLog}>
              ????????????
            </Button>{" "}
            <Button icon="file" onClick={this.showProcessMonitor}>
              ????????????
            </Button>{" "}
          </div>
          <Layout>
            <Content>
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
                  changeState={this.changeState}
                  runProcess={this.runProcess}
                  unMask={this.unMask}
                  createLinker={this.createLinker}
                />
              </div>
            </Content>
          </Layout>
        </div>
      </Spin>
    );
  }
}

export default ProcessDesigner;
