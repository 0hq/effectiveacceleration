import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import classNames from 'classnames';
import withUser from '../common/withUser';
import Sentry from '@sentry/core';
import { isServer } from '../../lib/executionEnvironment';

const scrollIndicatorColor = "#ddd";
const scrollIndicatorHoverColor = "#888";

const styles = (theme: ThemeType): JssStyles => ({
  scrollIndicatorWrapper: {
    display: "block",
    position: "relative",
    
    paddingLeft: 13,
    paddingRight: 13,
  },
  
  hidden: {
    display: "none !important",
  },
  
  scrollIndicator: {
    position: "absolute",
    top: "50%",
    marginTop: -28,
    cursor: "pointer",
    
    // Scroll arrows use the CSS Triangle hack - see
    // https://css-tricks.com/snippets/css/css-triangle/ for a full explanation
    borderTop: "20px solid transparent",
    borderBottom: "20px solid transparent",
  },
  
  scrollIndicatorLeft: {
    left: 0,
    borderRight: "10px solid "+scrollIndicatorColor,
    
    "&:hover": {
      borderRight: "10px solid "+scrollIndicatorHoverColor,
    },
  },
  
  scrollIndicatorRight: {
    right: 0,
    borderLeft: "10px solid "+scrollIndicatorColor,
    
    "&:hover": {
      borderLeft: "10px solid "+scrollIndicatorHoverColor,
    },
  },
  
  scrollableLaTeX: {
    // Cancel out the margin created by the block elements above and below,
    // so that we can convert them into padding and get a larger touch
    // target.
    // !important to take precedence over .mjx-chtml
    marginTop: "-1em !important",
    marginBottom: "-1em !important",
    
    paddingTop: "2em !important",
    paddingBottom: "2em !important",
    
    // Hide the scrollbar (on browsers that support it) because our scroll
    // indicator is better
    "-ms-overflow-style": "-ms-autohiding-scrollbar",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  }
});

interface ContentItemBodyProps extends WithStylesProps {
  dangerouslySetInnerHTML: { __html: string },
  className?: string,
  description?: string,
}
interface ContentItemBodyState {
  updatedElements: boolean,
}

// The body of a post/comment/etc, created by taking server-side-processed HTML
// out of the result of a GraphQL query and adding some decoration to it. In
// particular, if this is the client-side render, adds scroll indicators to
// horizontally-scrolling LaTeX blocks.
//
// This doesn't apply styling (other than for the decorators it adds) because
// it's shared between entity types, which have styling that differs.
//
// Props:
//    className <string>: Name of an additional CSS class to apply to this element.
//    dangerouslySetInnerHTML: Follows the same convention as
//      dangerouslySetInnerHTML on a div, ie, you set the HTML content of this
//      by passing dangerouslySetInnerHTML={{__html: "<p>foo</p>"}}.
//    description: (Optional) A human-readable string describing where this
//      content came from. Used in error logging only, not displayed to users.
class ContentItemBody extends Component<ContentItemBodyProps,ContentItemBodyState> {
  bodyRef: any
  replacedElements: Array<any>
  
  constructor(props: ContentItemBodyProps) {
    super(props);
    this.bodyRef = React.createRef();
    this.replacedElements = [];
    this.state = {updatedElements:false}
  }

  componentDidMount () {
    this.applyLocalModifications();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dangerouslySetInnerHTML?.__html !== this.props.dangerouslySetInnerHTML?.__html) {
      this.replacedElements = [];
      this.applyLocalModifications();
    }
  }
  
  applyLocalModifications() {
    try {
      this.markScrollableLaTeX();
      this.markHoverableLinks();
      this.markElicitBlocks();
      this.setState({updatedElements: true})
    } catch(e) {
      // Don't let exceptions escape from here. This ensures that, if client-side
      // modifications crash, the post/comment text still remains visible.
      Sentry.captureException(e);
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
  
  render() {
    return (<React.Fragment>
      <div
        className={this.props.className}
        ref={this.bodyRef}
        dangerouslySetInnerHTML={this.props.dangerouslySetInnerHTML}
      />
      {
        this.replacedElements.map(replaced => {
          return ReactDOM.createPortal(
            replaced.replacementElement,
            replaced.container
          );
        })
      }
    </React.Fragment>);
  }
  
  // Given an HTMLCollection, return an array of the elements inside it. Note
  // that this is covering for a browser-specific incompatibility: in Edge 17
  // and earlier, HTMLCollection has `length` and `item` but isn't iterable.
  htmlCollectionToArray(collection) {
    if (!collection) return [];
    let ret: Array<any> = [];
    for (let i=0; i<collection.length; i++)
      ret.push(collection.item(i));
    return ret;
  }
  
  // Find LaTeX elements inside the body, check whether they're wide enough to
  // need horizontal scroll, and if so, give them
  // `classes.hasHorizontalScroll`. 1They will have a scrollbar regardless;
  // this gives them additional styling which makes the scrollability
  // obvious, if your browser hides scrollbars like Mac does and most
  // mobile browsers do).
  // This is client-only because it requires measuring widths.
  markScrollableLaTeX = () => {
    const { classes } = this.props;
    
    if(!isServer && this.bodyRef && this.bodyRef.current) {
      let latexBlocks = this.htmlCollectionToArray(this.bodyRef.current.getElementsByClassName("mjx-chtml"));
      for(let i=0; i<latexBlocks.length; i++) {
        let latexBlock = latexBlocks[i];
        if (!latexBlock.classList.contains("MJXc-display")) {
          // Skip inline LaTeX
          continue;
        }
        latexBlock.className += " " + classes.scrollableLaTeX;
        if(latexBlock.scrollWidth > latexBlock.clientWidth) {
          this.addHorizontalScrollIndicators(latexBlock);
        }
      }
    }
  }
  
  // Given an HTML block element which has horizontal scroll, give it scroll
  // indicators: left and right arrows that tell you scrolling is possible.
  // That is, wrap it in this DOM structure and replce it in-place in the
  // browser DOM:
  //
  //   <div class={classes.scrollIndicatorWrapper}>
  //     <div class={classes.scrollIndicator,classes.scrollIndicatorLeft}/>
  //     {block}
  //     <div class={classes.scrollIndicator,classes.scrollIndicatorRight}/>
  //   </div>
  //
  // Instead of doing it with React, we do it with legacy DOM APIs, because
  // this needs to work when we take some raw non-REACT HTML from the database,
  // rather than working in a normal React-component-tree context.
  //
  // Attaches a handler to `block.onscrol` which shows and hides the scroll
  // indicators when it's scrolled all the way.
  addHorizontalScrollIndicators = (block) => {
    const { classes } = this.props;
    
    // If already wrapped, don't re-wrap (so this is idempotent).
    if (block.parentElement && block.parentElement.className === classes.scrollIndicatorWrapper)
      return;
    
    const scrollIndicatorWrapper = document.createElement("div");
    scrollIndicatorWrapper.className = classes.scrollIndicatorWrapper;
    
    const scrollIndicatorLeft = document.createElement("div");
    scrollIndicatorWrapper.append(scrollIndicatorLeft);
    
    block.parentElement.insertBefore(scrollIndicatorWrapper, block);
    block.remove();
    scrollIndicatorWrapper.append(block);
    
    const scrollIndicatorRight = document.createElement("div");
    scrollIndicatorWrapper.append(scrollIndicatorRight);
    
    // Update scroll indicator classes, either for the first time (when newly
    // constructed) or when we've scrolled. We apply `classes.hidden` when the
    // scroll position is within 1px (exclusive) of an edge, rather than when
    // it's exactly at an edge, because in at least one tested browser (Chrome
    // on Windows) scrolling actually stopped a fraction of a pixel short of
    // where `scrollWidth` said it would.
    const updateScrollIndicatorClasses = () => {
      scrollIndicatorLeft.className = classNames(
        classes.scrollIndicator, classes.scrollIndicatorLeft,
        { [classes.hidden]: block.scrollLeft < 1 });
      scrollIndicatorRight.className = classNames(
        classes.scrollIndicator, classes.scrollIndicatorRight,
        { [classes.hidden]: block.scrollLeft+block.clientWidth+1 > block.scrollWidth });
    }
    
    scrollIndicatorLeft.onclick = (ev) => {
      block.scrollLeft = Math.max(block.scrollLeft-block.clientWidth, 0);
    };
    scrollIndicatorRight.onclick = (ev) => {
      block.scrollLeft += Math.min(block.scrollLeft+block.clientWidth, block.scrollWidth-block.clientWidth);
    };
    
    updateScrollIndicatorClasses();
    block.onscroll = (ev) => updateScrollIndicatorClasses();
  };
  
  markHoverableLinks = () => {
    if(this.bodyRef?.current) {
      const linkTags = this.htmlCollectionToArray(this.bodyRef.current.getElementsByTagName("a"));
      for (let linkTag of linkTags) {
        const tagContentsHTML = linkTag.innerHTML;
        const href = linkTag.getAttribute("href");
        const id = linkTag.getAttribute("id");
        const rel = linkTag.getAttribute("rel")
        const replacementElement = <Components.HoverPreviewLink href={href} innerHTML={tagContentsHTML} contentSourceDescription={this.props.description} id={id} rel={rel}/>
        this.replaceElement(linkTag, replacementElement);
      }
    }
  }

  markElicitBlocks = () => {
    if(this.bodyRef?.current) {
      const elicitBlocks = this.htmlCollectionToArray(this.bodyRef.current.getElementsByClassName("elicit-binary-prediction"));
      for (const elicitBlock of elicitBlocks) {
        if (elicitBlock.dataset?.elicitId) {
          const replacementElement = <Components.ElicitBlock questionId={elicitBlock.dataset.elicitId}/>
          this.replaceElement(elicitBlock, replacementElement)
        }
        
      }
    }
  }
  
  replaceElement = (replacedElement, replacementElement) => {
    const replacementContainer = document.createElement("span");
    this.replacedElements.push({
      replacementElement: replacementElement,
      container: replacementContainer,
    });
    replacedElement.parentElement.replaceChild(replacementContainer, replacedElement);
  }
}

const ContentItemBodyComponent = registerComponent('ContentItemBody', ContentItemBody, {
  styles, hocs: [withUser]
});

declare global {
  interface ComponentTypes {
    ContentItemBody: typeof ContentItemBodyComponent
  }
}
