// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';

import { title } from '../content/strings/application';
import { VisualizationConfigurationFactory } from './../common/configs/visualization-configuration-factory';
import { IBaseStore } from './../common/istore.d';
import { IAssessmentStoreData } from './../common/types/store-data/iassessment-result-data.d';
import { IDetailsViewData } from './../common/types/store-data/idetails-view-data.d';
import { ITabStoreData } from './../common/types/store-data/itab-store-data.d';
import { IVisualizationStoreData } from './../common/types/store-data/ivisualization-store-data';
import { GetDetailsRightPanelConfiguration } from './components/details-view-right-panel';
import { GetDetailsSwitcherNavConfiguration } from './components/details-view-switcher-nav';

export class DocumentTitleUpdater {
    constructor(
        private readonly tabStore: IBaseStore<ITabStoreData>,
        private readonly detailsViewStore: IBaseStore<IDetailsViewData>,
        private readonly visualizationStore: IBaseStore<IVisualizationStoreData>,
        private readonly assessmentStore: IBaseStore<IAssessmentStoreData>,
        private readonly getDetailsRightPanelConfiguration: GetDetailsRightPanelConfiguration,
        private readonly getDetailsSwitcherNavConfiguration: GetDetailsSwitcherNavConfiguration,
        private readonly visualizationConfigurationFactory: VisualizationConfigurationFactory,
        private readonly doc: Document,
    ) {}

    public initialize() {
        this.tabStore.addChangedListener(this.onStoreChange);
        this.detailsViewStore.addChangedListener(this.onStoreChange);
        this.visualizationStore.addChangedListener(this.onStoreChange);
        this.assessmentStore.addChangedListener(this.onStoreChange);
    }

    @autobind
    private onStoreChange(): void {
        const documentTitle = this.getDocumentTitle();
        const defaultTitle = title;

        this.doc.title = documentTitle ? `${documentTitle} - ${defaultTitle}` : defaultTitle;
    }

    private getDocumentTitle(): string {
        if (!this.hasAllStoreData() || this.tabStore.getState().isClosed) {
            return '';
        }

        const assessmentStoreData = this.assessmentStore.getState();
        const visualizationStoreData = this.visualizationStore.getState();
        const selectedDetailsViewPivot = visualizationStoreData.selectedDetailsViewPivot;
        const switcherNavConfiguration = this.getDetailsSwitcherNavConfiguration({
            selectedDetailsViewPivot,
        });

        const selectedDetailsView = switcherNavConfiguration.getSelectedDetailsView({
            assessmentStoreData,
            visualizationStoreData,
        });

        const panel = this.detailsViewStore.getState().detailsViewRightContentPanel;

        return this.getDetailsRightPanelConfiguration({
            detailsViewRightContentPanel: panel,
            selectedDetailsViewPivot: selectedDetailsViewPivot,
        }).GetTitle({
            visualizationConfigurationFactory: this.visualizationConfigurationFactory,
            selectedDetailsView,
        });
    }

    private hasAllStoreData(): boolean {
        return [this.tabStore, this.detailsViewStore, this.visualizationStore, this.assessmentStore].every(
            store => store.getState() != null,
        );
    }
}