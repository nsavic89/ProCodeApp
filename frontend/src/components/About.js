import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';


/* 
    general info
    contact details
*/

export default function About(props) {
    const { t } = useTranslation();

    return(
        <Modal
            visible={props.visible}
            onCancel={props.onClose}
            title={t('about')}
            footer={false}
        >
            <p>{t('about-modal.text')}</p>
            <br/>
            <h3>{t('about-modal.contact-header')}</h3>

            <p>{t('about-modal.contact-text')}</p>
            <div><strong>Nenad Savic</strong></div>
            <div>
                <a href="mailto:nenad.savic@unisante.ch">
                    nenad.savic@unisante.ch
                </a>
            </div>
            <div>Unisanté</div>
            <div>Centre universitaire de médecine général et santé publique</div>
            <img 
                src={require('../media/logoUnisante.png')} 
                alt="" width={250}
                style={{ marginTop: 25 }}
            />
        </Modal>
    )
}