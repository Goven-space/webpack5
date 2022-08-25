import React from 'react';
import ReactDOM from 'react-dom';
import jsplumb from 'jsplumb';
import { Table,Button,Card,Icon,Select,Tag,Checkbox,Radio,Tabs,Switch,Row,Col} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';

//字段名映射关系图

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.FIELDMAPPING_NODE.getFieldMaps;
const Option = Select.Option;
const ButtonGroup = Button.Group;

let jsPlumbIn;
const jsPlumbIn_common = {
    isSource: true,
    isTarget: true,
    connector: ['Straight',{lineWidth: 5,fill: '#1890FF',strokeStyle: '#1890FF'}],
    maxConnections: 1,              //一个端点拖拽多条连线
    endpoint: ['Dot', {radius: 5, fill: '#1890FF'}],
    endpointStyle: { fill: '#1890FF'},
    connectorStyle: {stroke: '#1890FF', strokeWidth: 2},//设置连线的颜色以及 粗度
    connectorOverlays : [['Arrow', { width: 12, length: 12, location: -4 }]],
    connectorHoverStyle : {lineWidth: 2,stroke: '#f50', strokeStyle: '#5f0', outlineWidth: 10, outlineColor: ''},//鼠标悬浮到连线的样式
    paintStyle: {strokeStyle: '#1890FF', stroke: '#1890FF', fill: 'pink', fillStyle: '#1890FF', radius: 6, lineWidth: 2},
}

class FieldMappingConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateFieldMapConfigs=this.props.updateFieldMapConfigs;
    this.getFieldMapConfigs=this.props.getFieldMapConfigs;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: [],
      targetColIds:[],
      sourceColIds:[],
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){
      jsPlumbIn = jsPlumb.getInstance() //关键函数 注册jsplumb实例
      this.loadData();
  }

  componentWillUnmount() {
    if (jsPlumbIn) {
        jsPlumbIn.clear() //清空
    }
   }

   intLineContainer = () =>{
       var that = this;
       jsPlumbIn.setContainer("lineContainer"); //容器, 所有的连接的元素必须在容器内.
       const leftTable = document.getElementById("leftTable");
       const rightTable = document.getElementById("rightTable");
       this.initPointId(leftTable,"source");
       this.initPointId(rightTable,"target");
       jsPlumbIn.bind('connection', function (conn) {//两个表进行关联时
          that.connection(conn);
       });
       jsPlumbIn.bind('connectionDetached', function (conn) {//断开连接时的触发事件
           that.connectionDetached(conn);
       });
      this.connectAllLine();
   }

   connectAllLine=()=>{
     let mapData=this.state.data; //所有配置的映射字段
     // console.log(mapData);
     mapData.forEach((item, i) => {
       if(item.colId!=='' && item.sourceColId!==''){
           jsPlumbIn.connect({
              source: "source$"+item.sourceColId,
              target: "target$"+item.colId,
              anchors: ["Right","Left"],
              overlays: [ ['Arrow', { width: 12, length: 12, location: -4 }] ],
              hoverPaintStyle : {lineWidth: 2,stroke: '#f50', strokeStyle: '#5f0', outlineWidth: 10}
          }, jsPlumbIn_common);
         }
      });
   }

   /**
    * 连线完成数据处理操作
    * @param conn
    */
   connection = (conn) => {
       //TODO: 连线完成需要执行的操作
       // console.log(conn);
       this.buildConnectionData(conn);
       this.repaintAll();
   }

   /**
    * 构建连线 source 和 target 的service数据操作接口
    * @param conn
    */
   buildConnectionData = (conn) => {
       //TODO:连线完成需要执行的操作,elementID 是jsPlumbIn的操作信息,用于删除连线时候的数据处理
       let sourceColId = conn.sourceId;
       let targetColId = conn.targetId;
       let spos=sourceColId.indexOf("$");
       sourceColId=sourceColId.substring(spos+1,sourceColId.length);
       spos=targetColId.indexOf("$");
       targetColId=targetColId.substring(spos+1,targetColId.length);
       let data=this.state.data;
       data.forEach((item, i) => {
         if(item.sourceColId===sourceColId){
           item.colId=targetColId;
         }
       });
       // console.log("链接=>sourceColId="+sourceColId+",targetColId="+targetColId);
       // console.log(data);
       this.updateFieldMapConfigs(data); //更新节点中的数据
   }
   /**
    * 删除连线 source 和 target 的service数据操作接口
    * @param conn
    */
   unBuildConnectionData = (conn) => {
     let sourceColId = conn.sourceId;
     let targetColId = conn.targetId;
     let spos=sourceColId.indexOf("$");
     sourceColId=sourceColId.substring(spos+1,sourceColId.length);
     spos=targetColId.indexOf("$");
     targetColId=targetColId.substring(spos+1,targetColId.length);
     let data=this.state.data;
     data.forEach((item, i) => {
       if(item.sourceColId===sourceColId){
         item.colId=''; //取消映射
       }
     });
     this.setState({data : data});
     this.updateFieldMapConfigs(data); //更新节点中的数据
     // console.log(data);
   }

   repaintAll=()=>{
    document.getElementById("lineContainer").scrollTop = 0;
   	jsPlumbIn.repaintEverything();
   }

   /**
    * 连线断开数据处理操作,如果是删除操作触发,删除操作接口调用完成后,调用该接口
    * 如果是拖拽导致连线断开,将直接调用该接口,该接口类似删除接口.
    * @param conn
    */
   connectionDetached = (conn) => {
       // console.log("触发 线断开数据处理操作");
       this.unBuildConnectionData(conn);
       this.repaintAll();
   }

   /**
   * 初始化 jsPlumbIn 端点操作,需要等待 <div id={"lineContainer"}> 内组件加载完成后执行
   type source或者target
   table 为字段数据所在表
   */
  initPointId(table,type){
     let dataSource=this.state.sourceColIds;
     let dataTarget=this.state.targetColIds;
      const trs = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
      for(let i = 0; i < trs.length; i ++){
          //let colId = trs[i].attributes["data-row-key"].nodeValue;
          var colId=(type === "source" ? dataSource[i].sourceColId : dataTarget[i].targetColId);
          let pointId=type +"$"+ colId;
          trs[i].setAttribute("id",pointId);
          //trs[i].setAttribute("record",type === "source" ? dataSource[i] : dataTarget[i]);
          //console.log("add===="+pointId);
          jsPlumbIn.addEndpoint(pointId, {anchors: [type === 'source' ? 'Right' : 'Left']}, jsPlumbIn_common);
      }
  }

  //通过ajax远程载入数据
  loadData=()=>{
    let sourceNodeIds=this.parentForm.getFieldValue("sourceNodeIds");
    let targetNodeIds=this.parentForm.getFieldValue("targetNodeIds");
    if(sourceNodeIds==='' || sourceNodeIds==undefined){return;}
    let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+this.pNodeId+"&sourceNodeIds="+sourceNodeIds+"&targetNodeIds="+targetNodeIds;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        let sourceData=Object.keys(data.sourceColIds);
        sourceData=sourceData.map(item=>{return {sourceColId:item,key:item,sourceColType:data.sourceColIds[item]}});
        let targetData=Object.keys(data.targetColIds);
        targetData=targetData.map(item=>{return {targetColId:item,key:item,targetColType:data.targetColIds[item]}});
        this.setState({targetColIds:targetData,sourceColIds:sourceData,loading:false});
        this.initCloumnsData();
      }
    });
  }

 //初始化数据链接
  initCloumnsData=()=>{
      let targetData=this.state.targetColIds; //格式{sourceColId:key,sourceColType}
      let sourceData=this.state.sourceColIds;//格式{targetColId,key,targetColType}
      //合并上级传进来的map配置
      let tableColumns=this.getFieldMapConfigs()||'[]';
      let data=JSON.parse(tableColumns); //使用已经存在配置
      // console.log(data);
      data.forEach((item, i) => {
        if(item.sourceColId!==''){
          //只不存在时才加入
          let hadSrcColIdFlag=false;
          let colId=item.sourceColId;
          sourceData.forEach((item,i)=>{
            if(item.sourceColId===colId){
              hadSrcColIdFlag=true;
              return;
            }
          });
          if(hadSrcColIdFlag==false){
            let newItem={sourceColId:colId,key:colId,sourceColType:item.sourceColType};
            sourceData.push(newItem);
          }
        }
        //只有不存在目标字段时才加入
        if(item.colId!==''){
          let targetColId=item.colId;
          let targetColType=item.colType;
          let hadDestColIdFlag=false;
          targetData.forEach((item,i)=>{
            if(item.targetColId===targetColId){
              hadDestColIdFlag=true;
              return;
            }
          });
          if(hadDestColIdFlag==false){
            let newItem={targetColId:targetColId,key:targetColId,targetColType:targetColType};
            targetData.push(newItem);
          }
        }
      });
      this.setState({data:data,targetColIds:targetData,sourceColIds:sourceData,loading:false});
      this.intLineContainer();
  }



  refresh=(e)=>{
    e.preventDefault();
    jsPlumbIn.reset();
    this.initCloumnsData();
  }

  render() {
    let sourceData=this.state.sourceColIds;
    let targetData=this.state.targetColIds;
    let columnsSource=[{
      title: '源表字段',
      dataIndex: 'sourceColId',
    },{
      title: '类型',
      dataIndex: 'sourceColType',
    }];
    let columnsTarget=[{
      title: '目标字段',
      dataIndex: 'targetColId',
    },{
      title: '类型',
      dataIndex: 'targetColType',
    },{
      title: '序号',
      dataIndex: 'index',
      width:'5%',
      render: (text, record, index) => {return index+1;}
    }];

    return (
      <div>
        <div style={{paddingBottom:5}} >
          <Button  type="primary" onClick={this.refresh} icon="reload"  >刷新关系</Button>
        </div>
        <div id="lineContainer" style={{position:'absolute',height:'500px',width:'1000px',overflow:'auto',border:'1px solid #fff'}} >
            <Row>
               <Col span={2} ></Col>
                <Col span={6} >
                    <Table  id="leftTable" size="small" rowKey={record => record.key} dataSource={sourceData}   columns={columnsSource} pagination={ false } bordered={false}/>
                </Col>
                <Col span={6}>
                </Col>
                <Col span={6}>
                    <Table  id="rightTable" size="small" rowKey={record => record.key} dataSource={targetData}   columns={columnsTarget} pagination={ false } bordered={false}/>
                </Col>
                <Col span={2} ></Col>
          </Row>
        </div>
      </div>
      );
  }
}

export default FieldMappingConfig;
