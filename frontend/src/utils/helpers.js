export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  return new Date(dateTimeStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export const frequencyLabel = (freq) => {
  const map = {
    ONCE_DAILY: 'Once Daily',
    TWICE_DAILY: 'Twice Daily',
    THREE_TIMES_DAILY: 'Three Times Daily',
    FOUR_TIMES_DAILY: 'Four Times Daily',
    EVERY_8_HOURS: 'Every 8 Hours',
    EVERY_12_HOURS: 'Every 12 Hours',
    AS_NEEDED: 'As Needed',
  }
  return map[freq] || freq
}

export const extractErrorMessage = (err, defaultMsg) => {
  const resData = err.response?.data
  if (resData) {
    if (resData.message === "Validation failed" && resData.data) {
      return Object.values(resData.data).join('. ')
    }
    return resData.message || defaultMsg
  }
  return defaultMsg
}
