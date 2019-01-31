// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Mock, Times } from 'typemoq';

import { IAssessmentNavState } from '../../../../../common/types/store-data/iassessment-result-data';
import { VisualizationType } from '../../../../../common/types/visualization-type';
import { DetailsViewActionMessageCreator } from '../../../../../DetailsView/actions/details-view-action-message-creator';
import { MasterCheckBoxConfigProvider } from '../../../../../DetailsView/handlers/master-checkbox-config-provider';

describe('MasterCheckBoxConfigProviderTest', () => {
    test('getMasterCheckBoxProperty: allEnabled = true', () => {
        const allEnabled = true;
        const navState: IAssessmentNavState = {
            selectedTestType: VisualizationType.HeadingsAssessment,
            selectedTestStep: '',
        };
        const actionMessageCreatorMock = Mock.ofType(DetailsViewActionMessageCreator);
        actionMessageCreatorMock
            .setup(acm => acm.changeAssessmentVisualizationStateForAll(false, navState.selectedTestType, navState.selectedTestStep))
            .verifiable(Times.once());
        const provider = new MasterCheckBoxConfigProvider(actionMessageCreatorMock.object);

        const config = provider.getMasterCheckBoxProperty(navState, allEnabled);
        config.onColumnClick(null, null);

        expect(config.iconName).toBe('view');
        expect(config.iconClassName).toBe('master-visualization-column-header-selected');
        expect(config.name).toBe('Visualization toggle');
        expect(config.ariaLabel).toBe('Toggle all visualizations checked');

        actionMessageCreatorMock.verifyAll();
    });

    test('getMasterCheckBoxProperty: allEnabled = false', () => {
        const allEnabled = false;
        const navState: IAssessmentNavState = {
            selectedTestType: VisualizationType.HeadingsAssessment,
            selectedTestStep: '',
        };

        const provider = new MasterCheckBoxConfigProvider(null);

        const config = provider.getMasterCheckBoxProperty(navState, allEnabled);

        expect(config.iconName).toBe('checkbox');
        expect(config.iconClassName).toBeDefined();
        expect(config.iconClassName.trim()).toHaveLength(0);
        expect(config.name).toBe('Visualization toggle');
        expect(config.ariaLabel).toBe('Toggle all visualizations not checked');
    });
});