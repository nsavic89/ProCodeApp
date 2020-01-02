import React, { useState, useContext } from 'react';
import Search from './coding/Search';
import Results from './coding/Results';
import { useTranslation } from 'react-i18next';
import { Tooltip, Icon, } from 'antd';
import { Loading } from './Loading';
import { UserDataContext } from '../contexts/UserDataContext';

// basically coding view
// includes coding form with classification scheme, search input
// provides results of coding and allows sending of feedback
// -> data collection from end-users

const styling = {
    codingForm: {
        marginTop: 35
    }
}

function Coding () {
    const { t } = useTranslation();
    const [state, setState] = useState({});
    const context = useContext(UserDataContext);
    
    // search component returns results (codes)
    const updateState = (results, status, scheme, titleLabel, values) => {
        // status === true -> coding started
        // renders spinner in results

        setState({
            ...state, 
            results: results,
            coding: status,
            scheme: scheme,
            titleLabel: titleLabel,
            text: values ? values.text : "",
            lng: values ? values.lng : ""
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
        </div>
    )
}
export default Coding;