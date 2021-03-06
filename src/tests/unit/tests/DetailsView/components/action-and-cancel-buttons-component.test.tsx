// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';

import {
    ActionAndCancelButtonsComponent,
    ActionAndCancelButtonsComponentProps,
} from '../../../../../DetailsView/components/action-and-cancel-buttons-component';

describe('ActionAndCancelButtonsComponent', () => {
    test('constructor', () => {
        expect(new ActionAndCancelButtonsComponent({} as ActionAndCancelButtonsComponentProps)).toBeDefined();
    });

    test.each(['sample href', null])('render with primary button href == %s', href => {
        const primaryButtonOnClickStub = () => {};
        const cancelButtonOnClickStub = () => {};
        const props: ActionAndCancelButtonsComponentProps = {
            isHidden: false,
            primaryButtonDisabled: false,
            primaryButtonText: 'Test',
            primaryButtonOnClick: primaryButtonOnClickStub,
            cancelButtonOnClick: cancelButtonOnClickStub,
            primaryButtonHref: href,
        };
        const wrapper = shallow(<ActionAndCancelButtonsComponent {...props} />);

        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
