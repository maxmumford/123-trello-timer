export class Helpers {  
  
  public static secondsBetweenDates(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 1000)
  }

  public static secondsToClock(seconds){
    let clock = Helpers.secondsToHoursMinutesSeconds(seconds)
    let ret = ""

    if (clock.hours > 0) 
        ret += "" + clock.hours + ":" + (clock.minutes < 10 ? "0" : "")

    ret += "" + clock.minutes + ":" + (clock.seconds < 10 ? "0" : "")
    ret += "" + clock.seconds
    return ret
  }

  public static secondsToDurationFriendly(seconds){
    let clock = Helpers.secondsToHoursMinutesSeconds(seconds)
    let ret = ""

    if(clock.seconds && !clock.minutes && !clock.hours)
      return clock.seconds + " seconds"
    
    else if(clock.minutes && !clock.hours)
      return clock.minutes + " minutes"

    else(clock.hours)
      return clock.hours + " hours " + clock.minutes + " mins"
  }

  private static secondsToHoursMinutesSeconds(seconds: number): {hours: number, minutes: number, seconds: number} {
    return {
      hours: ~~(seconds / 3600),
      minutes: ~~((seconds % 3600) / 60),
      seconds: seconds % 60
    }
  }

}
