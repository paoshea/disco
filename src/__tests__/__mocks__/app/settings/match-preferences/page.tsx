export default function MatchPreferences() {
  return (
    <div>
      <h1>Match Preferences</h1>
      <form role="form" aria-label="match preferences form">
        <label>
          Activity Types
          <select aria-label="activity types" multiple>
            <option value="hiking">Hiking</option>
            <option value="cycling">Cycling</option>
            <option value="running">Running</option>
          </select>
        </label>
        <label>
          Maximum Distance (km)
          <input type="number" aria-label="maximum distance" min="1" />
        </label>
        <label>
          Age Range
          <select aria-label="age range">
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
            <option value="46+">46+</option>
          </select>
        </label>
        <label>
          Experience Level
          <select aria-label="experience level">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Availability
          <select aria-label="availability" multiple>
            <option value="weekday_morning">Weekday Mornings</option>
            <option value="weekday_evening">Weekday Evenings</option>
            <option value="weekend">Weekends</option>
          </select>
        </label>
        <div role="alert" aria-live="polite" id="validation-errors">
          {/* Error messages will be displayed here */}
          <div className="error-message">Distance must be positive</div>
        </div>
        <button type="submit" aria-label="save preferences">
          Save Preferences
        </button>
      </form>
    </div>
  );
}
