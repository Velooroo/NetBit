# NetBit AI Design Prompt for Figma AI + Spline3D

> **Comprehensive prompt for AI-powered design generation using Figma AI and Spline3D**

## 🎯 Project Overview

**NetBit** is a modern, comprehensive development platform that unifies Git hosting, project management, and team communication in a single, cohesive ecosystem. It's designed for developers and teams who want an all-in-one solution for their software development workflow.

### Core Vision
Create a sleek, modern, and intuitive platform that feels like a next-generation developer workspace. The design should be:
- **Professional yet approachable** - Serious tool with friendly UX
- **Dark-theme first** - Optimized for long coding sessions
- **Responsive and adaptive** - Seamless across desktop, tablet, and mobile
- **Performance-focused** - Fast, fluid animations and transitions
- **Accessibility-compliant** - WCAG 2.1 AA standard

---

## 🏗️ Architecture & Platform Structure

NetBit is a **monorepo project** with distinct platforms:

### 1. **Web Application** (React + TypeScript + Vite)
- Modern single-page application
- Dashboard-based interface
- Git repository browser with file explorer
- Project management hub
- Real-time notifications

### 2. **Mobile Application** (React Native + Expo)
- Native mobile experience for iOS and Android
- Focus on chat/messaging functionality
- Push notifications
- Project overview and monitoring
- Quick access to repositories

### 3. **Backend** (Rust + Actix Web)
- RESTful API server
- Git HTTP Smart Protocol implementation
- Real-time WebSocket support for chat
- SQLite database
- High performance and security

---

## 🎨 Design System Requirements

### Color Palette

#### Primary Colors
- **NetBit Blue** (#2563EB / rgb(37, 99, 235)) - Primary brand color for CTAs, links, and accents
- **Deep Ocean** (#1E3A8A / rgb(30, 58, 138)) - Secondary brand color for headers and highlights
- **Cyber Teal** (#14B8A6 / rgb(20, 184, 166)) - Success states, active elements, and positive actions

#### Dark Theme Colors (Primary)
- **Background Dark** (#0F172A / rgb(15, 23, 42)) - Main background
- **Surface Dark** (#1E293B / rgb(30, 41, 59)) - Cards, panels, elevated surfaces
- **Surface Light** (#334155 / rgb(51, 65, 85)) - Hover states, secondary surfaces
- **Border Subtle** (#475569 / rgb(71, 85, 105)) - Subtle borders and dividers
- **Text Primary** (#F1F5F9 / rgb(241, 245, 249)) - Primary text
- **Text Secondary** (#CBD5E1 / rgb(203, 213, 225)) - Secondary text, descriptions
- **Text Muted** (#94A3B8 / rgb(148, 163, 184)) - Disabled, placeholder text

#### Light Theme Colors (Alternative)
- **Background Light** (#FFFFFF / rgb(255, 255, 255)) - Main background
- **Surface Light Alt** (#F8FAFC / rgb(248, 250, 252)) - Cards, panels
- **Border Light** (#E2E8F0 / rgb(226, 232, 240)) - Borders
- **Text Dark** (#1E293B / rgb(30, 41, 59)) - Primary text
- **Text Gray** (#64748B / rgb(100, 116, 139)) - Secondary text

#### Semantic Colors
- **Success Green** (#10B981 / rgb(16, 185, 129)) - Success messages, completed tasks
- **Warning Amber** (#F59E0B / rgb(245, 158, 11)) - Warnings, pending actions
- **Error Red** (#EF4444 / rgb(239, 68, 68)) - Errors, destructive actions, alerts
- **Info Blue** (#3B82F6 / rgb(59, 130, 246)) - Informational messages

#### Code Syntax Colors (for Git/Code displays)
- **Syntax Purple** (#A78BFA / rgb(167, 139, 250)) - Keywords, tags
- **Syntax Pink** (#EC4899 / rgb(236, 72, 153)) - Strings, attributes
- **Syntax Yellow** (#FBBF24 / rgb(251, 191, 36)) - Variables, constants
- **Syntax Green** (#34D399 / rgb(52, 211, 153)) - Comments, additions
- **Syntax Red** (#F87171 / rgb(248, 113, 113)) - Deletions, errors in code

### Typography

#### Font Families
- **Primary Sans-Serif**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Monospace (Code)**: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace
- **Display/Headings**: 'Poppins' or 'Inter' with font-weight: 700

#### Font Scales
- **Heading 1**: 2.5rem (40px), font-weight: 700, line-height: 1.2
- **Heading 2**: 2rem (32px), font-weight: 600, line-height: 1.3
- **Heading 3**: 1.5rem (24px), font-weight: 600, line-height: 1.4
- **Heading 4**: 1.25rem (20px), font-weight: 600, line-height: 1.5
- **Body Large**: 1.125rem (18px), font-weight: 400, line-height: 1.6
- **Body**: 1rem (16px), font-weight: 400, line-height: 1.5
- **Body Small**: 0.875rem (14px), font-weight: 400, line-height: 1.5
- **Caption**: 0.75rem (12px), font-weight: 400, line-height: 1.4
- **Code**: 0.875rem (14px), monospace, line-height: 1.6

### Spacing System
Use 8px base grid system:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

### Border Radius
- **sm**: 4px - Small elements, tags
- **md**: 8px - Buttons, inputs, cards
- **lg**: 12px - Large cards, modals
- **xl**: 16px - Hero sections, major containers
- **full**: 9999px - Pills, avatars, circular elements

### Shadows & Depth
- **Shadow sm**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **Shadow md**: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- **Shadow lg**: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- **Shadow xl**: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
- **Glow effect**: 0 0 20px rgba(37, 99, 235, 0.4) - For hover states on primary actions

---

## 📱 Key UI Components

### 1. Navigation & Layout

#### Top Navigation Bar
- **Height**: 64px
- **Background**: Surface Dark with subtle bottom border
- **Logo**: NetBit logo/wordmark on left (size: 32px height)
- **Search**: Global search bar (center or right side, width: 300-400px)
- **User Menu**: Avatar + dropdown (right side)
- **Notification Bell**: Icon with badge counter
- **Style**: Fixed position, slightly translucent with backdrop blur

#### Sidebar Navigation
- **Width**: 280px (collapsed: 64px)
- **Sections**:
  - Dashboard (home icon)
  - Projects (folder icon)
  - Repositories (git icon)
  - Messages/Chats (message icon)
  - Notifications (bell icon)
  - Settings (gear icon)
- **Style**: Dark background, icons with labels, active state highlighting
- **Collapsible**: Icon-only mode on mobile/tablet

### 2. Dashboard Components

#### Project Card
- **Size**: Flexible grid (3 columns desktop, 2 tablet, 1 mobile)
- **Content**:
  - Project avatar/thumbnail (top)
  - Project name (heading)
  - Description (2-3 lines, truncated)
  - Stats row (stars, forks, last updated)
  - Language indicator (colored dot + label)
  - Quick actions (⋯ menu button)
- **Interaction**: Hover state with subtle lift (shadow), click to open

#### Repository Browser
- **File Tree**: Left panel (240px width)
  - Expandable folders
  - File icons by type
  - Git status indicators (modified, added, deleted)
- **Code Viewer**: Right panel
  - Syntax highlighted code
  - Line numbers
  - File path breadcrumb
  - View/Edit/Raw/Blame tabs
- **Commit History**: Bottom panel or separate view
  - Commit message
  - Author avatar + name
  - Timestamp
  - Diff stats (+/- lines)

#### Chat/Message Interface
- **Chat List**: Left sidebar (320px)
  - Search chats
  - Chat items with avatar, name, last message, timestamp
  - Unread badge
  - Pin important chats
- **Chat Window**: Main area
  - Message bubbles (sent vs received)
  - Timestamp grouping
  - Rich text support (markdown)
  - File attachments
  - Reactions/emoji
  - Message input at bottom with formatting toolbar
- **Style**: Modern messenger interface similar to Telegram/Discord

### 3. Forms & Inputs

#### Text Inputs
- **Height**: 40px
- **Padding**: 12px 16px
- **Border**: 1px solid Border Subtle
- **Border Radius**: 8px
- **Focus State**: Border color changes to NetBit Blue, subtle glow
- **Placeholder**: Text Muted color

#### Buttons
- **Primary Button**:
  - Background: NetBit Blue
  - Text: White
  - Height: 40px
  - Padding: 12px 24px
  - Border Radius: 8px
  - Hover: Slightly darker, subtle glow
  
- **Secondary Button**:
  - Background: Transparent
  - Border: 1px solid Border Subtle
  - Text: Text Primary
  - Hover: Background Surface Light

- **Danger Button**:
  - Background: Error Red
  - Text: White
  
- **Ghost Button**:
  - Background: Transparent
  - Text: NetBit Blue
  - Hover: Background Surface Dark

#### Dropdowns & Selects
- Similar to text inputs
- Chevron icon on right
- Dropdown panel with shadow lg
- Selected item highlighted

### 4. Status & Feedback

#### Notification Toast
- **Position**: Top-right corner
- **Size**: 360px width, auto height
- **Design**: Surface with colored left border (4px) based on type
- **Content**: Icon + title + message + close button
- **Animation**: Slide in from right, auto-dismiss after 5s

#### Loading States
- **Skeleton Loaders**: Gray animated pulse for content areas
- **Spinner**: Circular spinner with NetBit Blue color
- **Progress Bars**: Thin bar with gradient fill

#### Empty States
- **Illustration**: Simple, friendly illustration or icon
- **Message**: "No projects yet" with helpful subtext
- **Call to Action**: Button to create/add

---

## 🌊 3D Elements & Animations (Spline3D)

### Hero Section 3D Elements

#### 1. **Floating Git Graph**
- **Description**: Abstract 3D representation of a Git commit graph
- **Style**: 
  - Nodes: Glowing spheres (NetBit Blue with cyan highlights)
  - Edges: Thin, glowing lines connecting nodes
  - Animation: Gentle rotation, nodes pulse slowly
  - Material: Emissive, semi-transparent
- **Placement**: Hero section background or side decoration
- **Interaction**: Subtle parallax on mouse move

#### 2. **Code Particles**
- **Description**: Floating characters, brackets, and symbols
- **Style**:
  - Characters: { } < > / * # $ (programming symbols)
  - Material: Neon glow effect with Syntax Purple/Pink colors
  - Animation: Float upward slowly, fade in/out
  - Particle count: 50-100
- **Placement**: Background ambient effect
- **Interaction**: Drift away from cursor on hover

#### 3. **3D Platform Cubes**
- **Description**: Three connected cubes representing Web, Mobile, Backend
- **Style**:
  - Each cube has icon/logo of platform (React, React Native, Rust)
  - Material: Glass morphism with colored glow
  - Animation: Slow rotation, connected by light beams
  - Scale: Medium size (200-300px)
- **Placement**: Features section or about page
- **Interaction**: Individual cube rotates on hover

#### 4. **Network Connections Web**
- **Description**: 3D mesh network representing connectivity
- **Style**:
  - Nodes: Small dots at intersection points
  - Lines: Thin cyan lines forming triangular mesh
  - Animation: Waves of light travel through connections
  - Material: Wireframe with glow
- **Placement**: Background of connection/collaboration sections
- **Interaction**: Interactive - expand on click

#### 5. **Floating UI Panels**
- **Description**: 3D representations of UI screens at angles
- **Style**:
  - Multiple semi-transparent panels showing interface screenshots
  - Material: Glass with subtle reflection
  - Animation: Rotate slowly in 3D space
  - Depth: Slight depth (20-30px extrusion)
- **Placement**: Features showcase, product tour
- **Interaction**: Click to focus and expand specific panel

#### 6. **Abstract Data Streams**
- **Description**: Flowing tubes of data/information
- **Style**:
  - Tubes: Transparent tubes with flowing particles inside
  - Particles: Small glowing dots (NetBit Blue, Cyan, Green)
  - Animation: Continuous flow, particles move through tubes
  - Path: Curved, organic paths between points
- **Placement**: Background of data/sync sections
- **Interaction**: Speed increases on page scroll

### Micro-interactions & Transitions

#### Button Hover
- Scale: 1.02
- Shadow: Glow effect
- Duration: 200ms
- Easing: ease-out

#### Card Hover
- Scale: 1.03
- translateY: -4px
- Shadow: lg → xl
- Duration: 300ms

#### Page Transitions
- Fade in/out with slight scale
- Duration: 400ms
- Stagger child elements (50ms delay)

#### Loading Animations
- Pulse effect on skeletons
- Spinner rotation: 360° in 1s (linear)
- Progress bar fill: smooth ease-in-out

---

## 📐 Page Layouts

### 1. Landing Page
- **Hero Section**:
  - Large heading: "Build, Collaborate, Ship"
  - Subheading: Description of NetBit
  - CTA buttons: "Get Started" + "View Demo"
  - Background: 3D Git Graph or Code Particles
  - Height: 100vh

- **Features Section**:
  - Grid of feature cards (2x3)
  - Each card: Icon, title, description
  - 3D Platform Cubes in background

- **Technology Stack**:
  - Visual representation of tech stack
  - Logos with tooltips
  - Network Connections Web in background

- **Pricing/Plans** (if applicable):
  - 3 tier cards: Free, Pro, Enterprise
  - Highlight recommended plan

- **Footer**:
  - Links: About, Docs, API, Contact
  - Social media icons
  - Copyright info

### 2. Dashboard (Main App)
- **Layout**: Sidebar + Top Nav + Main Content
- **Widgets**:
  - Recent Projects grid
  - Activity Feed (recent commits, PRs)
  - Quick Stats (total repos, contributors, commits)
  - Notifications panel
- **Background**: Subtle gradient, optional subtle 3D elements

### 3. Project Detail Page
- **Header**:
  - Project name + description
  - Stats bar (stars, forks, watchers, issues)
  - Action buttons (Clone, Star, Fork, Settings)
  
- **Tabs**:
  - Code (repository browser)
  - Issues
  - Pull Requests
  - Wiki/Docs
  - Settings
  
- **Sidebar**:
  - About section
  - Languages chart
  - Contributors avatars
  - Tags/Topics

### 4. Repository Browser
- **Three-column layout**:
  - File tree (left, 240px)
  - Code viewer (center, flexible)
  - Details panel (right, 280px, collapsible)
- **Breadcrumb navigation** at top
- **Branch selector dropdown**
- **File actions toolbar**: Download, Edit, Delete, History

### 5. Chat/Messages Page
- **Two-column layout**:
  - Chat list (left, 320px)
  - Active chat (right, flexible)
- **Mobile**: Single column, swipe to switch
- **Features**:
  - Search chats
  - Create group/channel
  - Voice/video call buttons (future)

---

## 🎭 Visual Style Guidelines

### Overall Aesthetic
- **Modern & Minimal**: Clean interfaces, ample whitespace
- **Developer-Focused**: Professional, technical feel
- **Glassmorphism**: Subtle use of frosted glass effects for overlays
- **Neumorphism**: Soft shadows for buttons and cards (subtle)
- **Gradients**: Subtle gradients for backgrounds (dark blue to black)

### Iconography
- **Style**: Outline icons with 2px stroke
- **Size**: 20px for UI elements, 24px for navigation, 32px for large features
- **Library**: Heroicons, Lucide, or Feather Icons
- **Custom**: Git-specific icons (branch, commit, merge)

### Illustrations
- **Style**: Abstract, geometric, minimal
- **Colors**: Match brand palette with glow effects
- **Use Cases**: Empty states, error pages, onboarding
- **Tone**: Professional yet friendly, not too playful

### Photography/Images (if used)
- **Style**: Dark-toned, developer workspace themes
- **Treatment**: Overlay with dark gradient, reduced opacity
- **Content**: Code on screens, team collaboration, modern offices

---

## 🔧 Technical Specifications

### Responsive Breakpoints
- **Mobile**: 0-640px
- **Tablet**: 641-1024px
- **Desktop**: 1025-1440px
- **Large Desktop**: 1441px+

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Smooth 60fps animations**
- **Lazy load images and 3D assets**

### Accessibility
- **WCAG 2.1 AA compliant**
- **Keyboard navigation** for all interactions
- **Screen reader friendly** with proper ARIA labels
- **Focus indicators** clearly visible
- **Sufficient color contrast** (4.5:1 for text)

### Browser Support
- **Chrome/Edge**: Last 2 versions
- **Firefox**: Last 2 versions
- **Safari**: Last 2 versions
- **Mobile Safari/Chrome**: Last 2 versions

---

## 🎬 Animation Guidelines

### Timing Functions
- **ease-out**: Default for most animations
- **ease-in-out**: For continuous/looping animations
- **spring**: For playful micro-interactions

### Duration
- **Micro**: 150-200ms (buttons, hovers)
- **Standard**: 300-400ms (transitions, reveals)
- **Complex**: 500-700ms (page transitions, 3D animations)

### Principles
- **Anticipation**: Subtle wind-up before action
- **Follow-through**: Slight overshoot and settle
- **Reduce motion**: Respect prefers-reduced-motion
- **Meaningful**: Animations should guide user attention

---

## 🚀 Component Library (for Figma)

### Must-Have Components

1. **Buttons**: Primary, Secondary, Ghost, Danger (all sizes)
2. **Inputs**: Text, Email, Password, Search, Textarea
3. **Cards**: Project Card, Repo Card, User Card, Chat Item
4. **Navigation**: Top Nav, Sidebar, Breadcrumbs, Tabs
5. **Lists**: File List, Commit List, User List
6. **Modals**: Dialog, Confirmation, Form Modal
7. **Tooltips & Popovers**: Info tooltip, Action popover
8. **Badges**: Status badge, Count badge, Label badge
9. **Avatars**: Sizes: xs (24px), sm (32px), md (40px), lg (64px), xl (128px)
10. **Icons**: Full icon set matching style guide
11. **Code Blocks**: Syntax-highlighted code display
12. **Diffs**: Unified diff view with +/- highlighting
13. **Charts**: Activity graph, Language donut chart
14. **Loaders**: Spinner, Progress bar, Skeleton
15. **Empty States**: No data states with illustrations

### Component States
For each interactive component, design:
- **Default**: Resting state
- **Hover**: Mouse over
- **Active**: Being clicked
- **Focus**: Keyboard focus
- **Disabled**: Not interactive
- **Error**: Validation error (for inputs)
- **Success**: Successful action (for inputs)

---

## 🌟 Unique Features to Highlight

### 1. Unified Platform
- Visual representation of Git + PM + Chat integration
- Show how features interconnect

### 2. Real-time Collaboration
- Live cursors, presence indicators
- Real-time chat in code review

### 3. Mobile-First Chat
- Emphasize robust mobile messaging experience
- Push notifications, offline support

### 4. Rust Performance
- Showcase speed and reliability
- Performance metrics visualization

### 5. Developer Experience
- Clean Git workflow
- Intuitive repository management
- Powerful search capabilities

---

## 💡 Design Inspiration & References

### Similar Products (for reference)
- **GitHub**: Repository browsing, project cards
- **GitLab**: Integrated CI/CD pipeline views
- **Linear**: Clean, fast UI with great animations
- **Discord**: Chat interface and server structure
- **Notion**: Block-based content, smooth interactions
- **Vercel**: Deployment dashboard, clean dark theme

### Design Trends to Incorporate
- **Glassmorphism**: For modals, tooltips, overlays
- **Dark Mode Excellence**: Rich, deep backgrounds with high contrast elements
- **Micro-interactions**: Delightful feedback on every action
- **3D Accents**: Strategic use of 3D elements without overwhelming
- **Smooth Transitions**: Page and state transitions feel seamless

---

## 📝 Content & Copywriting Tone

### Voice & Tone
- **Professional**: Serious about development
- **Approachable**: Not overly technical in marketing
- **Confident**: Trust in the platform's capabilities
- **Helpful**: Guide users, don't confuse them

### Example Copy

#### Hero Headline
"Build, Collaborate, Ship—All in One Platform"
"Where Code Meets Collaboration"
"The Modern DevOps Platform for Teams"

#### Feature Descriptions
- **Git Hosting**: "Lightning-fast Git repositories with Smart HTTP Protocol"
- **Project Management**: "Organize your work with flexible project structures"
- **Team Chat**: "Communicate in context, right where you code"

#### Call-to-Actions
- "Get Started Free"
- "Explore NetBit"
- "Join the Beta"
- "Start Your Project"

---

## 🎯 Design Deliverables Needed

### For Figma AI
1. **Complete Design System**:
   - Color palette with all variants
   - Typography scale
   - Spacing grid
   - Component library

2. **Page Mockups**:
   - Landing page (desktop + mobile)
   - Dashboard (desktop + mobile)
   - Project detail page
   - Repository browser
   - Chat interface
   - Settings pages

3. **Component Variations**:
   - All states for each component
   - Light theme alternatives
   - Responsive breakpoints

4. **User Flows**:
   - Sign up / Login
   - Create project
   - Clone repository
   - Send message
   - Review code

### For Spline3D
1. **3D Assets**:
   - Floating Git Graph
   - Code Particles System
   - Platform Cubes (3 variants)
   - Network Connections Web
   - Floating UI Panels
   - Data Stream Tubes

2. **Animations**:
   - Loop animations for each element
   - Interactive states (hover, click)
   - Camera movements for presentations

3. **Integration Specs**:
   - Export settings for web (size, format)
   - Performance optimization notes
   - Fallback 2D alternatives

---

## ✅ Design Checklist

Before finalizing designs:

- [ ] All colors match the defined palette
- [ ] Typography follows the scale
- [ ] Spacing uses 8px grid system
- [ ] All interactive elements have hover/active states
- [ ] Mobile responsive layouts created
- [ ] Accessibility guidelines followed (contrast, focus states)
- [ ] Loading and empty states designed
- [ ] Error states and validation designed
- [ ] Consistent icon style throughout
- [ ] 3D elements optimized for web performance
- [ ] Animations are smooth and purposeful
- [ ] Design system documented in Figma
- [ ] Developer handoff notes included

---

## 🎨 Using This Prompt

### For Figma AI
```
Use this comprehensive design system to create a complete UI kit and page layouts 
for NetBit, a modern developer platform that combines Git hosting, project management, 
and team communication. Follow the color palette, typography, spacing, and component 
specifications exactly. Create dark theme designs with glassmorphism effects and 
smooth micro-interactions. Include all states for interactive components.
```

### For Spline3D
```
Create 3D animated elements for NetBit's web interface based on the specifications 
in the "3D Elements & Animations" section. Use the NetBit Blue (#2563EB) and 
Cyber Teal (#14B8A6) color palette with emissive materials and glow effects. 
Optimize for web performance with smooth, subtle animations. Create loop animations 
for ambient background elements and interactive states for user engagement.
```

---

## 🚀 Next Steps

1. **Review** this prompt with your design team
2. **Customize** any sections to match specific requirements
3. **Generate** designs using Figma AI with this prompt as reference
4. **Create** 3D assets using Spline3D based on specifications
5. **Iterate** based on feedback and usability testing
6. **Implement** designs in the actual React/React Native applications

---

**NetBit Design System v1.0**  
*For questions or feedback, contact the NetBit design team*
