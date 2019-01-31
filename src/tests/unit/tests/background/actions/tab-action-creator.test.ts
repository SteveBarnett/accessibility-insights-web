// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as _ from 'lodash';
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { IPageVisibilityChangeTabPayLoad, ISwitchToTargetTabPayLoad } from '../../../../../background/actions/action-payloads';
import { TabActionCreator } from '../../../../../background/actions/tab-action-creator';
import { TabActions } from '../../../../../background/actions/tab-actions';
import { ChromeAdapter, BrowserAdapter } from '../../../../../background/browser-adapter';
import { TelemetryEventHandler } from '../../../../../background/telemetry/telemetry-event-handler';
import { Action } from '../../../../../common/flux/action';
import { ITab } from '../../../../../common/itab';
import { Messages } from '../../../../../common/messages';
import { SWITCH_BACK_TO_TARGET, TelemetryEventSource } from '../../../../../common/telemetry-events';

describe('TestActionCreatorTest', () => {
    let tabActionsMock: IMock<TabActions>;
    let browserAdapterMock: IMock<BrowserAdapter>;
    let telemetryEventHandlerMock: IMock<TelemetryEventHandler>;
    let registerTypeToPayloadCallbackMock: IMock<IRegisterTypeToPayloadCallback>;
    let testObject: TabActionCreator;
    const tabId: number = -1;
    const iTabPayload: ITab = {
        id: -1,
        url: 'url',
        title: 'title',
    };

    beforeEach(() => {
        tabActionsMock = Mock.ofType(TabActions, MockBehavior.Strict);
        browserAdapterMock = Mock.ofType(ChromeAdapter, MockBehavior.Strict);
        telemetryEventHandlerMock = Mock.ofType(TelemetryEventHandler, MockBehavior.Strict);
        registerTypeToPayloadCallbackMock = Mock.ofInstance((type, callback) => {});

        testObject = new TabActionCreator(
            registerTypeToPayloadCallbackMock.object,
            browserAdapterMock.object,
            telemetryEventHandlerMock.object,
            tabActionsMock.object,
        );
    });

    test('on Tab.Update', () => {
        const actionMock = createActionMock(iTabPayload);
        setupTabActionsMock('tabUpdate', actionMock);
        setupRegisterTypeToPayloadCallbackMock(Messages.Tab.Update, iTabPayload, tabId);

        testObject.registerCallbacks();
        actionMock.verifyAll();
    });

    test('on Tab.GetCurrent', () => {
        const actionMock = createActionMock(null);
        setupTabActionsMock('getCurrentState', actionMock);
        setupRegisterTypeToPayloadCallbackMock(Messages.Tab.GetCurrent, null, tabId);

        testObject.registerCallbacks();
        actionMock.verifyAll();
    });

    test('on Tab.Remove', () => {
        const actionMock = createActionMock(null);
        setupTabActionsMock('tabRemove', actionMock);
        setupRegisterTypeToPayloadCallbackMock(Messages.Tab.Remove, null, tabId);

        testObject.registerCallbacks();
        actionMock.verifyAll();
    });

    test('on Tab.Change', () => {
        const actionMock = createActionMock(iTabPayload);
        setupTabActionsMock('tabChange', actionMock);
        setupRegisterTypeToPayloadCallbackMock(Messages.Tab.Change, iTabPayload, tabId);

        testObject.registerCallbacks();
        actionMock.verifyAll();
    });

    test('on Tab.Switch', () => {
        browserAdapterMock.setup(ba => ba.switchToTab(tabId)).verifiable(Times.once());

        const payload: ISwitchToTargetTabPayLoad = {
            telemetry: {
                triggeredBy: 'test',
                source: TelemetryEventSource.AdHocTools,
            },
        };

        telemetryEventHandlerMock.setup(tp => tp.publishTelemetry(SWITCH_BACK_TO_TARGET, payload, tabId)).verifiable(Times.once());

        setupRegisterTypeToPayloadCallbackMock(Messages.Tab.Switch, payload, tabId);

        testObject.registerCallbacks();

        telemetryEventHandlerMock.verifyAll();
        browserAdapterMock.verifyAll();
    });

    test('on Tab.VisibilityChange', () => {
        const payload: IPageVisibilityChangeTabPayLoad = {
            hidden: true,
        };

        const actionMock = createActionMock(payload.hidden);
        setupTabActionsMock('tabVisibilityChange', actionMock);
        setupRegisterTypeToPayloadCallbackMock(Messages.Tab.VisibilityChange, payload, tabId);

        testObject.registerCallbacks();
        actionMock.verifyAll();
    });

    function createActionMock<T>(actionPayload: T): IMock<Action<T>> {
        const actionMock = Mock.ofType<Action<T>>(Action);
        actionMock.setup(action => action.invoke(actionPayload)).verifiable(Times.once());

        return actionMock;
    }

    function setupTabActionsMock(actionName: keyof TabActions, actionMock: IMock<Action<any>>) {
        tabActionsMock.setup(actions => actions[actionName]).returns(() => actionMock.object);
    }

    function setupRegisterTypeToPayloadCallbackMock(message: string, actionPayload: any, _tabId: number) {
        registerTypeToPayloadCallbackMock
            .setup(regitrar => regitrar(message, It.is(param => _.isFunction(param))))
            .callback((_message, handler) => handler(actionPayload, _tabId));
    }
});