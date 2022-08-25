import React from "react";
import { Form, Radio, Divider, Row, Col } from "antd";
import CodeMirror from "react-codemirror";
require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/sql/sql");

class Assert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: { inParams: "[]", inHeaders: "[]" },
            code: ""
        };
    }
    getData = () => {
        return {
            ...this.props.form.getFieldsValue(),
            assertCode: this.state.code
        }
    }
    updateCode = newCode => {
        let formData=this.state.formData;
        formData.assertCode=newCode; //断言代码
        this.setState({
            code: newCode
        })
    };
    inserDemo = () => {
        let codeMirror = this.refs.codeMirror.getCodeMirror();
        let code = `//使用HTTP状态码作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
var result=0;
var statusCode=engine.getStatusCode(nodeId); //获取当前节点的HTTP状态码
if(statusCode=="200"){
    result=1; //断言成立
}
return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode = code;
    };

    inserDemo2 = () => {
        let codeMirror = this.refs.codeMirror.getCodeMirror();
        let code = `//indoc为API返回的JSON结果数据
function assert(engine,nodeDoc,nodeId,indoc){
var result=0;
if(engine.getDataTotalCount(indoc)>0){
  result=1; //返回数据大于0时断言成立
}
return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode = code;
    };

    inserDemo3 = () => {
        let codeMirror = this.refs.codeMirror.getCodeMirror();
        let code = `//indoc为API返回的JSON结果数据
function assert(engine,nodeDoc,nodeId,indoc){
var result=0;
if(DocumentUtil.getString(indoc,"status")==="ok"){
  result=1; //返回结果符合要求断言成立
}
return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode = code;
    };
    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form>
                <Form.Item
                    label="断言失败时"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    help="当断言失败时是否终止流程执行,如果不终止则交由后继路由线判断"
                >
                    {getFieldDecorator("assertAction", { initialValue: "1" })(
                        <Radio.Group>
                            <Radio value="1">终止流程</Radio>
                            <Radio value="0">继续运行后继节点</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
                <Form.Item>
                    <Row>
                        <Col span={4} style={{ textAlign: "right" }}>
                            断言逻辑:
                        </Col>
                        <Col span={18}>
                            <div
                                style={{
                                    border: "1px #cccccc solid",
                                    minHeight: "280px",
                                    margin: "2px",
                                    borderRadius: "0px",
                                }}
                            >
                                <CodeMirror
                                    ref="codeMirror"
                                    value={this.state.formData.assertCode}
                                    onChange={this.updateCode}
                                    options={{ lineNumbers: true, mode: "javascript", autoMatchParens: true }}
                                />
                            </div>
                            <a style={{ cursor: "pointer" }} onClick={this.inserDemo}>
                                HTTP状态码断言
                            </a>{" "}
                            <Divider type="vertical" />{" "}
                            <a style={{ cursor: "pointer" }} onClick={this.inserDemo2}>
                                返回数据量断言
                            </a>{" "}
                            <Divider type="vertical" />{" "}
                            <a style={{ cursor: "pointer" }} onClick={this.inserDemo3}>
                                调用结果断言
                            </a>{" "}
                            <Divider type="vertical" />
                            返回1断言成立，返回0断言失败，返回2等待外部条件再次触发运行
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        );
    }
}

const AssertForm = Form.create()(Assert);

export default AssertForm;
