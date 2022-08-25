import React from 'react';
import {Spin,Card,Icon,Comment, Avatar, Form, Button, List, Input} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import moment from 'moment';

const issuesUrl=URI.CORE_OPENAPI.issuesUrl;
const TextArea = Input.TextArea;

const CommentList = ({ comments }) => (
  <List
    dataSource={comments}
    header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
    itemLayout="horizontal"
    renderItem={props => <Comment {...props} />}
  />
);

const Editor = ({
  onChange, onSubmit, submitting, value,
}) => (
  <div>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button
        htmlType="submit"
        loading={submitting}
        onClick={onSubmit}
        type="primary"
      >
        Add Comment
      </Button>
    </Form.Item>
  </div>
);

class APIIssueComment extends React.Component{
  constructor(props){
    super(props);
    this.serviceId=this.props.serviceId;
    this.state={
      mask:false,
      data:[],
      comments: [],
      submitting: false,
      value: '',
    };
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
    this.setState({mask:true});
    let url=issuesUrl+"?id="+this.serviceId;
    AjaxUtils.get(url,(data)=>{
        this.setState({mask:false});
        if(data.state===false){
          AjaxUtils.showError(data.msg);
        }else{
          this.setState({data:data});
        }
    });
  }

  handleSubmit = () => {
      if (!this.state.value) {
        return;
      }

      this.setState({
        submitting: true,
      });

      setTimeout(() => {
        this.setState({
          submitting: false,
          value: '',
          comments: [
            {
              author: 'Han Solo',
              avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
              content: <p>{this.state.value}</p>,
              datetime: moment().fromNow(),
            },
            ...this.state.comments,
          ],
        });
      }, 1000);
    }

    handleChange = (e) => {
      this.setState({
        value: e.target.value,
      });
    }

  render() {
    const { comments, submitting, value } = this.state;
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <div>
          {comments.length > 0 && <CommentList comments={comments} />}
          <Comment
            avatar={(
              <Avatar
                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                alt="Han Solo"
              />
            )}
            content={(
              <Editor
                onChange={this.handleChange}
                onSubmit={this.handleSubmit}
                submitting={submitting}
                value={value}
              />
            )}
          />
        </div>
      </Spin>
    );
  }
}

export default APIIssueComment;
