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
const LIST_URL=URI.ESB.CORE_ESB_MONITOR.realtimedataUrl;
const TabPane = Tabs.TabPane;

class ListRealtimeData extends React.Component {
  constructor(props) {
    super(props);
    this.transactionId=this.props.transactionId||'';
    this.url=LIST_URL+"?transactionId="+this.transactionId;
    this.state={
      data:{},
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
  loadData=()=>{
    AjaxUtils.get(this.url,(data)=>{
      if(data.state==false){
        AjaxUtils.showError(data.msg);
        this.setState({loading:false});
      }else{
        this.setState({data:data,loading:false});
      }
    });
  }


  render(){
    return (
      <div>
           <Tabs size="large">
              <TabPane  tab="当前节点流入数据" key="indoc"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.indoc))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
              <TabPane  tab="全部可用变量" key="variant"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.variantDoc))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
              <TabPane  tab="所有API执行数据" key="processResultDocs"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.processResultDocs))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
              <TabPane  tab="HTTP请求数据" key="requestDoc"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.requestDoc))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
              <TabPane  tab="最终输出结果" key="responseMap"  >
                <Input.TextArea value={AjaxUtils.formatJson(JSON.stringify(this.state.data.responseMap))} autosize={{ minRows: 8, maxRows: 26 }} />
              </TabPane>
            </Tabs>
      </div>
    );
  }
}

export default ListRealtimeData;
