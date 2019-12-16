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
        marginTop: 50
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
                let schemes = res.data.results;
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
    const getResults = (results) => {
        setState({
            ...state, results: results
        })
    }

    return (
        <div>
            <h2>
                {t('coding.page-title')}
            </h2>
            
            <div className="help">
                <Tooltip title={ t('coding.help-text' )}>
                    <Icon type="question-circle"  /> { t('general.help' )}
                </Tooltip>
            </div>

            <div style={ styling.codingForm }>
                {
                    state.loaded ? 
                        <Search 
                            schemes={state.schemes}
                            getResults={getResults}
                        />
                        : <div>{ Loading }</div>
                }
            </div>

            <div>
                <Results 
                    results={state.results}
                />
            </div>
        </div>
    )
}
export default Coding;