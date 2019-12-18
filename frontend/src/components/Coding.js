import React, { useState, useEffect } from 'react';
import Search from './coding/Search';
import Results from './coding/Results';
import { useTranslation } from 'react-i18next';
import { Tooltip, Icon, message } from 'antd';
import axios from 'axios';
import { Loading } from './Loading';

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

    // load classification schemes
    useEffect(() => {
        axios.get(
            `${process.env.REACT_APP_API_URL}/scheme/`
        ).then(
            res => {
                let schemes = res.data;
                for (let i in schemes) {
                    schemes[i].levels = JSON.parse(schemes[i].levels);
                }

                setState({
                    schemes: schemes,
                    loaded: true
                })
            }
        ).catch(
            () => message.error( t('messages.request-failed') )
        )
    }, [t])
    
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
                    state.loaded ? 
                        <Search 
                            schemes={state.schemes}
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