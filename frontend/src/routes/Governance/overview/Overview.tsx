/* Copyright Contributors to the Open Cluster Management project */
import { Card, CardBody, PageSection, Split, SplitItem, Stack, Title } from '@patternfly/react-core'
import { AcmButton, AcmEmptyState } from '@stolostron/ui-components'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { AcmMasonry } from '../../../components/AcmMasonry'
import { NavigationPath } from '../../../NavigationPath'
import { ClusterPolicyViolationCard } from '../components/ClusterPolicyViolations'
import { PolicyViolationIcons, PolicyViolationsCard } from '../components/PolicyViolations'
import { IGovernanceData, IPolicyGrouping, risksHasValues } from '../useGovernanceData'

export default function GovernanceOverview(props: { governanceData: IGovernanceData }) {
    const { governanceData } = props
    const hasRisks = risksHasValues(props.governanceData.policyRisks)
    if (!hasRisks) {
        return (
            <PageSection isWidthLimited>
                <AcmEmptyState
                    title={'You don’t have any policies applied to clusters'}
                    action={
                        <AcmButton component={Link} variant="primary" to={NavigationPath.policies}>
                            {'Go to policies'}
                        </AcmButton>
                    }
                />
            </PageSection>
        )
    }
    return (
        <PageSection isWidthLimited>
            <Stack hasGutter>
                <AcmMasonry minSize={600}>
                    <ClusterPolicyViolationCard risks={governanceData.clusterRisks} />
                    <PolicyViolationsCard risks={governanceData.policyRisks} />
                </AcmMasonry>

                {['Standards', 'Categories', 'Controls'].map((key) => {
                    const grouping = (governanceData as unknown as Record<string, IPolicyGrouping>)[key.toLowerCase()]
                    if (!risksHasValues(grouping.risks)) return <Fragment />
                    return (
                        <Card>
                            <CardBody>
                                <Split hasGutter>
                                    <SplitItem style={{ minWidth: 120 }}>
                                        <Title headingLevel="h6">
                                            <span style={{ whiteSpace: 'nowrap' }}>{key}</span>
                                        </Title>
                                    </SplitItem>
                                    <SplitItem>
                                        <div style={{ display: 'flex', columnGap: 48, rowGap: 16, flexWrap: 'wrap' }}>
                                            {grouping.groups.map((group) => {
                                                const hasRisks =
                                                    group.policyRisks.high +
                                                        group.policyRisks.low +
                                                        group.policyRisks.medium +
                                                        group.policyRisks.synced +
                                                        group.policyRisks.unknown >
                                                    0
                                                if (!hasRisks) return <Fragment />
                                                return (
                                                    <Split hasGutter>
                                                        <SplitItem>
                                                            <span style={{ whiteSpace: 'nowrap' }}>{group.name}</span>
                                                        </SplitItem>
                                                        <PolicyViolationIcons risks={group.policyRisks} />
                                                    </Split>
                                                )
                                            })}
                                        </div>
                                    </SplitItem>
                                </Split>
                            </CardBody>
                        </Card>
                    )
                })}
            </Stack>
        </PageSection>
    )
}