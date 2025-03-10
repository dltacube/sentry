import {browserHistory} from 'react-router';
import styled from '@emotion/styled';

import Alert from 'sentry/components/alert';
import Breadcrumbs from 'sentry/components/breadcrumbs';
import FeedbackWidget from 'sentry/components/feedback/widget/feedbackWidget';
import * as Layout from 'sentry/components/layouts/thirds';
import {DatePageFilter} from 'sentry/components/organizations/datePageFilter';
import {EnvironmentPageFilter} from 'sentry/components/organizations/environmentPageFilter';
import PageFilterBar from 'sentry/components/organizations/pageFilterBar';
import {ProjectPageFilter} from 'sentry/components/organizations/projectPageFilter';
import SearchBar from 'sentry/components/searchBar';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import {decodeScalar} from 'sentry/utils/queryString';
import {useLocation} from 'sentry/utils/useLocation';
import useOrganization from 'sentry/utils/useOrganization';
import {normalizeUrl} from 'sentry/utils/withDomainRequired';
import {ModulePageProviders} from 'sentry/views/performance/database/modulePageProviders';
import {NoDataMessage} from 'sentry/views/performance/database/noDataMessage';
import {ModuleName, SpanMetricsField} from 'sentry/views/starfish/types';
import {QueryParameterNames} from 'sentry/views/starfish/views/queryParameters';
import {ActionSelector} from 'sentry/views/starfish/views/spans/selectors/actionSelector';
import {DomainSelector} from 'sentry/views/starfish/views/spans/selectors/domainSelector';
import SpansTable from 'sentry/views/starfish/views/spans/spansTable';
import {SpanTimeCharts} from 'sentry/views/starfish/views/spans/spanTimeCharts';
import {useModuleFilters} from 'sentry/views/starfish/views/spans/useModuleFilters';
import {useModuleSort} from 'sentry/views/starfish/views/spans/useModuleSort';

function DatabaseLandingPage() {
  const organization = useOrganization();
  const moduleName = ModuleName.DB;
  const location = useLocation();

  const spanDescription = decodeScalar(location.query?.['span.description'], '');
  const moduleFilters = useModuleFilters();
  const sort = useModuleSort(QueryParameterNames.SPANS_SORT);

  const handleSearch = (newQuery: string) => {
    browserHistory.push({
      ...location,
      query: {
        ...location.query,
        'span.description': newQuery === '' ? undefined : newQuery,
        cursor: undefined,
      },
    });
  };

  return (
    <ModulePageProviders title={[t('Performance'), t('Database')].join(' — ')}>
      <Layout.Header>
        <Layout.HeaderContent>
          <Breadcrumbs
            crumbs={[
              {
                label: 'Performance',
                to: normalizeUrl(`/organizations/${organization.slug}/performance/`),
                preservePageFilters: true,
              },
              {
                label: 'Queries',
              },
            ]}
          />

          <Layout.Title>{t('Queries')}</Layout.Title>
        </Layout.HeaderContent>
      </Layout.Header>

      <Layout.Body>
        <Layout.Main fullWidth>
          <NoDataMessage Wrapper={AlertBanner} />
          <FeedbackWidget />
          <PaddedContainer>
            <PageFilterBar condensed>
              <ProjectPageFilter />
              <EnvironmentPageFilter />
              <DatePageFilter />
            </PageFilterBar>
          </PaddedContainer>

          <SpanTimeCharts moduleName={moduleName} appliedFilters={moduleFilters} />

          <FilterOptionsContainer>
            <ActionSelector
              moduleName={moduleName}
              value={moduleFilters[SpanMetricsField.SPAN_ACTION] || ''}
            />

            <DomainSelector
              moduleName={moduleName}
              value={moduleFilters[SpanMetricsField.SPAN_DOMAIN] || ''}
            />
          </FilterOptionsContainer>

          <SearchBarContainer>
            <SearchBar
              query={spanDescription}
              placeholder={t('Search for more Queries')}
              onSearch={handleSearch}
            />
          </SearchBarContainer>

          <SpansTable moduleName={moduleName} sort={sort} limit={LIMIT} />
        </Layout.Main>
      </Layout.Body>
    </ModulePageProviders>
  );
}

const PaddedContainer = styled('div')`
  margin-bottom: ${space(2)};
`;

function AlertBanner(props) {
  return <Alert {...props} type="info" showIcon />;
}

const FilterOptionsContainer = styled('div')`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${space(2)};
  margin-bottom: ${space(2)};
  max-width: 800px;
`;

const SearchBarContainer = styled('div')`
  margin-bottom: ${space(2)};
`;

const LIMIT: number = 25;

export default DatabaseLandingPage;
