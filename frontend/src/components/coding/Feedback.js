import React from 'react';
import { Button, Icon, Alert, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import ButtonGroup from 'antd/lib/button/button-group';


const styling = {
    feedback: {
        marginTop: 25
    },
    feedbackText: {
        marginBottom: 5
    },
    alert: {
        marginTop: 15
    }
}

// user checks if the obtained result is correct
// sends feedback to server
function Feedback(props) {
    const { t } = useTranslation();

    if (!props.visible) {
        return <div />
    }

    let offset = 4;
    let span = 16;

    if (props.offset !== undefined) {
        offset = props.offset;
        span = props.span;
    }
    return (
        <Row style={styling.feedback}>
            <Col md={{ offset: offset, span: span }}>
                <div style={styling.feedbackText}>
                    { t('coding.feedback-text') }
                </div>
                <div>
                    <ButtonGroup>
                        <Button
                            type="primary"
                            size="small"
                            onClick={props.handleFeedbackYes}
                            disabled={props.disabled}
                        >
                            <Icon type="check" /> <span>
                                { t('messages.yes') }
                            </span>
                        </Button>
                        <Button
                            type="danger"
                            size="small"
                            onClick={props.handleFeedbackNo}
                            disabled={props.disabled}
                        >
                            <Icon type="exclamation" /> <span>
                                { t('messages.no') }
                            </span>
                        </Button>
                    </ButtonGroup>
                </div>
                {
                    props.disabled ?
                    <div /> :
                        <div style={styling.alert}>
                            <Alert
                                type="info"
                                showIcon
                                message={ t('coding.feedback-alert-info') }
                            />
                        </div>
                }
            </Col>
        </Row>
    )
}
export default Feedback;