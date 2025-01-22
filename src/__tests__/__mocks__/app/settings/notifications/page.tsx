export default function NotificationSettings() {
  return (
    <div>
      <h1>Notification Settings</h1>
      <form role="form" aria-label="notification settings form">
        <div>
          <h2>Notification Methods</h2>
          <label>
            <input type="checkbox" aria-label="enable push notifications" />
            Enable Push Notifications
          </label>
          <label>
            <input type="checkbox" aria-label="enable email notifications" />
            Enable Email Notifications
          </label>
        </div>

        <div>
          <h2>Notification Categories</h2>
          <label>
            <input type="checkbox" aria-label="matches notifications" />
            Matches
          </label>
          <label>
            <input type="checkbox" aria-label="messages notifications" />
            Messages
          </label>
          <label>
            <input type="checkbox" aria-label="events notifications" />
            Events
          </label>
        </div>

        <div>
          <h2>Quiet Hours</h2>
          <label>
            Start Time
            <input type="time" aria-label="quiet hours start" />
          </label>
          <label>
            End Time
            <input type="time" aria-label="quiet hours end" />
          </label>
        </div>

        <div role="alert" aria-live="polite" id="validation-errors">
          {/* Error messages will be displayed here */}
        </div>

        <button type="submit" aria-label="save notification settings">
          Save Settings
        </button>
      </form>
    </div>
  );
}
