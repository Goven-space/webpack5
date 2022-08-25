import React from 'react';
import {Spin,Card,Icon,Comment, Avatar, Form, Button, List, Input,Rate,Checkbox,Popover,Slider,Row,Col} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import moment from 'moment';

const listCommentsUrl=URI.CORE_APIPORTAL_APICONFIG.listComments;
const addCommentUrl=URI.CORE_APIPORTAL_APICONFIG.addComment;
const deleteCommentUrl=URI.CORE_APIPORTAL_APICONFIG.deleteComment;
const TextArea = Input.TextArea;



const Editor = ({onChange, onSubmit, submitting, value,onCheckBoxChange,checkValue}) => (
  <div>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
      <Checkbox onChange={onCheckBoxChange} checked={checkValue} >提醒发布者</Checkbox>
    </Form.Item>
    <Form.Item>
      <Button
        htmlType="submit"
        loading={submitting}
        onClick={onSubmit}
        type="primary"
      >
        提交评价
      </Button>
    </Form.Item>
  </div>
);


class APIComment extends React.Component{
  constructor(props){
    super(props);
    this.serviceId=this.props.serviceId;
    this.number=70;
    this.state={
      mask:false,
      data:[],
      comments: [],
      submitting: false,
      value: '',
      sendMsg:true,
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    this.setState({mask:true});
    let url=listCommentsUrl+"?id="+this.serviceId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({comments:data});
        }
    });
  }

  handleSubmit = () => {
    this.setState({mask:true});
    AjaxUtils.post(addCommentUrl,{id:this.serviceId,number:this.number,comment:this.state.value,sendMsg:this.state.sendMsg},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
            this.setState({value:''});
            AjaxUtils.showInfo(data.msg);
            this.loadData();
        }
    });
  }

  handleChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  }

  onCheckBoxChange=(e)=>{
    this.setState({
      sendMsg: e.target.checked,
    });
  }

  deleteComment=(commentId)=>{
    this.setState({mask:true});
    AjaxUtils.post(deleteCommentUrl,{commentId:commentId,id:this.serviceId},(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
            AjaxUtils.showInfo(data.msg);
            this.loadData();
        }
    });
  }

 onAfterChange=(value)=>{
    this.number=value;
  }

  render() {
    const { comments, submitting, value,sendMsg } = this.state;
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <div>
          {comments.length > 0 &&
            <List
              dataSource={comments}
              split={true}
              style={{padding:'0',margin:'0'}}
              header={`共 ${comments.length} 个评价`}
              itemLayout="horizontal"
              renderItem={props => <Comment
                author={props.author}
                content={props.content}
                datetime={<div>分数:{props.score} {props.datetime} <Icon type='delete' title='删除' style={{cursor:'pointer'}} onClick={AjaxUtils.showConfirm.bind(this,"删除确认","注意:确认要删除本评价记录吗?只有本人可以删除本记录!",this.deleteComment.bind(this,props.id))} /></div>}
                avatar={props.avatar}
                 />}
            />
          }
          <Row>
            <Col span={1} offset={1} style={{padding:'10px 0 0 0'}}>分数:</Col>
            <Col span={16}><Slider defaultValue={this.number}  onAfterChange={this.onAfterChange}  /></Col>
          </Row>
          <Comment
            avatar={(
              <Avatar
                src={URI.userAvatarUrl}
                alt="User"
              />
            )}
            content={(
              <Editor
                onChange={this.handleChange}
                onSubmit={this.handleSubmit}
                submitting={submitting}
                value={value}
                onCheckBoxChange={this.onCheckBoxChange}
                checkValue={sendMsg}
              />
            )}
          />
        </div>
      </Spin>
    );
  }
}

export default APIComment;
