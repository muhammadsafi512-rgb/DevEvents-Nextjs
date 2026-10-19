//event dates are stored as yyyy-mm-dd , so string comparison works.
// An event is "past" from the day after its date .

export function  isPastEvent(date: string): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return date < today;
}