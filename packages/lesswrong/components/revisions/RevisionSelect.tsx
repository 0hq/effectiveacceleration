import React, { useCallback, useState } from 'react'
import { registerComponent, Components } from '../../lib/vulcan-core';
import { Link } from '../../lib/reactRouterWrapper';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import classNames from 'classnames';

const styles = theme => ({
  revisionRow: {
  },
  radio: {
    padding: 4,
  },
  radioDisabled: {
    color: "rgba(0,0,0,0) !important",
  },
  charsAdded: {
    color: "#008800",
  },
  charsRemoved: {
    color: "#880000",
  },
});

const RevisionSelect = ({ revisions, getRevisionUrl, onPairSelected, loadMoreProps, classes }: {
  revisions: Array<RevisionMetadataWithChangeMetrics>,
  getRevisionUrl: (rev: RevisionMetadata) => React.ReactNode,
  onPairSelected: ({before, after}: {before: RevisionMetadata, after: RevisionMetadata}) => void,
  loadMoreProps: any,
  classes: ClassesType,
}) => {
  const { FormatDate, UsersName, LoadMore } = Components;
  
  const [beforeRevisionIndex, setBeforeRevisionIndex] = useState(1);
  const [afterRevisionIndex, setAfterRevisionIndex] = useState(0);
  
  const compareRevs = useCallback(() => {
    if (!revisions) return;
    onPairSelected({
      before: revisions[beforeRevisionIndex],
      after: revisions[afterRevisionIndex]
    });
  }, [beforeRevisionIndex, afterRevisionIndex, onPairSelected, revisions]);
  
  // MenuItem takes a component and passes unrecognized props to that component,
  // but its material-ui-provided type signature does not include this feature.
  // Cast to any to work around it, to be able to pass a "to" parameter.
  const MenuItemUntyped = MenuItem as any;
  
  return <React.Fragment>
    {revisions.map((rev,i) => {
      const beforeDisabled = i<=afterRevisionIndex;
      const afterDisabled = i>=beforeRevisionIndex;
      return (
        <div key={rev.version} className={classes.revisionRow}>
          <Radio
            className={classNames(classes.radio, {[classes.radioDisabled]: beforeDisabled})}
            disabled={beforeDisabled}
            checked={i===beforeRevisionIndex}
            onChange={(ev, checked) => {
              if (checked) {
                setBeforeRevisionIndex(i);
              }
            }}
          />
          <Radio
            className={classNames(classes.radio, {[classes.radioDisabled]: afterDisabled})}
            disabled={afterDisabled}
            checked={i===afterRevisionIndex}
            onChange={(ev, checked) => {
              if (checked) {
                setAfterRevisionIndex(i);
              }
            }}
          />
          <Link to={getRevisionUrl(rev)}>
            {rev.version}{" "}
            <FormatDate format={"LLL z"} date={rev.editedAt}/>{" "}
            <UsersName documentId={rev.userId}/>{" "}
            {(rev.changeMetrics.added>0 && rev.changeMetrics.removed>0)
              && <>(<span className={classes.charsAdded}>+{rev.changeMetrics.added}</span>/<span className={classes.charsRemoved}>-{rev.changeMetrics.removed}</span>)</>}
            {(rev.changeMetrics.added>0 && rev.changeMetrics.removed==0)
              && <span className={classes.charsAdded}>(+{rev.changeMetrics.added})</span>}
            {(rev.changeMetrics.added==0 && rev.changeMetrics.removed>0)
              && <span className={classes.charsRemoved}>(-{rev.changeMetrics.removed})</span>}
            {" "}
            {rev.commitMessage}
          </Link>
        </div>
      )
    })}
    
    <div><LoadMore {...loadMoreProps}/></div>
    <Button onClick={compareRevs}>Compare selected revisions</Button>
  </React.Fragment>
}

const RevisionSelectComponent = registerComponent(
  'RevisionSelect', RevisionSelect, {styles}
);

declare global {
  interface ComponentTypes {
   RevisionSelect: typeof RevisionSelectComponent
  }
}
