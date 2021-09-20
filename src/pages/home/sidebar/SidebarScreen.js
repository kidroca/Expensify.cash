import React, {Component} from 'react';
import {View, Text, Button, Modal} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';

import _ from 'underscore';
import styles from '../../../styles/styles';
import SidebarLinks from './SidebarLinks';
import PopoverMenu from '../../../components/PopoverMenu';
import FAB from '../../../components/FAB';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Timing from '../../../libs/actions/Timing';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import {
    ChatBubble,
    Users,
    MoneyCircle,
    Receipt,
    NewWorkspace,
} from '../../../components/Icon/Expensicons';
import Permissions from '../../../libs/Permissions';
import ONYXKEYS from '../../../ONYXKEYS';
import {create} from '../../../libs/actions/Policy';
import Performance from '../../../libs/Performance';
import NameValuePair from '../../../libs/actions/NameValuePair';
import withDrawerState from '../../../components/withDrawerState';

const propTypes = {
    /* Onyx Props */

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** Flag for new users used to open the Global Create menu on first load */
    isFirstTimeNewExpensifyUser: PropTypes.bool.isRequired,

    /** The list of this user's policies */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The type of the policy */
        type: PropTypes.string,

        /** The user's role in the policy */
        role: PropTypes.string,
    })),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    policies: {},
};

class SidebarScreen extends Component {
    constructor(props) {
        super(props);

        this.onCreateMenuItemSelected = this.onCreateMenuItemSelected.bind(this);
        this.toggleCreateMenu = this.toggleCreateMenu.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);

        this.state = {
            isCreateMenuActive: true,
        };
    }

    componentDidMount() {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }

    /**
     * Method called when a Create Menu item is selected.
     */
    onCreateMenuItemSelected() {
        this.toggleCreateMenu();
    }

    /**
     * Method called when avatar is clicked
     */
    navigateToSettings() {
        Navigation.navigate(ROUTES.SETTINGS);
    }

    /**
     * Method called when we click the floating action button
     * will trigger the animation
     * Method called either when:
     * Pressing the floating action button to open the CreateMenu modal
     * Selecting an item on CreateMenu or closing it by clicking outside of the modal component
     */
    toggleCreateMenu() {
        this.setState(state => ({
            isCreateMenuActive: !state.isCreateMenuActive,
        }));
    }

    /**
     * Method called when a pinned chat is selected.
     */
    startTimer() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
        Performance.markStart(CONST.TIMING.SWITCH_REPORT);
    }

    render() {
        return (
            <ScreenWrapper
                includePaddingBottom={false}
                style={[styles.sidebar]}
            >
                {({insets}) => (
                    <>
                        <View style={[styles.flex1]}>
                            <SidebarLinks
                                onLinkClick={this.startTimer}
                                insets={insets}
                                onAvatarClick={this.navigateToSettings}
                                isSmallScreenWidth={this.props.isSmallScreenWidth}
                            />
                            <FAB
                                accessibilityLabel={this.props.translate('sidebarScreen.fabNewChat')}
                                accessibilityRole="button"
                                isActive={this.state.isCreateMenuActive}
                                onPress={this.toggleCreateMenu}
                            />
                        </View>
                        <Modal visible={this.state.isCreateMenuActive}>
                            <View style={{
                                flex: 1,
                                backgroundColor: 'white',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            >
                                <Text style={{color: 'red'}}>I am the modal content!</Text>
                                <Button onPress={this.toggleCreateMenu} title="close" />
                            </View>
                        </Modal>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

SidebarScreen.propTypes = propTypes;
SidebarScreen.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isFirstTimeNewExpensifyUser: {
            key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(SidebarScreen);
