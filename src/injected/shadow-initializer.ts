// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ClientBrowserAdapter } from '../common/client-browser-adapter';
import { FileRequestHelper } from '../common/file-request-helper';
import { HTMLElementUtils } from './../common/html-element-utils';

export class ShadowInitializer {
    private chromeAdapter: ClientBrowserAdapter;
    private htmlElementUtils: HTMLElementUtils;
    private fileRequestHlper: FileRequestHelper;

    public static readonly injectedCssPath: string = 'injected/styles/default/injected.css';

    constructor(chromeAdapter: ClientBrowserAdapter, htmlElementUtils: HTMLElementUtils, fileRequestHelper: FileRequestHelper) {
        this.chromeAdapter = chromeAdapter;
        this.htmlElementUtils = htmlElementUtils;
        this.fileRequestHlper = fileRequestHelper;
    }

    public async initialize(): Promise<void> {
        try {
            const shadowContainer = this.createShadowContainer();
            const injectedCssContent = await this.getFileContentByPath(ShadowInitializer.injectedCssPath);
            this.addStyleElement(injectedCssContent, shadowContainer);
        } catch (err) {
            console.log('unable to insert styles under shadow', err);
        }
    }

    private addStyleElement(styleContent: string, container: HTMLElement): void {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = styleContent;
        container.appendChild(styleElement);
    }

    private createShadowHost() {
        const shadowHostElement = this.createDivWithId('insights-shadow-host');

        this.htmlElementUtils.querySelector('body').appendChild(shadowHostElement);

        return shadowHostElement;
    }

    private removeExistingShadowHost() {
        const hosts = this.htmlElementUtils.querySelectorAll('#insights-shadow-host');

        for (let i = 0; i < hosts.length; i++) {
            hosts[i].remove();
        }
    }

    private createShadowContainer() {
        this.removeExistingShadowHost();

        const shadowHostElement = this.createShadowHost();

        const shadow = this.htmlElementUtils.attachShadow(shadowHostElement);

        shadow.appendChild(this.createDivWithId('insights-shadow-container'));

        return shadow.firstChild as HTMLElement;
    }

    private createDivWithId(id: string) {
        const div = document.createElement('div');

        div.id = id;
        return div;
    }

    private async getFileContentByPath(filePath: string): Promise<string> {
        const fileUrl = this.chromeAdapter.getUrl(filePath);

        return await this.fileRequestHlper.getFileContent(fileUrl);
    }
}