import React from 'react';
import { Modal, Radio, Button } from 'antd';
import { useTranslation } from 'react-i18next';


const styling = {
    radio: {
        display: 'block',
        height: 45
    },
    flag: {
        height: 18
    }
}

// simple modal to change language
// ge - fr - it - en
function Language (props) {
    const { t, i18n } = useTranslation();

    return (
        <Modal
            visible={props.visible}
            onCancel={props.onCancel}
            title={ t('general.language') }
            footer={
                <div>
                    <Button onClick={props.onCancel}>
                        { t('general.close') }
                    </Button>
                </div>
            }
        >
            <Radio.Group
                defaultValue={i18n.language === 'en-US' ? 'en' : i18n.language}
                onChange={ e => i18n.changeLanguage(e.target.value) }
            >{
                ['ge', 'fr', 'it', 'en'].map(
                    item => (
                        <Radio value={item} key={item} style={styling.radio}>
                            <img 
                                style={styling.flag}
                                src={require(`../media/${item}.png`)} alt="" 
                            /> { t(`langs.${item}`) } 
                        </Radio>
                    )
                )
            }</Radio.Group>
        </Modal>
    )
}
export default Language;