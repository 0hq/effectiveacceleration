import { registerComponent, Components} from '../../lib/vulcan-lib';
import React, {useEffect, useState} from 'react';
import { useQuery, gql } from '@apollo/client';
import moment from '../../lib/moment-timezone';

// This component is (most likely) going to be used once-a-year on Petrov Day (sept 26th)
// see this post:
// https://www.lesswrong.com/posts/vvzfFcbmKgEsDBRHh/honoring-petrov-day-on-lesswrong-in-2019

const PetrovDayWrapper = () => {
  
  const [timeTillForeignMissileArrival, setTimeTillForeignMissileArrival] = useState<number|undefined>(undefined)
  
  
  const { data: externalData } = useQuery(gql` 
    query petrovDayLaunchResolvers {
      PetrovDayCheckIfIncoming(external: true) {
        launched
        createdAt
      }
    }
  `, {
    ssr: true
  });
  
  const { data: internalData } = useQuery(gql`
    query petrovDayLaunchResolvers {
      PetrovDayCheckIfIncoming(external: false) {
        launched
        createdAt
      }
    }
  `, {
    ssr: true
  });
  
  // console.log({internal: internalData?.PetrovDayCheckIfIncoming, external: externalData?.PetrovDayCheckIfIncoming})
  
  const foreignLaunchedAt = externalData?.PetrovDayCheckIfIncoming?.createdAt
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTillForeignMissileArrival(-(moment(new Date()).diff(moment(foreignLaunchedAt).add(1, 'hour'),'seconds')))
    }, 1000);
    return () => clearInterval(interval);
  }, [foreignLaunchedAt]);
  
  const foreignMissilesHaveArrived = timeTillForeignMissileArrival && timeTillForeignMissileArrival < 0  
  
  if (foreignMissilesHaveArrived) {
    return <Components.PetrovDayLossScreen/>
  } else {
    return <Components.PetrovDayButton
      alreadyLaunched={internalData?.PetrovDayCheckIfIncoming?.launched}
      timeTillArrival={timeTillForeignMissileArrival}
    />
  }
}

const PetrovDayWrapperComponent = registerComponent('PetrovDayWrapper', PetrovDayWrapper);

declare global {
  interface ComponentTypes {
    PetrovDayWrapper: typeof PetrovDayWrapperComponent
  }
}

