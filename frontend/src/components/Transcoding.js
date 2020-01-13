import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Radio, Tooltip, Icon, Form, Button, message, Tag, Col, Row, Alert } from 'antd';
import { Loading } from './Loading';
import SchemeTree from './coding/SchemeTree';
import { UserDataContext } from '../contexts/UserDataContext';
import axios from 'axios';


const styling = {
    help: {
        marginBottom: 50
    },
    select: {
        width: "100%"
    },
    results: {
        marginTop: 5,
        fontSize: 16
    }
}


const formItemLayout = {
    wrapperCol:
        {md: {span: 16}},
    labelCol:
        {md: {span: 4}}
}

// Transcoding of values bewteen two schemes
function Transcoding(props) {
    const { t, i18n } = useTranslation();
    const lng = i18n.language;
    const { getFieldDecorator, getFieldValue } = props.form;
    const context = useContext(UserDataContext);
    const [state, setState] = useState({});

    if (!context.loaded) {
        return (
            <div>{ Loading }</div>
        )
    }

    // on form submit -> handle transcoding
    const handleSubmit = e => {
        e.preventDefault();

        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {

                // show spinner while transcoding
                setState({
                    loading: true
                })

                axios.post(
                    `${process.env.REACT_APP_API_URL}/my-transcoding/`,
                    {...values, "my_file": ""},
                    { headers: {
                        Pragma: "no-cache",
                        Authorization: 'JWT ' + localStorage.getItem('token')
                    }}
                ).then(
                    res => {
                        if (res.status === 204) {
                            setState({
                                loading: false,
                                error: 204
                            })
                        } else {
                            setState({
                                loading: false,
                                results: res.data,
                                error: false
                            })
                        }
                    }
                ).catch(
                    () => message.error( t('messages.request-failed') )
                )
            }
        })
    }

    // errors
    let error = <div />;
    if (state.error === 204) {
        error = (
            <Alert
                type="error"
                message={ t('transcoding.error.no-content-204') }
                showIcon
            />
        )
    }

    return (
        <div>
            <h2>
                { t('transcoding.page-title') }
            </h2>

            <div className="help" style={styling.help}>
                <Tooltip title={ t('transcoding.help-text' )} placement="left">
                    <Icon type="question-circle"  /> { t('general.help' )}
                </Tooltip>
            </div>

            <Form onSubmit={handleSubmit}>
                <Form.Item
                    label={ t('general.language' )}
                    {...formItemLayout}
                    labelAlign="left"
                >
                    { getFieldDecorator("lng", {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ],
                        initialValue: lng === 'en-US' ? 'en' : lng
                    })(
                        <Radio.Group buttonStyle="solid">
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
                                <Radio.Button 
                                    key={item.value}
                                    value={item.value}
                                    style={styling.radio}
                                >
                                    { item.label }
                                </Radio.Button>
                            )
                        )}
                        </Radio.Group>
                    ) }
                </Form.Item>

                <Form.Item
                    label={t('transcoding.starting-scheme')}
                    {...formItemLayout}
                    labelAlign="left"
                >
                    {getFieldDecorator('scheme', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Select style={styling.select}>
                            {
                                context.schemes.map(
                                    item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            { item.name } { item.year ? `(${ item.year })` : '' }
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    )}
                </Form.Item>

                {
                    getFieldValue('scheme') ?
                    <Form.Item
                        label={t('transcoding.classification')}
                        {...formItemLayout}
                        labelAlign="left"
                    >
                        { getFieldDecorator('starting', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ]
                        })(
                            <SchemeTree 
                                scheme={
                                    context.schemes.find(
                                        o => o.id === getFieldValue('scheme')
                                    )}
                                titleLabel={
                                    getFieldValue('lng') === "en" ?
                                    "title"
                                    : `title_${getFieldValue('lng')}`
                                }
                            />
                        )}
                    </Form.Item>
                    : ""
                }

                <Form.Item
                    label={t('transcoding.end-scheme')}
                    {...formItemLayout}
                    labelAlign="left"
                >
                    {getFieldDecorator('end_scheme', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Select style={styling.select}>
                            {
                                context.schemes.map(
                                    item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            { item.name } { item.year ? `(${ item.year })` : '' }
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    )}
                </Form.Item>
                
                <Form.Item
                    wrapperCol={{md: {offset: 4}}}
                >
                    <Button 
                        type="primary"
                        onClick={handleSubmit}
                    >
                        <Icon type="play-circle" /> { t('transcoding.button-title') }
                    </Button>
                </Form.Item>
            </Form>
            
            {/* transcoding results */}
            <div>
                {
                    state.loading ? 
                    <div>
                        { Loading }
                    </div>
                    : <div>

                        {state.results ?
                            <Row>
                                {state.results.output.map(
                                    item => (
                                        <Col key={item.id} md={{ offset: 4 }} style={styling.results}>
                                            <Tag color="#52c41a">
                                                { item.code }
                                            </Tag> <span>
                                                { item[
                                                    ['fr', 'ge', 'it'].indexOf(getFieldValue('lng')) === -1 ? 
                                                        'title' : 'title_'+getFieldValue('lng')
                                                ] }
                                            </span>
                                        </Col>)
                                )}
                            </Row> 
                    : "" }
                    </div>
                }
            </div>

            {// Error -> transcoding failed
                state.error ?
                <Row>
                    <Col md={{ offset: 4, span: 16 }} >
                        { error }
                    </Col>
                </Row> 
                : ""
            }
        </div>)
}
export default Form.create()( Transcoding );