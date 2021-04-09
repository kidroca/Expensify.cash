import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dimensions} from 'react-native';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import variables from '../styles/variables';

const windowDimensionsPropTypes = {
    // Width of the window
    windowWidth: PropTypes.number.isRequired,

    // Height of the window
    windowHeight: PropTypes.number.isRequired,

    // Is the window width narrow, like on a mobile device?
    isSmallScreenWidth: PropTypes.bool.isRequired,
};

let elementCounter = 0;
let newDimensionCounter = 0;

export default function (WrappedComponent) {
    class withWindowDimensions extends Component {
        constructor(props) {
            super(props);

            this.onDimensionChange = this.onDimensionChange.bind(this);

            const initialDimensions = Dimensions.get('window');
            const isSmallScreenWidth = initialDimensions.width <= variables.mobileResponsiveWidthBreakpoint;
            this.state = {
                windowHeight: initialDimensions.height,
                windowWidth: initialDimensions.width,
                isSmallScreenWidth,
            };
        }

        componentDidMount() {
            console.info('[withWindowDimensions] mounted! element count: ', ++elementCounter);
            Dimensions.addEventListener('change', this.onDimensionChange);
        }

        componentWillUnmount() {
            console.info('[withWindowDimensions] unmounted! element counter: ', --elementCounter);
            Dimensions.removeEventListener('change', this.onDimensionChange);
        }

        /**
         * Stores the application window's width and height in a component state variable.
         * Called each time the application's window dimensions or screen dimensions change.
         * @link https://reactnative.dev/docs/dimensions
         * @param {Object} newDimensions Dimension object containing updated window and screen dimensions
         */
        onDimensionChange(newDimensions) {
            console.info('[withWindowDimensions] onDimensionChange total calls: ', ++newDimensionCounter);
            const {window} = newDimensions;
            const isSmallScreenWidth = window.width <= variables.mobileResponsiveWidthBreakpoint;
            this.setState({
                windowHeight: window.height,
                windowWidth: window.width,
                isSmallScreenWidth,
            });
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    windowHeight={this.state.windowHeight}
                    windowWidth={this.state.windowWidth}
                    isSmallScreenWidth={this.state.isSmallScreenWidth}
                />
            );
        }
    }

    withWindowDimensions.displayName = `withWindowDimensions(${getComponentDisplayName(WrappedComponent)})`;
    return withWindowDimensions;
}

export {
    windowDimensionsPropTypes,
};
