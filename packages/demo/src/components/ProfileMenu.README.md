# ProfileMenu Component

A modern, animated profile menu component with dropdown functionality for user profile management, settings, and logout.

## Features

- **Profile Button**: Displays user avatar (or initials) with smooth animations
- **Dropdown Menu**: Contains three main sections:
  - Profile Information
  - Settings
  - Logout

### Profile Section
- View and edit user information
- Change profile photo
- Display user details (name, email, role, department)

### Settings Section
- **Appearance**: Dark mode, compact view toggles
- **Notifications**: Email and push notification settings
- **Map Settings**: Auto-refresh and label display options

### Logout
- Confirmation modal with animated overlay
- Prevents accidental logouts

## Usage

```tsx
import { ProfileMenu } from "../components/ProfileMenu";

<ProfileMenu
  username="Admin User"
  email="admin@infranexia.com"
  avatar="/path/to/avatar.jpg" // Optional
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `username` | `string` | `"Admin User"` | User's display name |
| `email` | `string` | `"admin@infranexia.com"` | User's email address |
| `avatar` | `string` | `undefined` | URL to user's avatar image (optional) |

## Styling

The component uses the same design system as the LoginView:
- **Font**: Outfit (Google Fonts)
- **Primary Color**: Red gradient (#dc2626 to #ef4444)
- **Animations**: Smooth transitions and hover effects
- **Theme**: Modern glassmorphism with backdrop blur

## Features in Detail

### Animated Dropdown
- Slides in from top with scale animation
- Expands when viewing Profile or Settings
- Closes when clicking outside

### Profile View
- Large avatar display
- Read-only fields (can be made editable)
- Change photo button
- Edit profile button

### Settings View
- Toggle switches for various settings
- Organized into sections (Appearance, Notifications, Map Settings)
- Save changes button

### Logout Confirmation
- Full-screen modal overlay with blur effect
- Animated icon and gradient border
- Cancel and Confirm buttons
- Redirects to login page on confirm

## Integration

The ProfileMenu is positioned in the top-right corner of the MapLibreView:

```tsx
<div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}>
  <ProfileMenu
    username="Admin User"
    email="admin@infranexia.com"
  />
</div>
```

## Customization

To customize the component:

1. **Colors**: Edit `ProfileMenu.css` gradient values
2. **Avatar**: Pass custom `avatar` prop
3. **User Info**: Update `username` and `email` props
4. **Settings**: Modify settings sections in `ProfileMenu.tsx`

## Dependencies

- React
- React Router (for navigation)
- CSS (ProfileMenu.css)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive)
