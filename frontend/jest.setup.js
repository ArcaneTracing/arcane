require('@testing-library/jest-dom')

// React 19: Configure default onRecoverableError to suppress recoverable error reporting in tests
// React 19 recovers errors during concurrent rendering, but reports them by default.
// In tests, we want to suppress these reports since they're expected and React recovers them.
if (typeof globalThis.reportError === 'undefined') {
  globalThis.reportError = jest.fn((error) => {
    // Suppress recoverable errors in tests - React 19 will recover them
    const msg = (error && error.message) || String(error || '')
    if (msg.includes('concurrent rendering') && msg.includes('recover')) {
      return // Suppress React 19 recoverable error reports
    }
    // For other errors, throw to maintain normal error behavior
    throw error
  })
}

// Mock import.meta.env for Vite - must be defined before any imports
// This is a workaround for Jest not supporting import.meta syntax
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        MODE: 'test',
        VITE_BACKEND_URL: 'http://localhost:8085',
        VITE_BASE_URL: '/',
        PROD: false,
        DEV: true,
      },
    },
  },
  writable: true,
  configurable: true,
})

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream } = require('stream/web')

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream
}

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Mock Request/Response for Next.js API routes
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor() {}
  }
}
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor() {}
  }
}

// Mock @tanstack/react-router
const mockNavigate = jest.fn()
const mockUseParams = jest.fn(() => ({}))
const mockUseLocation = jest.fn(() => ({ pathname: '/' }))
const mockUseSearch = jest.fn(() => ({}))

jest.mock('@tanstack/react-router', () => {
  const React = require('react')
  return {
    useNavigate: jest.fn(() => mockNavigate),
    useParams: jest.fn(() => mockUseParams()),
    useLocation: jest.fn(() => mockUseLocation()),
    useSearch: jest.fn(() => mockUseSearch()),
    Link: ({ children, to, params, ...props }) => {
      return React.createElement('a', { href: to, ...props }, children)
    },
  }
})

// Export mocks for use in tests
global.mockNavigate = mockNavigate
global.mockUseParams = mockUseParams
global.mockUseLocation = mockUseLocation
global.mockUseSearch = mockUseSearch

// Mock auth store
jest.mock('@/store/authStore', () => ({
  useAuthProfile: jest.fn(() => ({ email: 'test@example.com', name: 'Test User' })),
  useAuthName: jest.fn(() => 'Test User'),
  useAuthEmail: jest.fn(() => 'test@example.com'),
  useAuthPicture: jest.fn(() => undefined),
  useSetAuthProfile: jest.fn(() => jest.fn()),
  useLogout: jest.fn(() => jest.fn()),
  default: jest.fn(() => ({
    profile: { email: 'test@example.com', name: 'Test User' },
    setProfile: jest.fn(),
    logout: jest.fn(),
  })),
}))

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    data: { loggedIn: true, profile: { email: 'test@example.com', name: 'Test User' } },
    isLoading: false,
    error: null,
  })),
  useIsAuthenticated: jest.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    profile: { email: 'test@example.com', name: 'Test User' },
    error: null,
  })),
}))

// Mock better-auth client to avoid ESM import issues in Jest
jest.mock('@/lib/better-auth', () => ({
  authClient: {
    useSession: jest.fn(() => ({
      data: { user: { id: 'user-1' } },
      isLoading: false,
    })),
  },
}))

// Mock permissions to avoid QueryClient requirements in tests
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(() => ({
    permissions: { instance: [], organisation: [], project: [], all: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    hasPermission: jest.fn(() => true),
    hasAnyPermission: jest.fn(() => true),
    hasAllPermissions: jest.fn(() => true),
    isSuperAdmin: jest.fn(() => false),
  })),
  useHasPermission: jest.fn(() => true),
  useIsSuperAdmin: jest.fn(() => false),
}))

// Mock organisation helpers to avoid missing organisation errors
jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationId: jest.fn(() => 'org-1'),
  useOrganisationIdOrNull: jest.fn(() => 'org-1'),
}))

// Note: next/image and next/link removed - we use regular <img> tags and TanStack Router Link now

// Mock lucide-react icons
const createMockIcon = (name) => ({ className, ...props }) => {
  const React = require('react')
  return React.createElement('svg', { 
    'data-testid': `icon-${name.toLowerCase()}`, 
    className,
    ...props 
  })
}

jest.mock('lucide-react', () => {
  const icons = [
    'Loader2', 'ChevronLeft', 'ChevronRight', 'ChevronsLeft', 'ChevronsRight',
    'Search', 'Pencil', 'Trash2', 'ArrowRight', 'ArrowLeft', 'ArrowUpCircle', 'LogOut', 'Settings', 'Edit',
    'CalendarIcon', 'ClockIcon',
    'Folder', 'Database', 'FileText', 'FlaskConical', 'ClipboardCheck',
    'BarChart3', 'Play', 'Users', 'UserPlus', 'UserCog', 'Eye', 'EyeOff', 'MessageCircle', 'Info', 'Plus',
    'ChevronDown', 'ChevronsUpDown', 'MoreHorizontal', 'X', 'Plus', 'ChevronUp', 'Check', 'Circle', 'Copy',
    'Download', 'Upload', 'AlertCircle', 'FileText', 'AlertTriangle', 'Shield', 'Building2',
    'Brain', 'Wrench', 'Layers', 'ShieldAlert', 'CheckCircle2', 'Bot', 'CheckCircle',
    'GripVertical', 'Workflow', 'Filter', 'Link', 'ExternalLink'
  ]
  const mockIcons = {}
  icons.forEach(icon => {
    mockIcons[icon] = createMockIcon(icon)
  })
  return mockIcons
})

// Mock Radix UI components
jest.mock('@radix-ui/react-dropdown-menu', () => {
  const React = require('react')
  const createPrimitive = (name, element = 'div') => {
    const Component = React.forwardRef(({ children, ...props }, ref) => {
      return React.createElement(element, { ref, ...props }, children)
    })
    Component.displayName = name
    return Component
  }
  
  const DropdownMenuPrimitive = {
    Root: ({ children, open, onOpenChange }) => {
      return React.createElement('div', { 'data-testid': 'dropdown-menu', 'data-open': open }, children)
    },
    Trigger: createPrimitive('DropdownMenuTrigger', 'button'),
    Content: createPrimitive('DropdownMenuContent'),
    Item: createPrimitive('DropdownMenuItem'),
    Separator: createPrimitive('DropdownMenuSeparator', 'hr'),
    SubTrigger: createPrimitive('DropdownMenuSubTrigger'),
    SubContent: createPrimitive('DropdownMenuSubContent'),
    Group: createPrimitive('DropdownMenuGroup'),
    Portal: ({ children }) => children,
    Sub: ({ children }) => children,
    RadioGroup: createPrimitive('DropdownMenuRadioGroup'),
    RadioItem: createPrimitive('DropdownMenuRadioItem'),
    CheckboxItem: createPrimitive('DropdownMenuCheckboxItem'),
    Label: createPrimitive('DropdownMenuLabel'),
    ItemIndicator: createPrimitive('DropdownMenuItemIndicator'),
  }
  DropdownMenuPrimitive.Root.displayName = 'DropdownMenuRoot'
  return DropdownMenuPrimitive
})

jest.mock('@radix-ui/react-dialog', () => {
  const React = require('react')
  const createPrimitive = (name, element = 'div') => {
    const Component = React.forwardRef(({ children, ...props }, ref) => {
      return React.createElement(element, { ref, ...props }, children)
    })
    Component.displayName = name
    return Component
  }
  
  // Store onOpenChange callbacks - use WeakMap to avoid memory leaks
  const dialogCallbacks = new WeakMap()
  
  const DialogPrimitive = {
    Root: ({ children, open, onOpenChange }) => {
      // Store onOpenChange in a ref-like object that Trigger can access
      const dialogRef = React.useRef({ onOpenChange })
      dialogRef.current.onOpenChange = onOpenChange
      dialogCallbacks.set(dialogRef.current, onOpenChange)
      
      // Always render children, but conditionally render content based on open state
      const childrenArray = React.Children.toArray(children)
      const trigger = childrenArray.find((child) => {
        if (!React.isValidElement(child)) return false
        const childType = child.type
        return childType && (childType.displayName === 'DialogTrigger' || childType.name === 'DialogTrigger')
      })
      const content = childrenArray.filter((child) => {
        if (!React.isValidElement(child)) return true
        const childType = child.type
        return !childType || (childType.displayName !== 'DialogTrigger' && childType.name !== 'DialogTrigger')
      })
      
      // Clone trigger to pass dialogRef
      const triggerWithRef = React.isValidElement(trigger) 
        ? React.cloneElement(trigger, { 'data-dialog-ref': dialogRef.current })
        : trigger
      
      return React.createElement(React.Fragment, {},
        triggerWithRef,
        open && React.createElement('div', { 'data-testid': 'dialog', 'data-open': open }, content)
      )
    },
    Trigger: React.forwardRef(({ children, onClick, asChild, 'data-dialog-ref': dialogRef, ...props }, ref) => {
      const handleClick = (e) => {
        e.stopPropagation()
        // Get onOpenChange from dialogRef or find it from parent
        let onOpenChange = null
        if (dialogRef && dialogRef.onOpenChange) {
          onOpenChange = dialogRef.onOpenChange
        } else {
          // Try to find it from the closest dialog root
          const root = e.target.closest('[data-dialog-root]')
          if (root && root.onOpenChange) {
            onOpenChange = root.onOpenChange
          }
        }
        
        if (onOpenChange) {
          // Call onOpenChange synchronously - React Testing Library will handle the state update
          onOpenChange(true)
        }
        if (onClick) onClick(e)
      }
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { onClick: handleClick, ref, 'data-dialog-ref': dialogRef })
      }
      return React.createElement('button', { ref, onClick: handleClick, 'data-dialog-ref': dialogRef, ...props }, children)
    }),
    Content: createPrimitive('DialogContent'),
    Overlay: createPrimitive('DialogOverlay'),
    Header: createPrimitive('DialogHeader'),
    Title: createPrimitive('DialogTitle', 'h2'),
    Description: createPrimitive('DialogDescription', 'p'),
    Footer: createPrimitive('DialogFooter'),
    Close: createPrimitive('DialogClose', 'button'),
    Portal: ({ children }) => children,
  }
  DialogPrimitive.Root.displayName = 'DialogRoot'
  DialogPrimitive.Trigger.displayName = 'DialogTrigger'
  return DialogPrimitive
})

jest.mock('@radix-ui/react-alert-dialog', () => {
  const React = require('react')
  const createPrimitive = (name, element = 'div') => {
    const Component = React.forwardRef(({ children, ...props }, ref) => {
      return React.createElement(element, { ref, ...props }, children)
    })
    Component.displayName = name
    return Component
  }
  
  const alertDialogCallbacks = new WeakMap()
  
  const AlertDialogPrimitive = {
    Root: ({ children, open, onOpenChange }) => {
      const dialogRef = React.useRef()
      React.useEffect(() => {
        if (dialogRef.current && onOpenChange) {
          alertDialogCallbacks.set(dialogRef.current, onOpenChange)
        }
      }, [onOpenChange])
      if (!open) return null
      // Clone children to pass onOpenChange callback
      const childrenWithCallback = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 'data-alert-onopenchange': onOpenChange })
        }
        return child
      })
      return React.createElement('div', { ref: dialogRef, 'data-testid': 'alert-dialog', 'data-open': open }, childrenWithCallback)
    },
    Trigger: createPrimitive('AlertDialogTrigger', 'button'),
    Content: createPrimitive('AlertDialogContent'),
    Overlay: createPrimitive('AlertDialogOverlay'),
    Header: createPrimitive('AlertDialogHeader'),
    Title: createPrimitive('AlertDialogTitle', 'h2'),
    Description: createPrimitive('AlertDialogDescription', 'p'),
    Footer: createPrimitive('AlertDialogFooter'),
    Action: createPrimitive('AlertDialogAction', 'button'),
    Cancel: React.forwardRef(({ children, onClick, 'data-alert-onopenchange': onOpenChange, ...props }, ref) => {
      const handleClick = (e) => {
        if (onOpenChange) {
          onOpenChange(false)
        }
        if (onClick) onClick(e)
      }
      return React.createElement('button', { ref, onClick: handleClick, ...props }, children)
    }),
    Portal: ({ children }) => children,
  }
  AlertDialogPrimitive.Root.displayName = 'AlertDialogRoot'
  return AlertDialogPrimitive
})

jest.mock('@radix-ui/react-select', () => {
  const React = require('react')
  const createPrimitive = (name, element = 'div') => {
    const Component = React.forwardRef(({ children, ...props }, ref) => {
      return React.createElement(element, { ref, ...props }, children)
    })
    Component.displayName = name
    return Component
  }
  
  const SelectPrimitive = {
    Root: ({ children, value, onValueChange }) => {
      // Store onValueChange in a way that SelectItem can access it
      // Use a shared object that both Root and Item can access
      const selectContext = React.useMemo(() => ({ onValueChange, value }), [onValueChange, value])
      
      // Clone children to pass selectContext
      const clonedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 'data-select-ref': selectContext })
        }
        return child
      })
      
      return React.createElement('div', { 'data-testid': 'select', 'data-value': value }, clonedChildren)
    },
    Trigger: createPrimitive('SelectTrigger', 'button'),
    Content: ({ children, 'data-select-ref': selectRef, ...props }) => {
      // Pass data-select-ref to Viewport (which wraps Items) and down to Item children
      const clonedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type?.displayName === 'SelectViewport') {
          const viewportChildren = React.Children.map(child.props.children, (grandchild) => {
            if (React.isValidElement(grandchild)) {
              return React.cloneElement(grandchild, { 'data-select-ref': selectRef })
            }
            return grandchild
          })
          return React.cloneElement(child, {}, viewportChildren)
        }
        return child
      })
      return React.createElement('div', { ...props }, clonedChildren)
    },
    Item: React.forwardRef(({ children, value: itemValue, 'data-select-ref': selectRef, ...props }, ref) => {
      const handleClick = () => {
        if (selectRef && selectRef.onValueChange) {
          selectRef.onValueChange(itemValue)
        }
      }
      return React.createElement('div', { ref, onClick: handleClick, 'data-select-value': itemValue, ...props }, children)
    }),
    ItemText: createPrimitive('SelectItemText'),
    ItemIndicator: createPrimitive('SelectItemIndicator'),
    Value: createPrimitive('SelectValue'),
    Icon: Object.assign(
      React.forwardRef(({ asChild, children, ...props }, ref) => {
        return React.createElement('span', { ref, ...props }, children)
      }),
      { displayName: 'SelectIcon' }
    ),
    Viewport: createPrimitive('SelectViewport'),
    Group: createPrimitive('SelectGroup'),
    Label: createPrimitive('SelectLabel'),
    Separator: createPrimitive('SelectSeparator', 'hr'),
    ScrollUpButton: createPrimitive('SelectScrollUpButton', 'button'),
    ScrollDownButton: createPrimitive('SelectScrollDownButton', 'button'),
    Portal: ({ children }) => children,
  }
  SelectPrimitive.Item.displayName = 'SelectItem'
  SelectPrimitive.Root.displayName = 'SelectRoot'
  return SelectPrimitive
})

jest.mock('@radix-ui/react-tooltip', () => {
  const React = require('react')
  const createPrimitive = (name, element = 'div') => {
    const Component = React.forwardRef(({ children, sideOffset, className, ...props }, ref) => {
      // Filter out non-DOM props
      return React.createElement(element, { ref, className, ...props }, children)
    })
    Component.displayName = name
    return Component
  }
  
  return {
    Provider: ({ children }) => children,
    Root: ({ children }) => {
      // Render children directly - tooltip content will be rendered but may not be visible in tests
      return React.createElement(React.Fragment, {}, children)
    },
    Trigger: React.forwardRef(({ children, asChild, ...props }, ref) => {
      // Filter out asChild prop
      const { asChild: _, ...restProps } = props
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { ref, ...restProps })
      }
      return React.createElement('button', { ref, ...restProps }, children)
    }),
    Content: createPrimitive('TooltipContent'),
    Portal: ({ children }) => children,
  }
})

jest.mock('@radix-ui/react-scroll-area', () => {
  const React = require('react')
  const createPrimitive = (name, element = 'div') => {
    const Component = React.forwardRef(({ children, className, ...props }, ref) => {
      return React.createElement(element, { ref, className, ...props }, children)
    })
    Component.displayName = name
    return Component
  }
  
  const Root = createPrimitive('ScrollAreaRoot')
  Root.displayName = 'ScrollAreaRoot'
  
  const Viewport = createPrimitive('ScrollAreaViewport')
  Viewport.displayName = 'ScrollAreaViewport'
  
  const Thumb = createPrimitive('ScrollAreaThumb')
  Thumb.displayName = 'ScrollAreaThumb'
  
  const Corner = createPrimitive('ScrollAreaCorner')
  Corner.displayName = 'ScrollAreaCorner'
  
  // Create ScrollAreaScrollbar - this is what the component uses
  const ScrollAreaScrollbar = React.forwardRef(({ children, className, orientation = "vertical", ...props }, ref) => {
    // Render Thumb inside Scrollbar
    return React.createElement('div', { 
      ref, 
      className, 
      'data-orientation': orientation,
      ...props 
    }, React.createElement(Thumb, { className: 'relative flex-1 rounded-full bg-border' }))
  })
  ScrollAreaScrollbar.displayName = 'ScrollAreaScrollbar'
  
  return {
    Root,
    Viewport,
    ScrollBar: ScrollAreaScrollbar, // Alias
    ScrollAreaScrollbar, // Primary export
    Thumb,
    Corner,
  }
})

jest.mock('@radix-ui/react-label', () => {
  const React = require('react')
  const LabelPrimitive = React.forwardRef(({ children, className, htmlFor, ...props }, ref) => {
    return React.createElement('label', { ref, className, htmlFor, ...props }, children)
  })
  LabelPrimitive.displayName = 'Label'
  return {
    Root: LabelPrimitive,
  }
})

// Mock custom icon components
jest.mock('@/components/icons/folder-icon', () => ({
  FolderIcon: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'folder-icon', ...props })
  },
}))

jest.mock('@/components/icons/ai-setting', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'ai-setting-icon', ...props })
  },
}))

jest.mock('@/components/icons/cloud-solid-rounded', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'cloud-icon', ...props })
  },
}))

jest.mock('@/components/icons/traces-square-solid-rounded', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'traces-icon', ...props })
  },
}))

jest.mock('@/components/icons/database-icon', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'database-icon', ...props })
  },
}))

jest.mock('@/components/icons/chat-solid-rounded', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'chat-icon', ...props })
  },
}))

jest.mock('@/components/icons/prompt-icon', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'prompt-icon', ...props })
  },
}))

jest.mock('@/components/icons/playground-icon', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'playground-icon', ...props })
  },
}))

jest.mock('@/components/icons/entity-icon', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'entity-icon', ...props })
  },
}))

jest.mock('@/components/icons/annotation-queue', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'annotation-queue-icon', ...props })
  },
}))

jest.mock('@/components/icons/score-icon', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'score-icon', ...props })
  },
}))

jest.mock('@/components/icons/evaluation-icon', () => ({
  __esModule: true,
  default: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'evaluation-icon', ...props })
  },
}))

jest.mock('@/components/icons/documentation-icon', () => ({
  DocumentationIcon: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'documentation-icon', ...props })
  },
}))

jest.mock('@/components/icons/moon-icon', () => ({
  MoonIcon: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'moon-icon', ...props })
  },
}))

jest.mock('@/components/icons/sun-icon', () => ({
  SunIcon: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'sun-icon', ...props })
  },
}))

jest.mock('@/components/icons/sort-icon', () => ({
  SortIcon: ({ className, ...props }) => {
    const React = require('react')
    return React.createElement('svg', { className, 'data-testid': 'sort-icon', ...props })
  },
}))

// Setup MSW handlers (only if available and needed)
// MSW setup is handled per-test-file basis to avoid issues with Node.js environment
