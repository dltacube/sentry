import {Sort} from 'sentry/utils/discover/fields';
import {useSpanTransactionMetrics} from 'sentry/views/starfish/queries/useSpanTransactionMetrics';
import {SpanMetricsField} from 'sentry/views/starfish/types';

const {HTTP_RESPONSE_CONTENT_LENGTH, RESOURCE_RENDER_BLOCKING_STATUS} = SpanMetricsField;

export const useResourcePagesQuery = (
  groupId: string,
  {sort, cursor}: {sort: Sort; cursor?: string}
) => {
  return useSpanTransactionMetrics({'span.group': groupId}, [sort], cursor, [
    `avg(${HTTP_RESPONSE_CONTENT_LENGTH})`,
    RESOURCE_RENDER_BLOCKING_STATUS,
  ]);
};
