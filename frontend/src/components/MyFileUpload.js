import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Icon, Upload, message } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const formItemLayout = {
    labelCol: {
        md: { span: 6 }
    }, 
    wrapperCol: {
        md: { span: 16 }
    }
}

const styling = {
    uploadButton: {
        borderRadius: 2
    }
}

// This component belongs to header
// used for file uploads
function MyFileUpload(props) {
    const { t } = useTranslation();
    const { getFieldDecorator } = props.form;
    const [state, setState] = useState({});




    // save new file to the server
    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {           
                // first create file in db
                axios.post(
                    `${process.env.REACT_APP_API_URL}/my-file/`,
                    values
                ).then(
                    res => {
                        // now upload excel file
                        let formData = new FormData();
                        formData.append("my_file", res.data.id);
                        formData.append("excel", values.excel.file, "excel");

                        axios.post(
                            `${process.env.REACT_APP_API_URL}/my-file-upload/`,
                            formData,
                            { headers: {'content-type': 'multipart/form-data'}}
                        ).then(
                            () => {
                                message.success(t('messages.request-success'));
                                setState({
                                    ...state,
                                    visible: false
                                })
                            }
                        ).catch(
                            () => message.error( t('messages.request-failed') )
                        )
                    }
                ).catch(
                    () => message.error( t('messages.request-failed') )
                )
            }
          });
    }




    return(
        <div>
            {/* upload button in header */}
            <Button
                type="danger"
                size="large"
                style={ styling.uploadButton }
                onClick={ () => setState({ ...state, visible: true }) }
            >
                <Icon type="upload" /> { t('file-upload.upload-file-btn') }
            </Button>

            {/* create new file form */}
            <Modal
                title={ t('file-upload.title') }
                visible={state.visible}
                onCancel={() => setState({ ...state, visible: false })}
                onOk={handleSubmit}
                okText={ t('general.submit') }
                cancelText={ t('general.cancel') }
            >
                <Form onSubmit={handleSubmit}>
                    <Form.Item
                        label={ t('file-upload.name') }
                        { ...formItemLayout }
                    >
                        { getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ]
                        }) (
                            <Input />
                        )}
                    </Form.Item>
                    <Form.Item
                        label={ t('file-upload.lng') }
                        { ...formItemLayout }
                    >
                        { getFieldDecorator('lng', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ]
                        }) (
                            <Select>
                                {[
                                    {
                                        label: t('langs.en'),
                                        value: 'en'
                                    }, {
                                        label: t('langs.ge'),
                                        value: 'ge'
                                    }, {
                                        label: t('langs.fr'),
                                        value: 'fr'
                                    }, {
                                        label: t('langs.it'),
                                        value: 'it'
                                    }
                                ].map(
                                    item => (
                                        <Select.Option key={item.value} value={item.value}>
                                            { item.label }
                                        </Select.Option>
                                    )
                                )}
                            </Select>
                        )}
                    </Form.Item>

                    <Form.Item
                        label={ t('file-upload.dscr') }
                        { ...formItemLayout }
                    >
                        { getFieldDecorator('dscr', {}) 
                        (
                            <Input.TextArea />
                        )}
                    </Form.Item>

                    <Form.Item
                        label={ t('file-upload.file') }
                        { ...formItemLayout }
                    >
                        { getFieldDecorator('excel', {
                            rules: [
                                
                            ]
                        }) (
                            <Upload beforeUpload={() => false}>
                                <Button>
                                    { t('file-upload.upload-file-btn') }
                                </Button>
                            </Upload>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
export default Form.create()( MyFileUpload );