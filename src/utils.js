// Compare Dates function
const compareDates = (d1, d2) => {
  let date1 = new Date(d1).getTime()
  let date2 = new Date(d2).getTime()

  if (date1 >= date2) {
    return d1
  } else {
    return d2
  }
}

const isOnTime = (dueDate, shipDate) => {
  return new Date(dueDate) >= new Date(shipDate)
}

module.exports ={
  compareDates,
  isOnTime
}
