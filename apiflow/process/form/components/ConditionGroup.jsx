import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Tag} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import ConditionList from './ConditionList';

//FS定制版本

class ConditionGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data:this.props.data==0?[{id:'default',relationship:'AND',title:'条件组(AND)',data:[{id:'1',fieldId:''}]}]:this.props.data,
    };
  }

  componentDidMount(){
  }

  getData=()=>{
    // console.log(this.state.data);
    return this.state.data;
  }

  delGroup=(index)=>{
    // console.log("index==="+index);
    let data=this.state.data;
    // console.log(data);
    data.splice(index, 1)
    this.setState({data});
  }

  addGroup=(relationship)=>{
    //新增加一行
    let newRow={id:AjaxUtils.guid(),relationship:relationship,data:[{id:AjaxUtils.guid()}],title:'条件组('+relationship+')'};
    let newData=this.state.data;
    // console.log(newData);
    newData.push(newRow);
    // console.log(newData);
    this.setState({data:newData});
  }

  render() {
    const { data } = this.state;
    return (
      <div>
        <Button  onClick={this.addGroup.bind(this,"AND")}  type="ghost"   icon='plus'  style={{marginBottom:'5px'}} >添加AND条件组</Button>{' '}
        <Button  onClick={this.addGroup.bind(this,"OR")}  type="ghost"   icon='plus'  style={{marginBottom:'5px'}} >添加OR条件组</Button>
        {
          data.map((item,index)=>{
            return <ConditionList  key={AjaxUtils.guid()} parentData={item} index={index} delGroup={this.delGroup} title={item.title} />;
          })
        }
      </div>
      );
  }
}

export default ConditionGroup;
