export default function LocationSettings() {
  return (
    <div>
      <h1>Location Settings</h1>
      <form>
        <label>
          Enable Location Services
          <input type="checkbox" aria-label="enable location services" />
        </label>
        <label>
          Default Location
          <input type="text" aria-label="default location" />
        </label>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}
