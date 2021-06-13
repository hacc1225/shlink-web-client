import { isEmpty } from 'ramda';
import { FC, useEffect, useRef } from 'react';
import Moment from 'react-moment';
import { ExternalLink } from 'react-external-link';
import ColorGenerator from '../../utils/services/ColorGenerator';
import { StateFlagTimeout } from '../../utils/helpers/hooks';
import Tag from '../../tags/helpers/Tag';
import { SelectedServer } from '../../servers/data';
import { CopyToClipboardIcon } from '../../utils/CopyToClipboardIcon';
import { ShortUrl } from '../data';
import ShortUrlVisitsCount from './ShortUrlVisitsCount';
import { ShortUrlsRowMenuProps } from './ShortUrlsRowMenu';
import './ShortUrlsRow.scss';

export interface ShortUrlsRowProps {
  onTagClick?: (tag: string) => void;
  selectedServer: SelectedServer;
  shortUrl: ShortUrl;
}

const ShortUrlsRow = (
  ShortUrlsRowMenu: FC<ShortUrlsRowMenuProps>,
  colorGenerator: ColorGenerator,
  useStateFlagTimeout: StateFlagTimeout,
) => ({ shortUrl, selectedServer, onTagClick }: ShortUrlsRowProps) => {
  const [ copiedToClipboard, setCopiedToClipboard ] = useStateFlagTimeout();
  const [ active, setActive ] = useStateFlagTimeout(false, 500);
  const isFirstRun = useRef(true);

  const renderTags = (tags: string[]) => {
    if (isEmpty(tags)) {
      return <i className="indivisible"><small>No tags</small></i>;
    }

    return tags.map((tag) => (
      <Tag
        colorGenerator={colorGenerator}
        key={tag}
        text={tag}
        onClick={() => onTagClick?.(tag)}
      />
    ));
  };

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
    } else {
      setActive();
    }
  }, [ shortUrl.visitsCount ]);

  return (
    <tr className="short-urls-row">
      <td className="indivisible short-urls-row__cell" data-th="Created at: ">
        <Moment format="YYYY-MM-DD HH:mm">{shortUrl.dateCreated}</Moment>
      </td>
      <td className="short-urls-row__cell" data-th="Short URL: ">
        <span className="indivisible short-urls-row__cell--relative">
          <ExternalLink href={shortUrl.shortUrl} />
          <CopyToClipboardIcon text={shortUrl.shortUrl} onCopy={setCopiedToClipboard} />
          <span className="badge badge-warning short-urls-row__copy-hint" hidden={!copiedToClipboard}>
            Copied short URL!
          </span>
        </span>
      </td>
      <td className="short-urls-row__cell short-urls-row__cell--break" data-th={`${shortUrl.title ? 'Title' : 'Long URL'}: `}>
        <ExternalLink href={shortUrl.longUrl}>{shortUrl.title ?? shortUrl.longUrl}</ExternalLink>
      </td>
      {shortUrl.title && (
        <td className="short-urls-row__cell short-urls-row__cell--break d-lg-none" data-th="Long URL: ">
          <ExternalLink href={shortUrl.longUrl} />
        </td>
      )}
      <td className="short-urls-row__cell" data-th="Tags: ">{renderTags(shortUrl.tags)}</td>
      <td className="short-urls-row__cell text-md-right" data-th="Visits: ">
        <ShortUrlVisitsCount
          visitsCount={shortUrl.visitsCount}
          shortUrl={shortUrl}
          selectedServer={selectedServer}
          active={active}
        />
      </td>
      <td className="short-urls-row__cell">
        <ShortUrlsRowMenu selectedServer={selectedServer} shortUrl={shortUrl} />
      </td>
    </tr>
  );
};

export default ShortUrlsRow;
