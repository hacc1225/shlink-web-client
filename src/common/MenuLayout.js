import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Swipeable } from 'react-swipeable';
import { faBars as burgerIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import * as PropTypes from 'prop-types';
import { serverType } from '../servers/prop-types';
import { withSelectedServer } from '../servers/helpers/withSelectedServer';
import NotFound from './NotFound';
import './MenuLayout.scss';

const propTypes = {
  match: PropTypes.object,
  location: PropTypes.object,
  selectedServer: serverType,
};

const MenuLayout = (TagsList, ShortUrls, AsideMenu, CreateShortUrl, ShortUrlVisits, ShlinkVersions, ServerError) => {
  const MenuLayoutComp = ({ match, location, selectedServer }) => {
    const [ showSideBar, setShowSidebar ] = useState(false);
    const { params: { serverId } } = match;

    useEffect(() => setShowSidebar(false), [ location ]);

    if (selectedServer.serverNotReachable) {
      return <ServerError type="not-reachable" />;
    }

    const burgerClasses = classNames('menu-layout__burger-icon', {
      'menu-layout__burger-icon--active': showSideBar,
    });
    const swipeMenuIfNoModalExists = (showSideBar) => () => {
      if (document.querySelector('.modal')) {
        return;
      }

      setShowSidebar(showSideBar);
    };

    return (
      <React.Fragment>
        <FontAwesomeIcon
          icon={burgerIcon}
          className={burgerClasses}
          onClick={() => setShowSidebar(!showSideBar)}
        />

        <Swipeable
          delta={40}
          className="menu-layout__swipeable"
          onSwipedLeft={swipeMenuIfNoModalExists(false)}
          onSwipedRight={swipeMenuIfNoModalExists(true)}
        >
          <div className="row menu-layout__swipeable-inner">
            <AsideMenu className="col-lg-2 col-md-3" selectedServer={selectedServer} showOnMobile={showSideBar} />
            <div className="col-lg-10 offset-lg-2 col-md-9 offset-md-3" onClick={() => setShowSidebar(false)}>
              <div className="menu-layout__container">
                <Switch>
                  <Route exact path="/server/:serverId/list-short-urls/:page" component={ShortUrls} />
                  <Route exact path="/server/:serverId/create-short-url" component={CreateShortUrl} />
                  <Route exact path="/server/:serverId/short-code/:shortCode/visits" component={ShortUrlVisits} />
                  <Route exact path="/server/:serverId/manage-tags" component={TagsList} />
                  <Route
                    render={() => <NotFound to={`/server/${serverId}/list-short-urls/1`}>List short URLs</NotFound>}
                  />
                </Switch>
              </div>

              <div className="menu-layout__footer text-center text-md-right">
                <ShlinkVersions />
              </div>
            </div>
          </div>
        </Swipeable>
      </React.Fragment>
    );
  };

  MenuLayoutComp.propTypes = propTypes;

  return withSelectedServer(MenuLayoutComp, ServerError);
};

export default MenuLayout;
