export default function PrivacyZones() {
  return (
    <div>
      <h1>Privacy Zones</h1>
      <form>
        <label>
          Zone Name
          <input type="text" aria-label="zone name" />
        </label>
        <label>
          Zone Radius (km)
          <input type="number" aria-label="zone radius" />
        </label>
        <button type="submit">Add Zone</button>
      </form>
      <div className="privacy-zones-list">
        <div>No privacy zones defined</div>
      </div>
    </div>
  );
}
