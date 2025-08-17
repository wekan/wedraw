# WeKan Meteor 3 React Components

This directory contains React components that have been converted from the original Meteor 2 Jade templates. The conversion maintains the same functionality while modernizing the codebase to use React and Meteor 3.

## Conversion Overview

### What Was Converted

- **Jade Templates (.jade)** → **React Components (.jsx)**
- **Blaze Template Helpers (.js)** → **React Hooks and State Management**
- **CSS Files** → **Combined and Modernized CSS**
- **FlowRouter** → **React Router v6**

### Key Components

#### Main Components
- `Header.jsx` - Main application header with navigation and user controls
- `Spinner.jsx` - Loading spinner component with multiple animation types
- `MyCards.jsx` - User's cards view with board and table layouts
- `GlobalSearch.jsx` - Global search functionality with results pagination
- `Popup.jsx` - Modal/popup system with management hooks

#### Board Components
- `BoardsList.jsx` - Main boards listing with filtering and organization support
- `Minicard.jsx` - Compact card display for lists and search results

#### List Components
- `List.jsx` - Individual list component with header and body
- `ListHeader.jsx` - List header with title and actions
- `ListBody.jsx` - List body containing cards

#### Swimlane Components
- `Swimlane.jsx` - Swimlane container with collapsible lists
- `SwimlaneHeader.jsx` - Swimlane header with title and controls

#### User Components
- `UserAvatar.jsx` - User avatar display with initials fallback
- `UserAvatarInitials.jsx` - SVG-based initials display
- `OrgAvatar.jsx` - Organization avatar component
- `TeamAvatar.jsx` - Team avatar component

#### Router
- `AppRouter.jsx` - Main router configuration replacing FlowRouter

## Features

### Modern React Patterns
- **Functional Components** with React Hooks
- **Custom Hooks** for reusable logic
- **Error Boundaries** for graceful error handling
- **Portal Rendering** for modals and popups

### Meteor 3 Integration
- **useTracker** for reactive data subscriptions
- **Meteor.subscribe** for data management
- **Meteor.call** for server method calls
- **Session** integration for client-side state

### Internationalization
- **Translation Support** using existing `en.i18n.json` files
- **Helper Functions** for easy text localization
- **Consistent Translation Keys** across components

### Responsive Design
- **Mobile-First** approach
- **CSS Grid** and **Flexbox** layouts
- **Media Queries** for different screen sizes
- **Touch-Friendly** interactions

### Accessibility
- **ARIA Labels** and roles
- **Keyboard Navigation** support
- **Screen Reader** compatibility
- **High Contrast** mode support
- **Reduced Motion** preferences

## Usage

### Basic Component Usage

```jsx
import Header from './components/main/Header';
import BoardsList from './components/boards/BoardsList';

function App() {
  return (
    <div className="app">
      <Header />
      <BoardsList />
    </div>
  );
}
```

### Using the Popup System

```jsx
import { usePopup } from './components/main/Popup';

function MyComponent() {
  const { openPopup, closePopup } = usePopup();

  const handleOpenPopup = () => {
    openPopup({
      title: 'My Popup',
      content: <div>Popup content here</div>,
      onClose: () => closePopup()
    });
  };

  return (
    <button onClick={handleOpenPopup}>
      Open Popup
    </button>
  );
}
```

### Using Translations

```jsx
import enTranslations from '/imports/i18n/data/en.i18n.json';

function MyComponent() {
  const t = (key) => enTranslations[key] || key;
  
  return <h1>{t('my-title')}</h1>;
}
```

## CSS Structure

### Main Styles
- `main.css` - Core application styles
- `spinner.css` - Spinner animation styles
- Component-specific CSS files where needed

### CSS Features
- **CSS Custom Properties** for theming
- **CSS Grid** for complex layouts
- **Flexbox** for component alignment
- **CSS Animations** for smooth transitions
- **Responsive Breakpoints** for mobile support

## Migration Notes

### From Jade Templates
- **Template syntax** → **JSX syntax**
- **Template helpers** → **React props and state**
- **Template events** → **React event handlers**
- **Template subscriptions** → **useTracker hooks**

### From Blaze
- **ReactiveVar** → **useState hooks**
- **Template.onCreated** → **useEffect hooks**
- **Template.helpers** → **Component props and state**
- **Template.events** → **Event handler functions**

### From FlowRouter
- **FlowRouter.go()** → **useNavigate hook**
- **FlowRouter.getParam()** → **useParams hook**
- **FlowRouter.getQueryParam()** → **useSearchParams hook**
- **Route definitions** → **React Router configuration**

## Dependencies

### Required Packages
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "meteor": "^3.0.0",
  "meteor-react-meteor-data": "^3.0.0"
}
```

### Meteor Packages
- `meteor`
- `react-meteor-data`
- `session`

## Development

### Adding New Components
1. Create the component file in the appropriate directory
2. Import necessary dependencies and translations
3. Use the `useTracker` hook for Meteor data
4. Follow the established component patterns
5. Add appropriate CSS styles

### Testing Components
- Use React Testing Library for component testing
- Test Meteor integration with mock data
- Verify accessibility features
- Test responsive behavior

### Performance Considerations
- Use `React.memo` for expensive components
- Implement proper dependency arrays in hooks
- Optimize re-renders with `useCallback` and `useMemo`
- Lazy load components when appropriate

## Browser Support

- **Modern Browsers** (Chrome 90+, Firefox 88+, Safari 14+)
- **Mobile Browsers** (iOS Safari 14+, Chrome Mobile 90+)
- **Progressive Web App** support
- **Offline** functionality with service workers

## Contributing

1. Follow the established component patterns
2. Maintain accessibility standards
3. Add appropriate TypeScript types if using TS
4. Update this README for new features
5. Test across different devices and browsers

## License

This project follows the same license as the main WeKan project.
