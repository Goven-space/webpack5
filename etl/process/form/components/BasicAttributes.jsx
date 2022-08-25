import React from "react";
import { Form, Radio } from "antd";

class BasicAttributes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form>
                <Form.Item
                    label="输出参数加入变量"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    help="配置的API输出参数加入到全局变量中"
                >
                    {getFieldDecorator("addToGoalVaraint", {
                        rules: [{ required: false }],
                        initialValue: "true",
                    })(
                        <Radio.Group>
                            <Radio value="true">是</Radio>
                            <Radio value="false">否</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
                <Form.Item
                    label="调试输出API结果"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    help="在调试信息中输出API返回的结果"
                >
                    {getFieldDecorator("outResponseBody", {
                        rules: [{ required: false }],
                        initialValue: "true",
                    })(
                        <Radio.Group>
                            <Radio value="true">是</Radio>
                            <Radio value="false">否</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
                <Form.Item
                    label="保存API输入及输出参数"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    help="存储API的输入和输出结果在流程监控中可以查看传输的数据"
                >
                    {getFieldDecorator("saveApiParamsFlag", {
                        rules: [{ required: false }],
                        initialValue: "false",
                    })(
                        <Radio.Group>
                            <Radio value="true">是</Radio>
                            <Radio value="false">否</Radio>
                        </Radio.Group>
                    )}
                </Form.Item>
            </Form>
        );
    }
}

const BasicAttributesForm = Form.create()(BasicAttributes);

export default BasicAttributesForm;
