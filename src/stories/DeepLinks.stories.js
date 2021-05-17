/* eslint-disable react/prop-types */
import React from 'react';

import linkingConfig from '../libs/Navigation/linkingConfig';
import ROUTES from '../ROUTES';
import {addTrailingForwardSlash} from '../libs/Url';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
export default {
    title: 'Deep Links/iOS',
    argTypes: {
        prefix: {
            options: linkingConfig.prefixes.filter(host => !host.includes('localhost')),
            control: 'radio',
            defaultValue: 'expensify-cash://',
        },
    },
    decorators: [
        Story => (
            <section>
                <p>
                    Use this section to verify universal links are correctly deep linked inside
                    the E.cash app.
                </p>
                <p>
                    Pressing a link here should open the E.cash app and display the appropriate screen
                </p>
                <Story />
            </section>
        ),
    ],
};

export const Default = ({prefix}) => (
    <ul>
        {
                Object.keys(ROUTES)
                    .filter(key => typeof ROUTES[key] === 'string' && key !== 'HOME')
                    .filter(key => ROUTES[key].includes('/:') === false)
                    .map((key) => {
                        const href = `${addTrailingForwardSlash(prefix)}${ROUTES[key]}`;

                        return (
                            <li key={key}>
                                [
                                {key}
                                ]
                                {' '}
                                <a href={href}>{href}</a>
                            </li>
                        );
                    })
            }
    </ul>
);

export const IOU_Request = ({prefix, reportID}) => {
    const substituted = ROUTES.IOU_REQUEST.replace(':reportID', reportID);
    const href = `${addTrailingForwardSlash(prefix)}${substituted}`;

    return (
        <>
            <span>[IOU_REQUEST]</span>
            {' '}
            <a href={href}>{href}</a>
        </>
    );
};

IOU_Request.args = {
    reportID: '',
};

export const IOU_SplitBill = ({prefix, reportID}) => {
    const substituted = ROUTES.IOU_BILL.replace(':reportID', reportID);
    const href = `${addTrailingForwardSlash(prefix)}${substituted}`;

    return (
        <>
            <span>[IOU_BILL]</span>
            {' '}
            <a href={href}>{href}</a>
        </>
    );
};

IOU_SplitBill.args = {
    reportID: '',
};


export const SetPassword = ({prefix, accountID, validateCode}) => {
    const substituted = ROUTES.SET_PASSWORD_WITH_VALIDATE_CODE
        .replace(':accountID', accountID)
        .replace(':validateCode', validateCode);

    const href = `${addTrailingForwardSlash(prefix)}${substituted}`;

    return (
        <>
            <span>[SET_PASSWORD_WITH_VALIDATE_CODE]</span>
            {' '}
            <a href={href}>{href}</a>
        </>
    );
};

SetPassword.args = {
    accountID: '',
    validateCode: '',
};
