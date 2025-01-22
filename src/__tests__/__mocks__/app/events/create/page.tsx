export default function CreateEvent() {
  return (
    <div>
      <h1>Create Event</h1>
      <form role="form" aria-label="create event form">
        <label>
          Event Title
          <input type="text" aria-label="event title" />
        </label>
        <label>
          Event Type
          <select aria-label="event type">
            <option value="hiking">Hiking</option>
            <option value="cycling">Cycling</option>
            <option value="running">Running</option>
          </select>
        </label>
        <label>
          Description
          <textarea aria-label="description" />
        </label>
        <label>
          Search Location
          <input type="text" aria-label="search location" />
        </label>
        <label>
          Start Date
          <input type="date" aria-label="start date" />
        </label>
        <label>
          Start Time
          <input type="time" aria-label="start time" />
        </label>
        <label>
          Duration (hours)
          <input type="number" aria-label="duration" min="0.5" step="0.5" />
        </label>
        <div role="alert" aria-live="polite" id="validation-errors"></div>
        <button type="submit" aria-label="create event">Create Event</button>
      </form>
    </div>
  );
}
