import React from 'react'
import PropTypes from 'prop-types'
import EmailPropTypes from '../PropTypes'
import includeDataProps from '../includeDataProps'

export default function Item(props) {
  // Bypass type system because it doesn't know "valign" is a real prop (in HTML5, it wouldn't be)
  const valignProp: any = {
    valign: props.valign
  };
  return (
    <tr>
      <td
        {...includeDataProps(props)}
        className={props.className}
        align={props.align}
        {...valignProp}
        bgcolor={props.bgcolor}
        style={props.style}
      >
        {props.children}
      </td>
    </tr>
  )
}

Item.propTypes = {
  className: PropTypes.string,
  bgcolor: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  valign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  style: EmailPropTypes.style,
  children: PropTypes.node,
}

Item.defaultProps = {
  className: undefined,
  bgcolor: undefined,
  align: undefined,
  valign: undefined,
  style: undefined,
  children: undefined,
}
