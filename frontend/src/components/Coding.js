import React from 'react';
import Search from './coding/Search';
import Results from './coding/Results';
import { useTranslation } from 'react-i18next';
import { Tooltip, Icon } from 'antd';

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
                <Search />
            </div>

            <div>
                <Results />
            </div>
        </div>
    )
}
export default Coding;