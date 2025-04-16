import {format, formatDistanceToNow, getTime, isToday, isYesterday} from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm');
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}

export function fSmartTime(date) {
  const d = new Date(date);

  if (isNaN(d)) return '';

  if (isToday(d)) {
    return format(d, "HH:mm");
  } else if (isYesterday(d)) {
    return `Yesterday ${format(d, "HH:mm")}`;
  } else {
    return format(d, "dd MMM yyyy HH:mm");
  }
}
