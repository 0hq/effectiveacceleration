import React, { useState, useEffect } from 'react';
import { Components, registerComponent } from '../../../lib/vulcan-lib';
import withErrorBoundary from '../../common/withErrorBoundary'
import { isServer } from '../../../lib/executionEnvironment';
import { useNavigation } from '../../../lib/routeUtil';
import type { ToCData } from '../../../server/tableOfContents';

const topSection = "top";

const TableOfContentsList = ({sectionData, title, onClickSection, drawerStyle}: {
  sectionData: ToCData,
  title: string|null,
  onClickSection?: ()=>void,
  drawerStyle: boolean,
}) => {
  const [currentSection,setCurrentSection] = useState<string|null>(topSection);
  const [drawerOpen,setDrawerOpen] = useState(false);
  const { history } = useNavigation();

  useEffect(() => {
    window.addEventListener('scroll', updateHighlightedSection);
    updateHighlightedSection();
    
    return () => {
      window.removeEventListener('scroll', updateHighlightedSection);
    };
  });


  // Return the screen-space current section mark - that is, the spot on the
  // screen where the current-post will transition when its heading passes.
  const getCurrentSectionMark = () => {
    return window.innerHeight/3
  }

  // Return the screen-space Y coordinate of an anchor. (Screen-space meaning
  // if you've scrolled, the scroll is subtracted from the effective Y
  // position.)
  const getAnchorY = (anchorName: string): number|null => {
    let anchor = window.document.getElementById(anchorName);
    if (anchor) {
      let anchorBounds = anchor.getBoundingClientRect();
      return anchorBounds.top + (anchorBounds.height/2);
    } else {
      return null
    }
  }

  const jumpToAnchor = (anchor: string, ev: MouseEvent|null) => {
    if (isServer) return;

    const anchorY = getAnchorY(anchor);
    if (anchorY !== null) {
      history.push(`#${anchor}`)
      let sectionYdocumentSpace = anchorY + window.scrollY;
      jumpToY(sectionYdocumentSpace, ev);
    }
  }

  const jumpToY = (y: number, ev: MouseEvent|null) => {
    if (isServer) return;

    if (ev && (ev.button>0 || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.metaKey))
      return;

    if (onClickSection) {
      onClickSection();
    }
    try {
      window.scrollTo({
        top: y - getCurrentSectionMark() + 1,
        behavior: "smooth"
      });

      if (ev) ev.preventDefault();
    } catch(e) {
      // eslint-disable-next-line no-console
      console.warn("scrollTo not supported, using link fallback", e)
    }
  }

  const updateHighlightedSection = () => {
    let newCurrentSection = getCurrentSection();
    if(newCurrentSection !== currentSection) {
      setCurrentSection(newCurrentSection);
    }
  }

  const getCurrentSection = (): string|null => {
    const sections = sectionData?.sections

    if (isServer)
      return null;
    if (!sections)
      return null;

    // The current section is whichever section a spot 1/3 of the way down the
    // window is inside. So the selected section is the section whose heading's
    // Y is as close to the 1/3 mark as possible without going over.
    let currentSectionMark = getCurrentSectionMark();

    let currentSection: string|null = null;
    for(let i=0; i<sections.length; i++)
    {
      let sectionY = getAnchorY(sections[i].anchor);

      if(sectionY && sectionY < currentSectionMark)
        currentSection = sections[i].anchor;
    }

    if (currentSection === null) {
      // Was above all the section headers, so return the special "top" section
      return topSection;
    }

    return currentSection;
  }
  
  const { TableOfContentsRow, AnswerTocRow } = Components;

  if (!sectionData)
    return <div/>

  return <div>
    <TableOfContentsRow key="postTitle"
      href="#"
      onClick={ev => jumpToY(0, ev)}
      highlighted={currentSection === topSection}
      title
    >
      {title?.trim()}
    </TableOfContentsRow>
    
    {sectionData?.sections && sectionData.sections.map((section, index) => {
      return (
        <TableOfContentsRow
          key={section.anchor}
          indentLevel={section.level}
          divider={section.divider}
          highlighted={section.anchor === currentSection}
          href={"#"+section.anchor}
          onClick={(ev) => jumpToAnchor(section.anchor, ev)}
          answer={!!section.answer}
        >
          {section.answer
            ? <AnswerTocRow answer={section.answer} />
            : <span>{section.title?.trim()}</span>
          }
        </TableOfContentsRow>
      )
    })}
  </div>
}

const TableOfContentsListComponent = registerComponent(
  "TableOfContentsList", TableOfContentsList, {
    hocs: [withErrorBoundary]
  }
);

declare global {
  interface ComponentTypes {
    TableOfContentsList: typeof TableOfContentsListComponent
  }
}
