import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getPathFromState, NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import {setCurrentURL} from '../actions/App';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

const propTypes = {
    /** Whether the current user is logged in with an authToken */
    authenticated: PropTypes.bool.isRequired,
};

class NavigationRoot extends Component {
    constructor(props) {
        super(props);

        this.parseAndStoreRoute = this.parseAndStoreRoute.bind(this);
    }

    /**
     * Intercept state changes and perform different logic
     * @param {NavigationState} state
     */
    parseAndStoreRoute(state) {
        if (!state) {
            return;
        }

        const path = getPathFromState(state, linkingConfig.config);
        setCurrentURL(path);

        if (Onyx.isCapturingMetrics) {
            this.printMetrics();
        }
    }

    printMetrics() {
        const data = Onyx.getMetrics().map(call => ({
            method: call.methodName,
            startTime: Math.round(call.startTime),
            endTime: Math.round(call.endTime),
            duration: Math.round(call.endTime - call.startTime),
        }));

        // eslint-disable-next-line no-console
        console.table(data);

        Onyx.resetMetrics();
    }

    render() {
        return (
            <NavigationContainer
                fallback={<FullScreenLoadingIndicator visible />}
                onStateChange={this.parseAndStoreRoute}
                ref={navigationRef}
                linking={linkingConfig}
                documentTitle={{
                    enabled: false,
                }}
            >
                <AppNavigator authenticated={this.props.authenticated} />
            </NavigationContainer>
        );
    }
}

NavigationRoot.propTypes = propTypes;
export default NavigationRoot;
