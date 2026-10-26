// Date rules the desk pages share, so a count on the Desk always matches the page it links to.

type ClosingDate = { closingDate: string | null }
type Shift = { status: 'planned' | 'in_progress' | 'done'; startsAt: string | null }

// The public list drops an opportunity the day after its closing date, even while it is still open here.
export function pastClosing(item: ClosingDate) {
  if (!item.closingDate) return false
  return new Date(item.closingDate).toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)
}

// What the volunteer form lists: open, public and not past its closing date.
export function onVolunteerForm(item: ClosingDate & { status: 'open' | 'closed'; public: boolean }) {
  return item.status === 'open' && item.public && !pastClosing(item)
}

// A shift whose start time has passed but that nobody marked done.
export function overdue(item: Shift) {
  return item.status !== 'done' && item.startsAt !== null && new Date(item.startsAt).getTime() < Date.now()
}

// Still to happen: not done and not overdue. Shifts with no start time count here until they are done.
export function comingUp(item: Shift) {
  return item.status !== 'done' && !overdue(item)
}
