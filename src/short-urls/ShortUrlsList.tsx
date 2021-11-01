import { faCaretDown as caretDownIcon, faCaretUp as caretUpIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { head, keys, values } from 'ramda';
import { FC, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Card } from 'reactstrap';
import SortingDropdown from '../utils/SortingDropdown';
import { determineOrderDir, Order, OrderDir } from '../utils/helpers/ordering';
import { getServerId, SelectedServer } from '../servers/data';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { parseQuery } from '../utils/helpers/query';
import { Topics } from '../mercure/helpers/Topics';
import { ShortUrlsList as ShortUrlsListState } from './reducers/shortUrlsList';
import { OrderableFields, ShortUrlsListParams, SORTABLE_FIELDS } from './reducers/shortUrlsListParams';
import { ShortUrlsTableProps } from './ShortUrlsTable';
import Paginator from './Paginator';

interface RouteParams {
  page: string;
  serverId: string;
}

export interface ShortUrlsListProps extends RouteComponentProps<RouteParams> {
  selectedServer: SelectedServer;
  shortUrlsList: ShortUrlsListState;
  listShortUrls: (params: ShortUrlsListParams) => void;
  shortUrlsListParams: ShortUrlsListParams;
  resetShortUrlParams: () => void;
}

type ShortUrlsOrder = Order<OrderableFields>;

const ShortUrlsList = (ShortUrlsTable: FC<ShortUrlsTableProps>) => boundToMercureHub(({
  listShortUrls,
  resetShortUrlParams,
  shortUrlsListParams,
  match,
  location,
  shortUrlsList,
  selectedServer,
}: ShortUrlsListProps) => {
  const { orderBy } = shortUrlsListParams;
  const [ order, setOrder ] = useState<ShortUrlsOrder>({
    field: orderBy && (head(keys(orderBy)) as OrderableFields),
    dir: orderBy && head(values(orderBy)),
  });
  const { pagination } = shortUrlsList?.shortUrls ?? {};
  const refreshList = (extraParams: ShortUrlsListParams) => listShortUrls({ ...shortUrlsListParams, ...extraParams });
  const handleOrderBy = (field?: OrderableFields, dir?: OrderDir) => {
    setOrder({ field, dir });
    refreshList({ orderBy: field ? { [field]: dir } : undefined });
  };
  const orderByColumn = (field: OrderableFields) => () =>
    handleOrderBy(field, determineOrderDir(field, order.field, order.dir));
  const renderOrderIcon = (field: OrderableFields) => order.dir && order.field === field &&
    <FontAwesomeIcon icon={order.dir === 'ASC' ? caretUpIcon : caretDownIcon} className="ml-1" />;

  useEffect(() => {
    const { tag } = parseQuery<{ tag?: string }>(location.search);
    const tags = tag ? [ decodeURIComponent(tag) ] : shortUrlsListParams.tags;

    refreshList({ page: match.params.page, tags, itemsPerPage: undefined });

    return resetShortUrlParams;
  }, []);

  return (
    <>
      <div className="d-block d-lg-none mb-3">
        <SortingDropdown
          items={SORTABLE_FIELDS}
          orderField={order.field}
          orderDir={order.dir}
          onChange={handleOrderBy}
        />
      </div>
      <Card body className="pb-1">
        <ShortUrlsTable
          orderByColumn={orderByColumn}
          renderOrderIcon={renderOrderIcon}
          selectedServer={selectedServer}
          shortUrlsList={shortUrlsList}
          onTagClick={(tag) => refreshList({ tags: [ ...shortUrlsListParams.tags ?? [], tag ] })}
        />
        <Paginator paginator={pagination} serverId={getServerId(selectedServer)} />
      </Card>
    </>
  );
}, () => [ Topics.visits ]);

export default ShortUrlsList;
