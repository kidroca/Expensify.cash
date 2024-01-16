import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, PixelRatio, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import withLocalize from '@components/withLocalize';
import withWindowDimensions from '@components/withWindowDimensions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './attachmentCarouselPropTypes';
import CarouselActions from './CarouselActions';
import CarouselButtons from './CarouselButtons';
import CarouselItem from './CarouselItem';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import useCarouselArrows from './useCarouselArrows';

const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 66,
};

function AttachmentCarousel({report, reportActions, parentReportActions, source, onNavigate, setDownloadButtonVisibility, translate, windowWidth}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const scrollRef = useRef(null);

    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [activeSource, setActiveSource] = useState(source);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();

    const compareImage = useCallback((attachment) => attachment.source === source, [source]);

    useEffect(() => {
        const parentReportAction = parentReportActions[report.parentReportActionID];
        const attachmentsFromReport = extractAttachmentsFromReport(parentReportAction, reportActions);

        const initialPage = _.findIndex(attachmentsFromReport, compareImage);

        // Dismiss the modal when deleting an attachment during its display in preview.
        if (initialPage === -1 && _.find(attachments, compareImage)) {
            Navigation.dismissModal();
        } else {
            setPage(initialPage);
            setAttachments(attachmentsFromReport);

            // Update the download button visibility in the parent modal
            setDownloadButtonVisibility(initialPage !== -1);

            // Update the parent modal's state with the source and name from the mapped attachments
            if (!_.isUndefined(attachmentsFromReport[initialPage])) {
                onNavigate(attachmentsFromReport[initialPage]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportActions, parentReportActions, compareImage]);

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Object} item
     * @param {number} index
     */
    const updatePage = useCallback(
        ({viewableItems}) => {
            Keyboard.dismiss();

            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = _.first(viewableItems);
            if (!entry) {
                setActiveSource(null);
                return;
            }

            setPage(entry.index);
            setActiveSource(entry.item.source);

            onNavigate(entry.item);
        },
        [onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextIndex = page + deltaSlide;
            const nextItem = attachments[nextIndex];

            if (!nextItem || !scrollRef.current) {
                return;
            }

            scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, canUseTouchScreen, page],
    );

    /**
     * Defines how a single attachment should be rendered
     * @param {Object} item
     * @param {String} item.reportActionID
     * @param {Boolean} item.isAuthTokenRequired
     * @param {String} item.source
     * @param {Object} item.file
     * @param {String} item.file.name
     * @param {Boolean} item.hasBeenFlagged
     * @returns {JSX.Element}
     */
    const renderItem = useCallback(
        ({item, index}) => (
            <View style={containerDimensions}>
                {/* Prevents fetching too many attachments at once, by only rendering a few pages near the active page */}
                {Math.abs(page - index) <= 2 && (
                    <CarouselItem
                        item={item}
                        isFocused={activeSource === item.source}
                        isSingleItem={attachments.length === 1}
                        index={index}
                        activeIndex={page}
                        onPress={canUseTouchScreen ? () => setShouldShowArrows((current) => !current) : undefined}
                    />
                )}
            </View>
        ),
        [activeSource, attachments.length, canUseTouchScreen, containerDimensions, page, setShouldShowArrows],
    );

    return (
        <View
            key={windowWidth}
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent}) =>
                setContainerDimensions({
                    width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width),
                    height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height),
                })
            }
            onMouseEnter={() => !canUseTouchScreen && setShouldShowArrows(true)}
            onMouseLeave={() => !canUseTouchScreen && setShouldShowArrows(false)}
        >
            {page === -1 ? (
                <BlockingView
                    icon={Illustrations.ToddBehindCloud}
                    iconColor={theme.offline}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('notFound.notHere')}
                />
            ) : (
                <>
                    <CarouselButtons
                        shouldShowArrows={shouldShowArrows}
                        page={page}
                        attachments={attachments}
                        onBack={() => cycleThroughAttachments(-1)}
                        onForward={() => cycleThroughAttachments(1)}
                        autoHideArrow={autoHideArrows}
                        cancelAutoHideArrow={cancelAutoHideArrows}
                    />

                    {containerDimensions.width > 0 && (
                        <FlashList
                            estimatedItemSize={containerDimensions.width}
                            keyboardShouldPersistTaps="handled"
                            listKey="AttachmentCarousel"
                            horizontal
                            estimatedListSize={containerDimensions}
                            decelerationRate="fast"
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            // Scroll only one image at a time no matter how fast the user swipes
                            disableIntervalMomentum
                            pagingEnabled
                            snapToAlignment="start"
                            snapToInterval={containerDimensions.width}
                            // Enable scrolling by swiping on mobile (touch) devices only
                            // disable scroll for desktop/browsers because they add their scrollbars
                            // Enable scrolling FlatList only when PDF is not in a zoomed state
                            scrollEnabled={canUseTouchScreen}
                            ref={scrollRef}
                            initialScrollIndex={page}
                            data={attachments}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.source}
                            viewabilityConfig={viewabilityConfig}
                            onViewableItemsChanged={updatePage}
                        />
                    )}

                    <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
                </>
            )}
        </View>
    );
}

AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;
AttachmentCarousel.displayName = 'AttachmentCarousel';

export default compose(
    withOnyx({
        reportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            canEvict: false,
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '0'}`,
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
            canEvict: false,
        },
    }),
    withLocalize,
    withWindowDimensions,
)(AttachmentCarousel);
