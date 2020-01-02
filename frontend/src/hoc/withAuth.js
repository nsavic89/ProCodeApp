import React from 'react';
import axios from 'axios';

// checks if logged in
// if not -> login page
function withAuth(WrappedComponent) {
    return class extends React.Component {

        constructor(props) {
            super(props);
            this.state = {isAuth: false};
            this.handleRefreshToken = this.handleRefreshToken.bind(this);
        }

        handleRefreshToken() {
            let token = localStorage.getItem('token');

            axios.post(
                `${process.env.REACT_APP_API_URL}/api-token-refresh/`,
                { token: token }
            ).then(
                res => {
                    if (res.status === 200) {
                        localStorage.setItem('token', res.data.token);
                    }
                }
            ).catch(
                () => {
                    this.setState({ isAuth: false });
                    localStorage.clear();
                    this.props.history.push('/login');
                }
            )
        }

        componentDidMount() {
            let token = localStorage.getItem('token');
            
            // verify token
            if (token) {
                axios.post(
                    `${process.env.REACT_APP_API_URL}/api-token-verify/`,
                    { token: token } 
                ).then(
                    res => {
                        if (res.status === 200) {
                            this.setState({
                                isAuth: true
                            })
                        } else {
                            this.props.history.push('/login');
                        }
                    }
                ).catch(
                    e => {
                        console.log(e);
                        this.props.history.push('/login');
                    }
                )
            } else {
                this.props.history.push('/login');
            }

            setInterval(this.handleRefreshToken, 60000);
        }

        render() {

            return (
                <WrappedComponent 
                    {...this.props}
                    headers={ this.state.headers }
                    isAuth={this.state.isAuth}
                />
            )
        }
    }
}
export default withAuth;