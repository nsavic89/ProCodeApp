import React from 'react';
import { Layout, Icon } from 'antd';
import MySider from '../components/MySider';
import MyHeader from '../components/MyHeader';
import { Switch, Route } from 'react-router-dom';
import Coding from '../components/Coding';

// Main view for all components for end-user
// layout with header and sider
function Main() {

    const styling = {
        header: {
            padding: "5px 25px",
            height: 75,
            background: "white"
        },
        layoutContent: {
            padding: "25px 25px 25px"
        },
        content: {
            background: "white",
            minHeight: 700,
            padding: 24
        },
        footer: {
            textAlign: "center"
        }
    }
    return(
        <Layout>
            
            {/* Sider defined in my sider */}
            <MySider />

            <Layout>
                {/* header */}
                <Layout.Header style={styling.header}>
                    <MyHeader />
                </Layout.Header>


                <Layout
                    style={styling.layoutContent}
                >
                    <Layout.Content
                        style={styling.content}
                    >   
                        {/* routes */}
                        <Switch>
                            <Route path="/" exact component={ Coding } />
                        </Switch>
                    </Layout.Content>
                </Layout>

                <Layout.Footer style={styling.footer}>
                    <div>
                        Developed and maintained by: <br/>
                        <strong>Nenad Savic</strong>
                    </div>
                    <div><br/>
                        <Icon type="mail" /> <a href="mailto: nenad@nedisa.com">nenad@nedisa.com</a>
                    </div>
                    <div>
                        <Icon type="phone" /> +41 78 860 57 80
                    </div>
                </Layout.Footer>
            </Layout>
        </Layout>
    )
}
export default Main;