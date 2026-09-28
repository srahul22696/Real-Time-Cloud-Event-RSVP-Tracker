/** Pure RSVP validation and seat-allocation rules used by the local demo and tests. */
export function validateRsvp({answer, guests = 0, plusOnesAllowed = 0, deadline, now = new Date()}) {
  if (!['Going', 'Maybe', 'Not going'].includes(answer)) return {ok:false, error:'Choose Going, Maybe, or Not going.'};
  if (!Number.isSafeInteger(guests) || guests < 0 || guests > 20) return {ok:false, error:'Guest count must be a whole number from 0 to 20.'};
  if (!Number.isSafeInteger(plusOnesAllowed) || plusOnesAllowed < 0 || guests > plusOnesAllowed) return {ok:false, error:'Guest count exceeds the invite allowance.'};
  if (deadline && (!Number.isFinite(Date.parse(deadline)) || now > new Date(deadline))) return {ok:false, error:'The RSVP deadline has passed.'};
  return {ok:true};
}
export function decideSeat({capacity, confirmedGuests, requestedGuests, previousAnswer}) {
  if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > 100000) return {ok:false,error:'Invalid event capacity.'};
  if (!Number.isSafeInteger(confirmedGuests) || confirmedGuests < 0 || !Number.isSafeInteger(requestedGuests) || requestedGuests < 0) return {ok:false,error:'Invalid guest count.'};
  const alreadyCounted = previousAnswer === 'Going' ? requestedGuests : 0;
  const seatsNeeded = Math.max(0, requestedGuests - alreadyCounted);
  return confirmedGuests + seatsNeeded <= capacity
    ? {ok:true,status:'Going'}
    : {ok:true,status:'Waitlisted'};
}
export function validateEvent(input, now = new Date()) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const location = typeof input.location === 'string' ? input.location.trim() : '';
  const capacity = Number(input.capacity);
  const dateParts = typeof input.date === 'string' ? input.date.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  const validDate = Boolean(dateParts && new Date(Date.UTC(+dateParts[1], +dateParts[2]-1, +dateParts[3])).toISOString().slice(0,10) === input.date);
  const validTime = value => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
  const starts = new Date(`${input.date}T${input.time}`);
  const ends = new Date(`${input.date}T${input.end}`);
  if (title.length < 3 || title.length > 90) return {ok:false,error:'Event name must be 3–90 characters.'};
  if (!location || location.length > 180) return {ok:false,error:'Add a venue or online location under 180 characters.'};
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) return {ok:false,error:'Capacity must be a whole number from 1 to 100,000.'};
  if (!validDate || !validTime(input.time) || !validTime(input.end) || !Number.isFinite(starts.getTime()) || !Number.isFinite(ends.getTime())) return {ok:false,error:'Choose a valid date and time.'};
  if (starts <= now) return {ok:false,error:'Event must be in the future.'};
  if (ends <= starts) return {ok:false,error:'End must be after start.'};
  return {ok:true,value:{...input,title,location,capacity}};
}
