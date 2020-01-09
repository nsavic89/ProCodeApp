import React, { useContext } from 'react';
import { Row, Col, Tag } from 'antd';
import { UserDataContext } from '../../contexts/UserDataContext';


const styling = {
    result: {
        marginTop: 25
    },
    feedback: {
        marginTop: 25
    }
}


function CodingResults(props) {
    const context = useContext(UserDataContext);
    
    // if no results received
    if (!props.results || !props.scheme) {
        return <div />;
    } else {
        if (props.results[0] === "-") {
            return <div />;
        }
    }
    
    const code = props.results[0];
    const clsfList = context.schemes
                        .find(o => o.id === props.scheme)
                        .classification;
    return (
        <Row>
            <Col md={{ offset: 4, span: 16 }}>
                <div style={styling.result}>
                    <Tag color="#52c41a">
                        { code }
                    </Tag> <span>
                        { clsfList.find(o => o.code === code).title_fr }
                    </span>
                </div>
            </Col>
        </Row>
    )
}
export default CodingResults;