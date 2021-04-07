import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';

const propTypes = {
    /* Navigation api provided by react navigation */
    navigation: PropTypes.shape({
        /* Display the drawer programmatically */
        openDrawer: PropTypes.func.isRequired,
    }).isRequired,

    /* Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /* Route specific parameters used on this screen */
        params: PropTypes.shape({
            /* The ID of the report this screen should display */
            reportID: PropTypes.string,
        }).isRequired,
    }).isRequired,

    /* Data about the currently loaded report */
    loadedReport: PropTypes.shape({
        /* The ID of the currently loaded report */
        reportID: PropTypes.number,
    }),
};

const defaultProps = {
    loadedReport: {},
};

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
        };
    }

    componentDidMount() {
        this.prepareTransition();
    }

    componentDidUpdate(prevProps) {
        const reportChanged = this.props.route.params.reportID !== prevProps.route.params.reportID;

        if (reportChanged) {
            this.prepareTransition();
            return;
        }

        const reportLoaded = this.getReportID() === this.props.loadedReport.reportID;

        if (this.state.isLoading && reportLoaded) {
            this.completeTransition();
        }
    }

    /**
     * Get the currently viewed report ID as number
     *
     * @returns {Number}
     */
    getReportID() {
        const params = this.props.route.params;
        return Number.parseInt(params.reportID, 10);
    }

    /**
     * When reports change there's a brief time content is not ready to be displayed
     *
     * @returns {Boolean}
     */
    isReadyToDisplayReport() {
        return !this.state.isLoading && Boolean(this.getReportID());
    }

    /**
     * Configures a small loading transition until ONYX provides data for the current reportID
     */
    prepareTransition() {
        this.setState({isLoading: true});
    }

    /**
     * We're ready to render the new data
     */
    completeTransition() {
        // We can a small delay here to cover ongoing rendering with the loader
        this.setState({isLoading: false});
    }

    render() {
        return (
            <ScreenWrapper
                style={[
                    styles.appContent,
                    styles.flex1,
                    styles.flexColumn,
                ]}
            >
                <HeaderView
                    reportID={this.getReportID()}
                    onNavigationMenuButtonClicked={this.props.navigation.openDrawer}
                />

                <View style={[styles.dFlex, styles.flex1]}>
                    <ReportView
                        isReady={this.isReadyToDisplayReport()}
                        report={this.props.loadedReport}
                        reportID={this.getReportID()}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;

export default compose(
    withOnyx({
        loadedReport: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    }),
)(ReportScreen);
