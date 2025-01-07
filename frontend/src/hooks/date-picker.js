const disableDate = (dates, val) => {
    if (!dates) {
        return false;
    }
    const tooLate = dates[0] && dates[1] && val.diff(dates[1], 'days') > 1;
    return false || !!tooLate;
  };
  
  export { disableDate };
  