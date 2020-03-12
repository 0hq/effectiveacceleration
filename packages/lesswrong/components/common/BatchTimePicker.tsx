import React from 'react';
import moment from '../../lib/moment-timezone';
import { registerComponent } from '../../lib/vulcan-lib';
import { useTimezone } from './withTimezone';
import { convertTimeOfWeekTimezone } from '../../lib/utils/timeUtil';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import * as _ from 'underscore';

// value: {timeOfDayGMT:int, dayOfWeekGMT:string}
// onChange: ({ timeOfDayGMT, dayOfWeekGMT })=>Unit
const BatchTimePicker = ({ mode, value, onChange}: {
  mode: string,
  value: any,
  onChange: any,
}) => {
  const { timezone } = useTimezone();
  const valueLocal = convertTimeOfWeekTimezone(value.timeOfDayGMT, value.dayOfWeekGMT, "GMT", timezone);
  const { timeOfDay, dayOfWeek } = valueLocal;
  
  const applyChange = (change) => {
    const newTimeLocal = { ...valueLocal, ...change };
    const newTimeGMT = convertTimeOfWeekTimezone(newTimeLocal.timeOfDay, newTimeLocal.dayOfWeek, timezone, "GMT");
    onChange({
      timeOfDayGMT: newTimeGMT.timeOfDay,
      dayOfWeekGMT: newTimeGMT.dayOfWeek,
    });
  };
  
  return <React.Fragment>
    { (mode==="daily" || mode==="weekly") && <span>
      <Select
        value={timeOfDay}
        onChange={(event) => applyChange({ timeOfDay: event.target.value })}
      >
        { _.range(24).map(hour =>
            <MenuItem key={hour} value={hour}>{hour}:00</MenuItem>
          )
        }
      </Select>
      {moment().tz(timezone).format("z")}
    </span>}
    
    { mode==="weekly" && <span>
        {" on "}
        <Select value={dayOfWeek}
          onChange={(event) => applyChange({ dayOfWeek: event.target.value })}
        >
          <MenuItem value="Sunday">Sunday</MenuItem>
          <MenuItem value="Monday">Monday</MenuItem>
          <MenuItem value="Tuesday">Tuesday</MenuItem>
          <MenuItem value="Wednesday">Wednesday</MenuItem>
          <MenuItem value="Thursday">Thursday</MenuItem>
          <MenuItem value="Friday">Friday</MenuItem>
          <MenuItem value="Saturday">Saturday</MenuItem>
        </Select>
      </span>
    }
  </React.Fragment>;
}

const BatchTimePickerComponent = registerComponent("BatchTimePicker", BatchTimePicker);

declare global {
  interface ComponentTypes {
    BatchTimePicker: typeof BatchTimePickerComponent
  }
}
