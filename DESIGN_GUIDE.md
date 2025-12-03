# Using NetBit AI Design Prompts

## Quick Start Guide

This repository contains comprehensive AI design prompts for creating NetBit's UI/UX design using AI-powered tools like Figma AI and Spline3D.

## 📄 Available Prompts

### 1. **AI_PROMPT.md** (English)
Complete design system and prompt for AI design tools in English.

### 2. **AI_PROMPT_RU.md** (Русский)
Полная дизайн-система и промпт для AI инструментов дизайна на русском языке.

## 🎨 How to Use with Figma AI

1. **Read the prompt document**: Review [AI_PROMPT.md](./AI_PROMPT.md) to understand the design system
2. **Copy relevant sections**: Based on what you need to create (e.g., buttons, cards, pages)
3. **Use in Figma AI**: Paste the sections into Figma AI with instructions like:
   ```
   Create a dark theme UI kit for NetBit based on this design system:
   [paste color palette section]
   [paste typography section]
   [paste component specifications]
   
   Generate: Primary button, Secondary button, Text input, Card component
   ```

### Example Prompts for Figma AI

#### Creating Components
```
Using the NetBit design system (NetBit Blue #2563EB, dark theme #0F172A), 
create a primary button component with:
- Height: 40px
- Padding: 12px 24px
- Border radius: 8px
- Include hover, active, disabled states
- Add subtle glow effect on hover
```

#### Creating Page Layouts
```
Design a dark-themed dashboard page for NetBit with:
- Sidebar navigation (280px width)
- Top navigation bar (64px height)
- Grid of project cards (3 columns)
- Use NetBit color palette: Background #0F172A, Surface #1E293B
- Modern, minimal style with glassmorphism effects
```

## 🌊 How to Use with Spline3D

1. **Review 3D specifications**: Check the "3D Elements & Animations" section
2. **Create assets one by one**: Start with simpler elements first
3. **Use specific descriptions**: Copy the detailed descriptions for each 3D element

### Example Prompts for Spline3D

#### Floating Git Graph
```
Create a 3D floating Git commit graph:
- Nodes: Glowing spheres in blue (#2563EB) with cyan highlights
- Edges: Thin, glowing lines connecting nodes
- Animation: Gentle rotation, nodes pulse slowly
- Material: Emissive, semi-transparent
- Style: Abstract, modern, tech-focused
```

#### Code Particles
```
Create a particle system with programming symbols:
- Characters: { } < > / * # $
- Material: Neon glow effect, purple (#A78BFA) and pink (#EC4899)
- Animation: Float upward slowly, fade in/out
- Count: 50-100 particles
- Interaction: Drift away from cursor on hover
```

## 💡 Tips for Best Results

### For Figma AI
1. **Be specific**: Include exact measurements, colors (hex codes), and spacing
2. **Reference existing design systems**: Mention inspiration like "similar to Linear" or "like GitHub's dark theme"
3. **Request all states**: Always ask for hover, active, focus, and disabled states
4. **Iterate**: Generate basic components first, then refine with more specific prompts
5. **Use design tokens**: Reference the design system's tokens (colors, spacing, typography)

### For Spline3D
1. **Start simple**: Create basic shapes before adding complex animations
2. **Optimize for web**: Always mention "optimized for web performance"
3. **Export properly**: Request specific export formats (glTF, FBX) with size constraints
4. **Test interactivity**: Create hover states and interactive elements separately
5. **Create fallbacks**: Design 2D alternatives for low-performance devices

## 🔄 Workflow Recommendations

### Design System First
1. Create color palette and typography in Figma
2. Build basic components (buttons, inputs, cards)
3. Create component library with all states
4. Design key page layouts
5. Add 3D elements as enhancements

### Incremental Approach
1. **Week 1**: Design system + basic components
2. **Week 2**: Main page layouts (landing, dashboard, project page)
3. **Week 3**: Interactive components (forms, modals, navigation)
4. **Week 4**: 3D elements and animations
5. **Week 5**: Polish and developer handoff

## 📋 Checklist for Complete Design

- [ ] Color palette defined and documented
- [ ] Typography scale created
- [ ] Spacing system implemented (8px grid)
- [ ] All UI components designed with states
- [ ] Responsive breakpoints created
- [ ] Light theme alternative (optional)
- [ ] Landing page designed
- [ ] Dashboard layout created
- [ ] Project detail page designed
- [ ] Repository browser interface
- [ ] Chat/messaging interface
- [ ] 3D elements created and exported
- [ ] Animations documented
- [ ] Accessibility guidelines followed
- [ ] Developer handoff notes prepared

## 🚀 Integration with Development

### Exporting from Figma
- Use "Inspect" panel for developer handoff
- Export assets as SVG for icons
- Export images as WebP for photos
- Document component props and variants

### Exporting from Spline3D
- Export 3D models as glTF for web
- Optimize polygon count (< 50k triangles)
- Compress textures (< 512KB per texture)
- Create interaction code snippets
- Provide fallback 2D images

## 📚 Additional Resources

### Inspiration
- **GitHub**: Repository browsing patterns
- **Linear**: Fast, clean UI with great animations
- **Discord**: Chat interface design
- **Vercel**: Dashboard and deployment UI
- **Notion**: Block-based content

### Tools
- **Figma**: Main design tool
- **Figma AI**: AI-powered design generation
- **Spline3D**: 3D design and animation
- **Principles/ProtoPie**: Advanced prototyping
- **Zeplin/Avocode**: Developer handoff

### Learning
- Read about glassmorphism effects
- Study dark theme best practices
- Learn about 3D web performance
- Review WCAG accessibility guidelines
- Explore micro-interaction patterns

## 🆘 Troubleshooting

### Figma AI generates wrong colors
→ Always include full hex codes (#2563EB) in your prompt

### 3D elements too complex/slow
→ Ask Spline to "optimize for web with low polygon count"

### Components don't match brand
→ Include more context about NetBit's developer-focused, professional tone

### Responsive layouts broken
→ Specify exact breakpoints and behavior for each screen size

### Accessibility issues
→ Mention WCAG 2.1 AA compliance and include contrast ratios in prompts

## 📞 Questions?

If you need clarification on any design specifications:
1. Check the detailed sections in AI_PROMPT.md
2. Review existing NetBit codebase for current implementation
3. Reference similar developer tools for inspiration
4. Ask for feedback from the development team

---

**Happy Designing! 🎨**
