import React, { useState, useEffect } from 'react';
import { Tag, Radio, Button, Modal, message, Alert, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { Loading } from '../Loading';
import SchemeTree from './SchemeTree';
import axios from 'axios';


// Coding results
// Includes sending a feedback to the server


const styling = {
    wrapper: {
        marginTop: 50
    },
    radio: {
        display: 'block',
        height: '40px',
        lineHeight: '40px',
        fontSize: 16
    },
    tag: {
        fontSize: 18
    },
    feedback: {
        marginTop: 25
    },
    feedbackText: {
        marginBottom: 15
    },
    submitBtn: {
        marginBottom: 50
    }
}

function Results(props) {
    const { t } = useTranslation();
    const [state, setState] = useState({});

    useEffect(() => {
        // on change of props -> we must reset state
        setState({
            visible: false,
            radioDisabled: false
        })
    }, [props])

    // when coding started -> spinner
    if (props.coding) {
        return (<div>{ Loading }</div>);
    }

    if (props.results) {
        if (props.results[0].code === "-") {
            return <div />
        }
    }

    // page just mounted
    // coding has not started and no results yet -> nothing
    if (!props.results) {
        return <div />;
    }

    // handles submit-button
    // if radio "none" -> show treeSelect
    // otherwise -> send result to server
    const handleSubmit = () => {
        if (!state.response) {
            message.warning( t('coding.results.no-response-msg') );
            return;
        }

        if (state.response !== "none") {

            let code = props.scheme.classification.find(
                    o => o.code === state.response
                ).id;

            let obj = {
                scheme: props.scheme.id,
                lng: props.lng,
                text: props.text,
                code: code
            }

            axios.post(
                `${process.env.REACT_APP_API_URL}/data/`,
                obj,
                { headers: {
                    Pragma: "no-cache",
                    Authorization: 'JWT ' + localStorage.getItem('token')
                }}
            ).then(
                () => {
                    // if modal open
                    // then hides it and makes radios disabled
                    setState({ 
                        ...state,
                        visible: false,
                        radioDisabled: true
                    });
                    message.success( t('coding.results.feedback-sent-msg') );
                }
            ).catch(
                () => message.error( t('messages.request-failed') )
            )
        } else {
            setState({ ...state, visible: true });
        }
        return;
    }

    // results are listed as radio buttons
    // when selected shows confirm button
    // once feedback sent -> disable radios
    return (
        <Row style={styling.wrapper}>
            <Col md={{ offset: 4, span: 18 }}>
                <Radio.Group 
                    onChange={ e => 
                        setState({...state, response: e.target.value}) 
                    }
                >
                    {/* codes/titles received from the server */}
                    {
                        props.results.map(
                            item => (
                                <Radio
                                    key={ item.code }
                                    style={ styling.radio }
                                    value={ item.code }
                                    disabled={ state.radioDisabled }
                                >
                                    <Tag color="#52c41a" style={styling.tag}>
                                        { item.code }
                                    </Tag> <span>
                                        { item.title }
                                    </span>
                                </Radio>
                            )
                        )
                    }

                    {/* final radio is always 'none result' */}
                    <Radio 
                        style={{
                            ...styling.radio,
                            color: "#f5222d"
                        }}
                        value="none"
                        disabled={ state.radioDisabled }
                    >
                        { t('coding.results.dont-agree') }
                    </Radio>
                </Radio.Group>

                {/* 
                    after a coding is done, end-user is invited
                    to send feedback on the accuracy of prediction

                    -> if none of the responses is correct, the end-
                    user is asked to select one code/title from the
                    full list corresponding to the selected scheme
                */}
                <div style={styling.feedback}>

                    <Alert
                        type="info"
                        message={ t('coding.results.feedback-text') }
                        showIcon
                        style={styling.feedbackText}
                    />

                    <Button
                        type="primary"
                        onClick={ handleSubmit }
                        disabled={ state.radioDisabled }
                        style={styling.submitBtn}
                    >
                        { t('coding.results.send-feedback-btn') }
                    </Button>

                    <Modal
                        title={ t('coding.results.feedback-modal-title') }
                        visible={state.visible}
                        onCancel={() => setState({...state, visible: false})}
                        onOk={handleSubmit}
                    >
                        <Alert
                            type="info"
                            message={ t('coding.results.feedback-info') }
                            showIcon
                        />
                        <br />
                        <SchemeTree
                            scheme={props.scheme}
                            titleLabel={props.titleLabel}
                            onChange={val => setState({...state, response: val })}
                        />
                    </Modal>
                </div>
            </Col>
        </Row>
    )
}
export default Results;