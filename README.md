# FIFO Page Replacement Algorithm Simulator

## Overview

An interactive educational web application that demonstrates the First In, First Out (FIFO) page replacement algorithm through animated visualization. This simulator provides a comprehensive learning experience for students studying operating systems and memory management concepts.

## Features

### 🎯 Core Functionality
- **Interactive FIFO Simulation**: Step-by-step visualization of the FIFO page replacement algorithm
- **Custom Input Support**: Configure frame count (1-10) and custom page reference sequences
- **Real-time Visualization**: Canvas-based rendering with color-coded frame states
- **Animation Controls**: Start/pause, step forward/backward, adjustable speed
- **Educational Feedback**: Detailed explanations of each algorithm operation

### 📊 Visual Features
- **Color-coded Frame States**: 
  - 🟢 **Green**: Page Hit
  - 🔴 **Red**: Page Fault/Miss
  - 🟡 **Yellow**: Page Replacement
- **FIFO Order Indication**: Visual markers showing oldest frame for replacement
- **Real-time Statistics**: Page fault count and fault rate percentage
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 💾 Export Capabilities
- **Screenshot Export**: Save current simulation state as PNG image
- **Execution Trace Export**: Download detailed step-by-step data in CSV or JSON format
- **Cross-browser Support**: Works with all modern browsers

### 🛠 Technical Features
- **Comprehensive Error Handling**: Graceful degradation and user-friendly error messages
- **Cross-browser Compatibility**: Tested on Chrome, Firefox, Safari, and Edge
- **Performance Optimized**: Smooth animations and responsive UI
- **Accessibility Compliant**: ARIA labels, keyboard navigation, screen reader support
- **Standards Compliant**: Valid HTML5, CSS3, and modern JavaScript (ES6+)

## Quick Start

### Requirements
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- No installation or server required

### Usage

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SakethVetcha/os-project-fifo.git
   cd os-project-fifo
   ```

2. **Open the Application**
   - Simply open `index.html` in your web browser

3. **Configure Simulation**
   - Enter number of memory frames (1–10)
   - Input page reference sequence (comma-separated integers)

4. **Initialize**
   - Click "Initialize Simulation" to set up the visualization

5. **Control Animation**
   - Use Start/Pause for automatic progression
   - Use Step Forward/Backward for manual control
   - Adjust speed with the slider

6. **Export Results**
   - Save screenshots or execution traces for analysis

### Example Scenarios

**Classic FIFO Example:**
- Frames: 3
- Page References: `1,2,3,4,1,2,5,1,2,3,4,5`
- Expected Faults: 9

**Worst Case Scenario:**
- Frames: 2  
- Page References: `1,2,3,1,2,3`
- Expected Faults: 6 (every access is a fault)

## Technical Architecture

### File Structure
```
fifo-simulator/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── script.js           # Core logic (FIFO algorithm, canvas rendering, validation)
├── animation.js        # Animation engine and control logic
└── README.md           # This documentation file
```

### Core Components

#### 1. **FIFOAlgorithm Class**
- Implements core FIFO page replacement logic
- Manages memory frames and FIFO queue
- Tracks algorithm state and history
- Provides step-by-step execution

#### 2. **AnimationEngine Class** (animation.js)
- Controls simulation flow and timing
- Manages animation state and transitions
- Handles user interactions and navigation
- Synchronizes with algorithm state

#### 3. **Canvas Rendering System**
- Hardware-accelerated visualization
- Responsive frame layout calculations
- Color-coded visual feedback
- Performance-optimized drawing operations

#### 4. **Input Validation System**
- Comprehensive input validation
- Real-time error feedback
- User-friendly error messages
- Graceful error recovery

### Performance Optimizations
- **Canvas Optimization**: Hardware acceleration, efficient rendering
- **Memory Management**: Minimal object creation, proper cleanup
- **Responsive Design**: Adaptive layouts, touch-friendly controls
- **Cross-browser Compatibility**: Feature detection, graceful fallbacks

## Browser Compatibility

### Supported Browsers
- ✅ **Chrome** 60+ (Recommended)
- ✅ **Firefox** 55+
- ✅ **Safari** 12+
- ✅ **Edge** 79+

### Required Features
- HTML5 Canvas API
- ES6+ JavaScript (Classes, Arrow Functions, const/let)
- CSS3 (Flexbox, Grid, Media Queries)
- DOM API (querySelector, addEventListener)

### Optional Features (with fallbacks)
- ResizeObserver (falls back to window resize events)
- Download attribute (falls back to new window)
- Blob API (falls back to text display)
- RequestAnimationFrame (falls back to setTimeout)

## Testing and Validation

### Comprehensive Test Suite
The application includes extensive testing covering:

#### Unit Tests
- ✅ Input validation functions
- ✅ FIFO algorithm correctness
- ✅ Animation engine functionality
- ✅ Export functionality
- ✅ Error handling mechanisms

#### Integration Tests
- ✅ Complete user workflows
- ✅ Cross-browser compatibility
- ✅ Responsive design validation
- ✅ Performance benchmarks

#### Algorithm Correctness Tests
- ✅ Classic FIFO scenarios with known results
- ✅ Edge cases (all unique pages, repeated pages)
- ✅ Boundary conditions (single frame, maximum frames)
- ✅ Mathematical validation of fault rates

### Standards Compliance
- ✅ **HTML5**: Semantic markup, accessibility attributes
- ✅ **CSS3**: Valid syntax, responsive design patterns
- ✅ **JavaScript**: ES6+ standards, proper error handling
- ✅ **Accessibility**: WCAG guidelines, ARIA labels, keyboard navigation
- ✅ **Performance**: 60fps animations, optimized rendering

## Development and Debugging

### Debug Tools
Access these functions in the browser console:

```javascript
// Generate comprehensive testing report
window.generateTestingReport();

// Validate standards compliance
window.validateStandardsCompliance();

// Check final requirements checklist
window.createFinalTestingChecklist();
```

### Performance Monitoring
The application includes built-in performance monitoring:
- Frame rate tracking
- Render time measurement
- Memory usage optimization
- Browser capability detection

## Educational Use

### Learning Objectives
This simulator helps students understand:
1. **FIFO Algorithm Mechanics**: How oldest pages are replaced first
2. **Page Fault Concepts**: When and why page faults occur
3. **Memory Management**: Relationship between frame count and fault rate
4. **Algorithm Analysis**: Performance characteristics of FIFO replacement

### Classroom Integration
- **Interactive Demonstrations**: Step through algorithm execution
- **Homework Assignments**: Test different scenarios and analyze results
- **Comparative Analysis**: Export data for comparison with other algorithms
- **Visual Learning**: Color-coded feedback reinforces concepts

## Contributing

### Code Quality Standards
- Comprehensive documentation for all functions
- Error handling for all user interactions
- Performance optimization for smooth animations
- Cross-browser compatibility testing
- Accessibility compliance (WCAG guidelines)

### Testing Requirements
- Unit tests for all core functionality
- Integration tests for complete workflows
- Cross-browser compatibility validation
- Performance benchmarking
- Standards compliance verification

## License

This project is released for educational use. Feel free to use, modify, and distribute for educational purposes.

## Support

For issues or questions:
1. Check browser compatibility requirements
2. Ensure JavaScript is enabled
3. Try refreshing the page
4. Use browser developer tools for debugging
5. Run `window.generateTestingReport()` for diagnostic information

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Compatibility**: Modern browsers with HTML5 Canvas support  
**License**: Educational Use - Open Source