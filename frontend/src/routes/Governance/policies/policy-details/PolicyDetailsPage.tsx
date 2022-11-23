/* Copyright Contributors to the Open Cluster Management project */

import { ReactNode, Fragment, Suspense, useMemo, useState } from 'react'
import { Link, Route, Switch, useHistory, useLocation, useParams } from 'react-router-dom'
import { ErrorPage } from '../../../../components/ErrorPage'
import { PolicyActionDropdown } from '../../components/PolicyActionDropdown'
import { useTranslation } from '../../../../lib/acm-i18next'
import { NavigationPath } from '../../../../NavigationPath'
import { Policy, ResourceError } from '../../../../resources'
import { useRecoilState, useSharedAtoms } from '../../../../shared-recoil'
import {
    AcmActionGroup,
    AcmButton,
    AcmPage,
    AcmPageHeader,
    AcmSecondaryNav,
    AcmSecondaryNavItem,
} from '../../../../ui-components'
import { getPolicyDetailSourceLabel, resolveExternalStatus } from '../../common/util'
import PolicyDetailsOverview from './PolicyDetailsOverview'
import PolicyDetailsResults from './PolicyDetailsResults'
import { PolicyTableItem } from '../Policies'

export function PolicyDetailsPage() {
    const location = useLocation()
    const { t } = useTranslation()
    const { channelsState, helmReleaseState, subscriptionsState, usePolicies } = useSharedAtoms()
    const history = useHistory()
    const policies = usePolicies()
    const [helmReleases] = useRecoilState(helmReleaseState)
    const [subscriptions] = useRecoilState(subscriptionsState)
    const [channels] = useRecoilState(channelsState)
    const [modal, setModal] = useState<ReactNode | undefined>()

    const params = useParams<{ namespace: string; name: string }>()
    const policyNamespace = params.namespace
    const policyName = params.name

    const isResultsTab = location.pathname.endsWith('/results')

    const detailsUrl = NavigationPath.policyDetails
        .replace(':namespace', policyNamespace as string)
        .replace(':name', policyName as string)
    const resultsUrl = NavigationPath.policyDetailsResults
        .replace(':namespace', policyNamespace as string)
        .replace(':name', policyName as string)

    const selectedPolicy: Policy = useMemo(() => {
        const idx =
            policies.findIndex(
                (policy: Policy) => policy.metadata.namespace === policyNamespace && policy.metadata.name === policyName
            ) ?? 0
        return policies[idx]
    }, [policies, policyName, policyNamespace])

    const tableItem: PolicyTableItem = useMemo(() => {
        const isExternal = resolveExternalStatus(selectedPolicy)

        return {
            policy: selectedPolicy,
            isExternal,
            source: '',
        }
    }, [selectedPolicy])

    if (!selectedPolicy) {
        return (
            <ErrorPage
                error={new ResourceError('Not found', 404)}
                actions={
                    <AcmButton role="link" onClick={() => history.push(NavigationPath.policies)}>
                        {t('Back to policies')}
                    </AcmButton>
                }
            />
        )
    }

    return (
        <div>
            {modal !== undefined && modal}
            <AcmPage
                hasDrawer
                header={
                    <AcmPageHeader
                        title={policyName ?? 'Policy details'}
                        breadcrumb={[
                            { text: t('Policies'), to: NavigationPath.policies },
                            { text: policyName ?? t('Policy details'), to: '' },
                        ]}
                        popoverAutoWidth={false}
                        popoverPosition="bottom"
                        navigation={
                            <AcmSecondaryNav>
                                <AcmSecondaryNavItem isActive={!isResultsTab}>
                                    <Link to={detailsUrl}>{t('Details')}</Link>
                                </AcmSecondaryNavItem>
                                <AcmSecondaryNavItem isActive={isResultsTab}>
                                    <Link to={resultsUrl}>{t('Results')}</Link>
                                </AcmSecondaryNavItem>
                            </AcmSecondaryNav>
                        }
                        description={getPolicyDetailSourceLabel(
                            selectedPolicy,
                            helmReleases,
                            channels,
                            subscriptions,
                            t
                        )}
                        actions={
                            <AcmActionGroup>
                                {[
                                    <PolicyActionDropdown
                                        key={`${selectedPolicy?.metadata.name ?? 'policy'}-actions`}
                                        setModal={setModal}
                                        item={tableItem}
                                        isKebab={true}
                                    />,
                                ]}
                            </AcmActionGroup>
                        }
                    />
                }
            >
                <Suspense fallback={<Fragment />}>
                    <Switch>
                        <Route
                            exact
                            path={detailsUrl}
                            render={() => <PolicyDetailsOverview policy={selectedPolicy} />}
                        />
                        <Route
                            exact
                            path={resultsUrl}
                            render={() => <PolicyDetailsResults policy={selectedPolicy} />}
                        />
                    </Switch>
                </Suspense>
            </AcmPage>
        </div>
    )
}
