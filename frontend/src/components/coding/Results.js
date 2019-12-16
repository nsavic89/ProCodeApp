import React from 'react';
import { Tag, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { OmitProps } from 'antd/lib/transfer/renderListBody';



// Coding results
// Includes sending a feedback to the server


const styling = {
    radio: {
        display: 'block',
        height: '40px',
        lineHeight: '40px',
        fontSize: 16
    },
    tag: {
        fontSize: 18
    }
}

function Results(props) {
    const { t } = useTranslation();

    if (!props.results) {
        return <div />;
    }

    // results are listed as radio buttons
    // when selected shows confirm button
    // once feedback sent -> disable radios
    return (
        <div>
            <Radio.Group>
                {/* codes/titles received from the server */}
                {
                    props.results.map(
                        item => (
                            <Radio
                                key={ item.code }
                                style={ styling.radio }
                                value={ item.code }
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
                >
                    { t('coding.results.dont-agree') }
                </Radio>
            </Radio.Group>
        </div>
    )
}
export default Results;