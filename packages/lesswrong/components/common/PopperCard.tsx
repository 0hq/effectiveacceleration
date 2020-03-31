import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import Card from '@material-ui/core/Card';
import { PopperPlacementType } from '@material-ui/core/Popper'

const PopperCard = ({children, placement="bottom-start", open, anchorEl, modifiers}: {
  children?: React.ReactNode,
  placement?: PopperPlacementType,
  open: boolean,
  anchorEl: HTMLElement|null,
  modifiers?: any,
}) => {
  return <Components.LWPopper open={open} anchorEl={anchorEl} placement={placement} modifiers={modifiers}>
    <Card>
      {children}
    </Card>
  </Components.LWPopper>
}

const PopperCardComponent = registerComponent("PopperCard", PopperCard);

declare global {
  interface ComponentTypes {
    PopperCard: typeof PopperCardComponent
  }
}
