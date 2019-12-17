import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Radio, message, Tooltip, Icon, Form } from 'antd';
import axios from 'axios';
import { Loading } from './Loading';
import SchemeTree from './coding/SchemeTree';



const styling = {
    help: {
        marginBottom: 50
    },
    select: {
        width: "100%"
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
    const [state, setState] = useState({});


    // load all schemes from server
    useEffect(() => {
        axios.get(
            `${process.env.REACT_APP_API_URL}/scheme/`
        ).then(
            res => setState({
                loaded: true,
                schemes: res.data.results
            })
        ).catch(
            () => message.error( t('messages.request-failed') )
        )
    }, [t])

    if (!state.loaded) {
        return (
            <div>{ Loading }</div>
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

            <Form>
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
                                state.schemes.map(
                                    item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            { item.name }
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
                                    state.schemes.find(
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
                    {getFieldDecorator('scheme2', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Select style={styling.select}>
                            {
                                state.schemes.map(
                                    item => (
                                        <Select.Option key={item.id} value={item.id}>
                                            { item.name }
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    )}
                </Form.Item>

            </Form>
        </div>)
}
export default Form.create()( Transcoding );