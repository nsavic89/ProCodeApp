import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import {
    Form,
    Input,
    Select,
    Radio,
    Alert,
    Button,
    Icon,
    Col
} from 'antd';

// css styling
const styling = {
    select: {
        width: "100%",
        fontSize: 16
    },
    input: {
        fontSize: 16
    },
    radio: {
        minWidth: 75
    },
    errorNoLang: {
    },
    schemeDtlsDiv: {
        paddingTop: 5,
        marginBottom: 15,
        color: "#bfbfbf"
    }
}

const formItemLayout = {
    wrapperCol:
        {md: {span: 16}},
    labelCol:
        {md: {span: 4}}
}

// Coding of occupations using CNB
// select classification scheme
// enter raw data and run predictions
// will call my-coding url on api rest
function CodingForm(props) {
    const context = useContext(UserDataContext);
    const { t, i18n } = useTranslation();
    const { getFieldDecorator } = props.form;
    const [ state, setState ] = useState({});

    const lng = i18n.language;

    // Submit entered data and get codes
    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                props.getValues(values);
            };
        });
    };

    // if not schemes loaded
    if (!context.loaded) {
        return (
            <div>
                { Loading }
            </div>
        )
    }

    return(
        <div>
            <Form
                onSubmit={handleSubmit}
                style={styling.form}
            >   

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
                    label={ t('coding.search.scheme' )}
                    {...formItemLayout}
                    labelAlign="left"
                    style={{ marginBottom: 0 }}
                >
                    { getFieldDecorator('scheme', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Select 
                            placeholder={ t('coding.search.scheme-placeholder') }
                            style={ styling.select }
                            onChange={val => setState({
                                ...state, 
                                scheme: context.schemes.find(o => o.id === val) 
                            })}
                        >
                            { context.schemes.map(
                                item => (
                                    <Select.Option value={item.id} key={item.id}>
                                        { item.name }
                                    </Select.Option>)
                            ) }
                        </Select>
                    )}
                </Form.Item>

                {
                    state.scheme ?
                    <Col md={{ offset: 4 }} style={styling.schemeDtlsDiv}>
                        { state.scheme.dscr } ({ state.scheme.year })
                    </Col>: <div style={{ marginTop: 20 }}></div>
                }

                <Form.Item
                    label={ t('coding.search.level') }
                    {...formItemLayout}
                    labelAlign="left"
                >
                    { getFieldDecorator('level', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ],
                    })(
                        state.scheme ? 
                        <Radio.Group  buttonStyle="solid">
                            { JSON.parse(state.scheme.levels).map(
                                (item, inx) => 
                                    <Radio.Button value={item} key={inx} style={styling.radio}>
                                        { item }
                                    </Radio.Button>
                            ) }
                        </Radio.Group>
                        : <Alert
                            type="info"
                            message={ t('coding.search.alert-select-scheme') }
                        />
                    ) }
                </Form.Item>

                <Form.Item
                    label={ t('coding.search.text' )}
                    {...formItemLayout}
                    labelAlign="left"
                >
                    { getFieldDecorator("text", {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ]
                    })(
                        <Input.Search
                            placeholder={t('coding.search.input-placeholder')} 
                            enterButton
                            onSearch={(val, e) => handleSubmit(e)}
                        />
                    ) }
                </Form.Item>

                <Form.Item
                        wrapperCol={{md: {offset: 4}}}
                    >
                        <Button 
                            type="primary"
                            onClick={handleSubmit}
                        >
                            <Icon type="play-circle" /> { t('coding.button-title') }
                        </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
export default Form.create()( CodingForm );