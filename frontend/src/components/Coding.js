import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CodingForm from './coding/CodingForm';
import { Tooltip, Icon } from 'antd';
import CodingResults from './coding/CodingResults';



// Coding view
const styling = {
    codingForm: {
        marginTop: 50
    }
}


function Coding() {
    const { t } = useTranslation();
    const [state, setState] = useState({});

    
    return (
        <div>
            <h2>
                {t('coding.page-title')}
            </h2>

            <div className="help">
                <Tooltip title={ t('coding.help-text' )} placement="left">
                    <Icon type="question-circle"  /> { t('general.help' )}
                </Tooltip>
            </div>

            <div style={styling.codingForm}>
                <CodingForm
                    getValues={values => setState({ values : values })}
                />
            </div>

            <div>
                <CodingResults />
            </div>
        </div>
    )
}


export default Coding;


/*
function Coding () {
    const { t } = useTranslation();
    const [state, setState] = useState({
        dictVisible: false
    });
    const context = useContext(UserDataContext);
    
    // search component returns results (codes)
    const updateState = (results, status, scheme, titleLabel, values) => {
        // status === true -> coding started
        // renders spinner in results
        let dictVisible = false;
        if (results) {
            if (results[0].code === "-") {
                dictVisible = true
            }
        }

        setState({
            ...state, 
            results: results,
            coding: status,
            scheme: scheme,
            titleLabel: titleLabel,
            text: values ? values.text : "",
            lng: values ? values.lng : "",
            dictVisible: dictVisible
        })
    }

    return (
        <div>
            <h2>
                {t('coding.page-title')}
            </h2>
            
            <div className="help">
                <Tooltip title={ t('coding.help-text' )} placement="left">
                    <Icon type="question-circle"  /> { t('general.help' )}
                </Tooltip>
            </div>

            <div style={ styling.codingForm }>
                {
                    context.loaded ? 
                        <Search 
                            updateParent={updateState}
                        />
                        : <div>{ Loading }</div>
                }
            </div>

            <div>
                <Results 
                    results={state.results}
                    coding={state.coding}
                    scheme={state.scheme}
                    titleLabel={state.titleLabel}
                    text={state.text}
                    lng={state.lng}
                />
            </div>

            <div>
                <Dictionary 
                    visible={state.dictVisible}
                />
            </div>
        </div>
    )
}*/