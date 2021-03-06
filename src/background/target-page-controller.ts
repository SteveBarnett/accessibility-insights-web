// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BrowserAdapter } from 'common/browser-adapters/browser-adapter';
import { Logger } from 'common/logging/logger';
import { Message } from 'common/message';
import { Messages } from 'common/messages';
import { PageVisibilityChangeTabPayload } from './actions/action-payloads';
import { BrowserMessageBroadcasterFactory } from './browser-message-broadcaster-factory';
import { DetailsViewController } from './details-view-controller';
import { TabToContextMap } from './tab-context';
import { TabContextFactory } from './tab-context-factory';

export class TargetPageController {
    constructor(
        private readonly targetPageTabIdToContextMap: TabToContextMap,
        private readonly broadcasterFactory: BrowserMessageBroadcasterFactory,
        private readonly browserAdapter: BrowserAdapter,
        private readonly detailsViewController: DetailsViewController,
        private readonly tabContextFactory: TabContextFactory,
        private readonly logger: Logger,
    ) {}

    public async initialize(): Promise<void> {
        const tabs = await this.browserAdapter.tabsQuery({});
        if (tabs) {
            tabs.forEach(tab => {
                this.handleTabUrlUpdate(tab.id);
            });
        }

        this.browserAdapter.addListenerOnConnect(port => {
            // do not remove this. We need this to detect if the extension is reloaded from the content scripts
        });

        this.browserAdapter.addListenerToWebNavigationUpdated(this.onTabNavigated);
        this.browserAdapter.addListenerToTabsOnRemoved(this.onTargetTabRemoved);
        this.browserAdapter.addListenerOnWindowsFocusChanged(this.onWindowFocusChanged);
        this.browserAdapter.addListenerToTabsOnActivated(this.onTabActivated);
        this.browserAdapter.addListenerToTabsOnUpdated(this.onTabUpdated);

        this.detailsViewController.setupDetailsViewTabRemovedHandler(this.onDetailsViewTabRemoved);
    }

    private onTabNavigated = (
        details: chrome.webNavigation.WebNavigationFramedCallbackDetails,
    ): void => {
        if (details.frameId === 0) {
            this.handleTabUrlUpdate(details.tabId);
        }
    };

    private onTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo): void => {
        if (changeInfo.url) {
            this.handleTabUrlUpdate(tabId);
        }
    };

    private onTabActivated = async (activeInfo: chrome.tabs.TabActiveInfo): Promise<void> => {
        const activeTabId = activeInfo.tabId;
        const windowId = activeInfo.windowId;

        this.sendTabVisibilityChangeAction(activeTabId, false);

        const tabs = await this.browserAdapter.tabsQuery({ windowId });
        tabs.forEach(tab => {
            if (!tab.active) {
                this.sendTabVisibilityChangeAction(tab.id, true);
            }
        });
    };

    private onWindowFocusChanged = async (windowId: number): Promise<void> => {
        const chromeWindows = await this.browserAdapter.getAllWindows({
            populate: false,
            windowTypes: ['normal', 'popup'],
        });

        chromeWindows.forEach(async chromeWindow => {
            const activeTabs = await this.browserAdapter.tabsQuery({
                active: true,
                windowId: chromeWindow.id,
            });

            for (const activeTab of activeTabs) {
                this.sendTabVisibilityChangeAction(
                    activeTab.id,
                    chromeWindow.state === 'minimized',
                );
            }
        });
    };

    private handleTabUrlUpdate = (tabId: number): void => {
        if (!this.hasTabContext(tabId)) {
            this.addTabContext(tabId);
        }

        this.sendTabUrlUpdatedAction(tabId);
    };

    private hasTabContext(tabId: number): boolean {
        return tabId in this.targetPageTabIdToContextMap;
    }

    private addTabContext(tabId: number): void {
        this.targetPageTabIdToContextMap[tabId] = this.tabContextFactory.createTabContext(
            this.broadcasterFactory.createTabSpecificBroadcaster(tabId),
            this.browserAdapter,
            this.detailsViewController,
            tabId,
        );
    }

    private sendTabUrlUpdatedAction(tabId: number): void {
        this.browserAdapter.getTab(
            tabId,
            (tab: chrome.tabs.Tab) => {
                const tabContext = this.targetPageTabIdToContextMap[tabId];
                if (tabContext) {
                    const interpreter = tabContext.interpreter;
                    interpreter.interpret({
                        messageType: Messages.Tab.ExistingTabUpdated,
                        payload: tab,
                        tabId: tabId,
                    });
                }
            },
            () => {
                this.logger.log(
                    `sendTabUrlUpdatedAction: tab with ID ${tabId} not found, skipping action message`,
                );
            },
        );
    }

    private sendTabVisibilityChangeAction(tabId: number, isHidden: boolean): void {
        if (!this.hasTabContext(tabId)) {
            return;
        }
        const tabContext = this.targetPageTabIdToContextMap[tabId];
        if (tabContext == null) {
            return;
        }
        const interpreter = tabContext.interpreter;
        const payload: PageVisibilityChangeTabPayload = {
            hidden: isHidden,
        };
        const message: Message = {
            messageType: Messages.Tab.VisibilityChange,
            payload: payload,
            tabId: tabId,
        };
        interpreter.interpret(message);
    }

    private onTabRemoved = (tabId: number, messageType: string): void => {
        const tabContext = this.targetPageTabIdToContextMap[tabId];
        if (tabContext) {
            const interpreter = tabContext.interpreter;
            interpreter.interpret({
                messageType: messageType,
                payload: null,
                tabId: tabId,
            });
        }
    };

    private onTargetTabRemoved = (tabId: number): void => {
        this.onTabRemoved(tabId, Messages.Tab.Remove);
        delete this.targetPageTabIdToContextMap[tabId];
    };

    private onDetailsViewTabRemoved = (tabId: number): void => {
        this.onTabRemoved(tabId, Messages.Visualizations.DetailsView.Close);
    };
}
