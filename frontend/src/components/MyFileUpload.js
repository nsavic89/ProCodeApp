import React, { useState, useContext } from 'react';
import { Modal, Form, Input, Select, Button, Icon, Upload, message, Row, Col, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Loading } from './Loading';
import { UserDataContext } from '../contexts/UserDataContext';


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
    },
    select: {
        width: "100%"
    }
}

// This component belongs to header
// used for file uploads
function MyFileUpload(props) {
    const { t } = useTranslation();
    const { getFieldDecorator } = props.form;
    const [state, setState] = useState({});

    const context = useContext(UserDataContext);

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
                                    visible: false,
                                    update: state.update + 1,
                                    loaded: false
                                })
                                context.refreshData();
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
        <UserDataContext.Consumer>
            {
                values => 
                <div>
                    <Row gutter={16} type="flex" justify="start"> 
                
                    <Col lg={{ span: 16 }} md={{ span: 12 }} xs={{ span: 0 }}>
                        {
                            values.loaded ? 
                                <Select
                                    style={styling.select}
                                    size="large"
                                    placeholder={ t('header.search-placeholder') }
                                    showSearch
                                    onChange={props.onChange}
                                >
                                    {
                                        values.files.map(
                                            item => (
                                                <Select.Option key={item.id} value={item.id}>
                                                    <Tooltip title={item.dscr}>
                                                        { item.name } (uploaded: {item.date}) { t(`langs.${item.lng}`) }
                                                    </Tooltip>
                                                </Select.Option>
                                            )
                                        )
                                    }
                                </Select> : <div>{ Loading }</div>
                        }
                    </Col>

                    <Col>                      
                        <Button
                            type="danger"
                            size="large"
                            style={ styling.uploadButton }
                            onClick={ () => setState({ ...state, visible: true }) }
                        >
                            <Icon type="upload" /> { t('file-upload.upload-file-btn') }
                        </Button>
                    </Col>
                </Row>

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
                                    {
                                        required: true,
                                        message: t('messages.field-obligatory') 
                                    }
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
            }
        </UserDataContext.Consumer>
    )
}
export default Form.create()( MyFileUpload );