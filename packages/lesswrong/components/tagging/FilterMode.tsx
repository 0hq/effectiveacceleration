import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { FilterMode } from '../../lib/filterSettings';
import classNames from 'classnames';
import withHover from '../common/withHover';
import { useSingle } from '../../lib/crud/withSingle';
import { Tags } from '../../lib/collections/tags/collection';
import { tagStyle } from './FooterTag';
import Input from '@material-ui/core/Input';
import { commentBodyStyles } from '../../themes/stylePiping'
import { Link } from '../../lib/reactRouterWrapper';
import { isMobile } from '../../lib/utils/isMobile'

const styles = theme => ({
  tag: {
    ...tagStyle(theme),
    display: "inline-block",
    marginBottom: 4,
    marginRight: 4,
    '&:hover': {
      '& $closeButton': {
        display: "inline"
      }
    }
  },
  description: {
    ...commentBodyStyles(theme),
    padding: theme.spacing*2,
    paddingtop: 20
  },
  filterScore: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: ".9em",
    marginLeft: 4,
  },
  filtering: {
    marginLeft: 16,
    marginTop: 16,
    marginRight: 16,
    width: 600,
    ...theme.typography.commentStyle,
    [theme.breakpoints.down('xs')]: {
      width: "calc(100% - 32px)",
    }
  },
  filterButton: {
    marginTop: 8,
    marginRight: 8,
    padding: 4,
    paddingLeft: 8,
    paddingRight: 8,
    ...theme.typography.smallText,
    display: "inline-block",
    cursor: "pointer",
    borderRadius: 2,
    border: "solid 1px rgba(0,0,0,.1)",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between"
  },
  label: {
    marginRight: "auto"
  },
  selected: {
    backgroundColor: "rgba(0,0,0,.1)",
    border: "none"
  },
  removeFilter: {
    width: 10,
    color: theme.palette.grey[500],
    cursor: "pointer"
  }
});

const FilterModeRawComponent = ({tagId="", label, hover, anchorEl, mode, canRemove=false, onChangeMode, onRemove, helpTooltip, classes, description}: {
  tagId?: string,
  label?: string,
  mode: FilterMode,
  canRemove?: boolean,
  onChangeMode: (mode: FilterMode)=>void,
  onRemove?: ()=>void,
  helpTooltip?: any,
  classes: ClassesType,
  hover?: boolean,
  anchorEl?: any,
  description?: React.ReactNode
}) => {
  const { LWTooltip, PopperCard, TagPreview } = Components
  
  const { document: tag } = useSingle({
    documentId: tagId,
    collection: Tags,
    fragmentName: "TagPreviewFragment",
  })

  const tagLabel = <span className={classNames(classes.tag, {[classes.noTag]: !tagId})}> 
    {label}
    <span className={classes.filterScore}>
      {filterModeToStr(mode)}
    </span>
  </span>

  const otherValue = ["Hidden", -30,-10,0,10,30,"Required"].includes(mode) ? "" : (mode || "")
  return <span>
    {(tag && !isMobile()) ? <Link to={`tag/${tag.slug}`}>
      {tagLabel}
    </Link>
    : tagLabel
    }
    <PopperCard open={!!hover} anchorEl={anchorEl} placement="bottom" 
      modifiers={{
        flip: {
          behavior: ["bottom-start", "top-end", "bottom-start"],
          boundariesElement: 'viewport'
        }
      }}
    >
      <div className={classes.filtering}>
        <div className={classes.labelRow}>
          <div className={classes.filterLabel}>
            Set Filter:
          </div>
          {canRemove && <LWTooltip title="Remove Filter">
            <a onClick={ev => {if (onRemove) onRemove()}}>
              X
            </a>
          </LWTooltip>}
        </div>
        <div>
          <LWTooltip title={filterModeToTooltip("Hidden")}>
            <span className={classNames(classes.filterButton, {[classes.selected]: mode==="Hidden"})} onClick={ev => onChangeMode("Hidden")}>
              Hidden
            </span>
          </LWTooltip>
          <LWTooltip title={filterModeToTooltip(-25)}>
            <span className={classNames(classes.filterButton, {[classes.selected]: mode===-30})} onClick={ev => onChangeMode(-25)}>
              -30
            </span>
          </LWTooltip>
          <LWTooltip title={filterModeToTooltip(-10)}>
            <span className={classNames(classes.filterButton, {[classes.selected]: mode===-10})} onClick={ev => onChangeMode(-10)}>
              -10
            </span>
          </LWTooltip>
          <LWTooltip title={filterModeToTooltip("Default")}>
            <span className={classNames(classes.filterButton, {[classes.selected]: mode==="Default" || mode===0})} onClick={ev => onChangeMode(0)}>
              +0
            </span>
          </LWTooltip>
          <LWTooltip title={filterModeToTooltip(10)}>
            <span className={classNames(classes.filterButton, {[classes.selected]: mode===10})} onClick={ev => onChangeMode(10)}>
              +10
            </span>
          </LWTooltip>
          <LWTooltip title={filterModeToTooltip(25)}>
            <span className={classNames(classes.filterButton, {[classes.selected]: mode===30})} onClick={ev => onChangeMode(25)}>
              +30
            </span>
          </LWTooltip>
          <LWTooltip title={filterModeToTooltip("Required")}>
            <span className={classNames(classes.filterButton)} onClick={ev => onChangeMode("Required")}>
              Required
            </span>
          </LWTooltip>
          <Input placeholder="Other" type="number" defaultValue={otherValue} onChange={ev => onChangeMode(parseInt(ev.target.value || "0"))}/>
        </div>
        {description && <div className={classes.description}>
          {description}
        </div>}
      </div>
      <TagPreview tag={tag}/>
    </PopperCard>
  </span>
}

function filterModeToTooltip(mode: FilterMode): string {
  switch (mode) {
    case "Required":
      return "ONLY posts with this tag will appear in Latest Posts."
    case "Hidden":
      return "Posts with this tag will be not appear in Latest Posts."
    case 0:
    case "Default":
      return "This tag will be ignored for filtering and sorting."
    default:
      if (mode<0)
        return `These posts will be shown less often (as though their score were ${-mode} points lower).`
      else
        return `These posts will be shown more often (as though their score were ${mode} points higher).`
  }
}

function filterModeToStr(mode: FilterMode): string {
  if (typeof mode === "number") {
    if (mode>0) return `+${mode}`;
    else if (mode===0) return "";
    else return `${mode}`;
  } else switch(mode) {
    default:
    case "Default": return "";
    case "Hidden": return "-∞";
    case "Required": return "+∞";
  }
}

const FilterModeComponent = registerComponent("FilterMode", FilterModeRawComponent, {styles, hocs: [withHover()]});

declare global {
  interface ComponentTypes {
    FilterMode: typeof FilterModeComponent
  }
}
