# Notification System

This notification system is designed to work with your existing API structure and provides one-by-one notification rendering with dynamic message generation.

## Features

- **One-by-one rendering**: Notifications are displayed sequentially, not all at once
- **Dynamic message generation**: Messages are generated based on notification type and title
- **Count integration**: Uses `res.counts[notification.type]` from the API response
- **Type-based styling**: Different colors and icons for each notification type
- **Auto-dismiss**: Notifications automatically dismiss after 5 seconds
- **Manual controls**: Users can dismiss or navigate to relevant sections

## Components

### 1. `NotificationDisplay.tsx`

The main component that renders notifications. Simply include this in your app:

```tsx
import NotificationDisplay from "./components/NotificationDisplay";

function App() {
  return (
    <div>
      {/* Your app content */}
      <NotificationDisplay />
    </div>
  );
}
```

### 2. `useNotificationSystem.ts`

A custom hook that manages notification state and API calls:

```tsx
import { useNotificationSystem } from "./hooks/useNotificationSystem";

function MyComponent() {
  const {
    currentNotification,
    isLoading,
    error,
    fetchNotifications,
    handleNotificationDismiss,
    handleNotificationNavigate,
  } = useNotificationSystem();

  // Use the hook in your component
}
```

### 3. `NotificationSystem.tsx`

A complete standalone component with built-in API integration (alternative to using the hook).

## Notification Types

The system supports the following notification types from your backend:

### Ticket Notifications (Blue theme)

- `ticket_created` / `ticket_opened` - New ticket created
- `ticket_assigned` - Ticket assigned to user
- `ticket_reopened` - Ticket reopened for review

### Task Notifications (Red theme)

- `task_created` - New task created
- `task_approved` - Task approved and completed
- `task_rejected` - Task rejected and needs changes
- `task_submitted` - Task submitted for review

### Staff Request Notifications (Green theme)

- `staff_request_created` - New staff request created
- `staff_request_resolved` - Staff request resolved

## Message Generation

Messages are automatically generated based on the notification type and title. The `title` field contains the dynamic content (like "I Have A Problem"), while the `type` field determines the message template. For example:

- `type: "ticket_created"`, `title: "I Have A Problem"` → `"A new ticket has been created: 'I Have A Problem'."`
- `type: "task_created"`, `title: "Update Documentation"` → `"A new task has been created: 'Update Documentation'."`
- `type: "staff_request_created"`, `title: "New Employee: John Smith"` → `"A new staff request has been created: 'New Employee: John Smith'."`

## API Integration

The system expects a `NotificationResponse` with this structure:

```typescript
interface NotificationResponse {
  data: {
    notifications: AppNotification[];
    counts: { [key: string]: number };
  };
}

interface AppNotification {
  id: string;
  type:
    | "staff_request_created"
    | "staff_request_resolved"
    | "task_created"
    | "task_approved"
    | "task_rejected"
    | "task_submitted"
    | "ticket_assigned"
    | "ticket_created"
    | "ticket_reopened"
    | "ticket_opened";
  title: string;
  createdAt: string;
  updatedAt: string;
}
```

## Usage Examples

### Basic Usage

```tsx
import NotificationDisplay from "./components/NotificationDisplay";

function App() {
  return (
    <div>
      <h1>My App</h1>
      <NotificationDisplay />
    </div>
  );
}
```

### With Custom Handlers

```tsx
import { useNotificationSystem } from "./hooks/useNotificationSystem";

function MyComponent() {
  const {
    currentNotification,
    handleNotificationNavigate,
    handleNotificationDismiss,
  } = useNotificationSystem();

  const handleCustomNavigate = () => {
    if (currentNotification) {
      // Custom navigation logic
      router.push(`/dashboard/${currentNotification.type}`);
      handleNotificationNavigate();
    }
  };

  return <div>{/* Your component content */}</div>;
}
```

## Styling

The system uses Tailwind CSS classes and includes:

- Fade-in animations for the modal
- Scale-in animations for the notification card
- Responsive design for mobile and desktop
- Color-coded borders and buttons based on notification type

## Customization

You can customize the notification system by:

1. **Modifying message generation**: Edit the `generateNotificationMessage` function
2. **Adding new notification types**: Update the type definitions and configuration objects
3. **Changing styling**: Modify the `getNotificationConfig` function
4. **Adjusting timing**: Change the auto-dismiss timeout in the hook

## Dependencies

- React 18+
- Tailwind CSS
- Your existing API service (`NotificationService.getAll()`)
