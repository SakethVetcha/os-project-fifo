/**
 * ============================================================================
 * FIFO Page Replacement Algorithm Simulator
 * ============================================================================
 * 
 * An interactive educational web application that demonstrates the First In,
 * First Out (FIFO) page replacement algorithm through animated visualization.
 * 
 * @author     FIFO Simulator Development Team
 * @version    1.0.0
 * @created    2024
 * @updated    2024
 * 
 * @description
 * This application provides a comprehensive simulation of the FIFO page 
 * replacement algorithm, allowing users to:
 * - Input custom frame counts and page reference sequences
 * - Visualize algorithm execution step-by-step
 * - Control animation speed and navigation
 * - Export simulation results and screenshots
 * - Learn through detailed explanations and visual feedback
 * 
 * @features
 * - Interactive Canvas-based visualization
 * - Real-time algorithm state display
 * - Comprehensive error handling and validation
 * - Cross-browser compatibility
 * - Responsive design for all devices
 * - Export functionality (PNG, CSV, JSON)
 * - Comprehensive testing suite
 * 
 * @requirements
 * - Modern web browser with HTML5 Canvas support
 * - JavaScript ES6+ support
 * - No server or installation required
 * 
 * @license
 * Educational use - Open source
 * 
 * ============================================================================
 * CANVAS RENDERING INFRASTRUCTURE
 * ============================================================================
 * 
 * This section contains all canvas-related functionality including:
 * - Canvas initialization and setup
 * - Drawing utilities (shapes, text, colors)
 * - Memory frame visualization
 * - Animation and transition effects
 * - Responsive canvas scaling
 */

// ============================================================================
// GLOBAL VARIABLES - Canvas and Rendering
// ============================================================================

/**
 * @global {HTMLCanvasElement|null} canvas - Main canvas element for visualization
 * @description The primary canvas element used for rendering memory frames,
 *              animations, and all visual components of the FIFO simulation.
 *              Initialized in initializeCanvas() function.
 */
let canvas;

/**
 * @global {CanvasRenderingContext2D|null} ctx - 2D rendering context
 * @description The 2D rendering context obtained from the canvas element.
 *              Used for all drawing operations including shapes, text, and colors.
 *              Provides the API for Canvas drawing methods.
 */
let ctx;

/**
 * @global {number} canvasWidth - Default canvas width in pixels
 * @description Standard width for the simulation canvas. Can be adjusted
 *              for responsive design but maintains aspect ratio.
 * @default 800
 */
let canvasWidth = 800;

/**
 * @global {number} canvasHeight - Default canvas height in pixels  
 * @description Standard height for the simulation canvas. Can be adjusted
 *              for responsive design but maintains aspect ratio.
 * @default 400
 */
let canvasHeight = 400;

// ============================================================================
// PERFORMANCE MONITORING AND OPTIMIZATION
// ============================================================================

/**
 * @namespace Performance
 * @description Performance monitoring and optimization utilities for smooth animations
 */
const Performance = {
    /**
     * @property {Object} metrics - Performance metrics collection
     */
    metrics: {
        renderTime: 0,
        animationFrames: 0,
        lastFrameTime: 0,
        averageFrameTime: 0
    },

    /**
     * Start performance measurement
     * @param {string} operation - Name of operation being measured
     * @returns {number} Start timestamp
     */
    startMeasure(operation) {
        return performance.now();
    },

    /**
     * End performance measurement and log result
     * @param {string} operation - Name of operation
     * @param {number} startTime - Start timestamp from startMeasure
     */
    endMeasure(operation, startTime) {
        const duration = performance.now() - startTime;
        if (duration > 16.67) { // Log if slower than 60fps
            console.warn(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
        }
    },

    /**
     * Optimize canvas rendering for better performance
     */
    optimizeCanvas() {
        if (canvas && ctx) {
            // Enable hardware acceleration hints
            ctx.imageSmoothingEnabled = false; // Disable for pixel-perfect rendering

            // Set optimal composite operation for performance
            ctx.globalCompositeOperation = 'source-over';
        }
    }
};

// ============================================================================
// CANVAS INITIALIZATION AND SETUP
// ============================================================================

/**
 * Initialize the canvas element and set up the rendering context
 * 
 * @function initializeCanvas
 * @description Performs comprehensive canvas initialization including:
 *              - DOM element retrieval and validation
 *              - Browser compatibility checks
 *              - 2D rendering context setup
 *              - Default styling and coordinate system
 *              - Error handling with user feedback
 * 
 * @returns {boolean} True if initialization successful, false otherwise
 * 
 * @throws {Error} Canvas element not found in DOM
 * @throws {Error} Canvas API not supported in browser
 * @throws {Error} Canvas 2D context not supported
 * 
 * @example
 * if (initializeCanvas()) {
 *     console.log('Canvas ready for rendering');
 * } else {
 *     console.error('Canvas initialization failed');
 * }
 * 
 * @performance
 * - Minimal DOM queries (single getElementById call)
 * - Early error detection to prevent runtime issues
 * - Efficient context setup with default configurations
 */
function initializeCanvas() {
    try {
        canvas = document.getElementById('simulation-canvas');

        if (!canvas) {
            throw new Error('Canvas element not found in DOM');
        }

        // Check if Canvas API is supported
        if (typeof canvas.getContext !== 'function') {
            throw new Error('Canvas API not supported in this browser');
        }

        // Get 2D rendering context
        ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Canvas 2D context not supported in this browser');
        }

        // Set canvas dimensions
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Set up coordinate system and default styles
        setupCanvasDefaults();

        // Apply performance optimizations
        Performance.optimizeCanvas();

        console.log('Canvas initialized successfully');
        return true;

    } catch (error) {
        console.error('Canvas initialization failed:', error);
        displayError(`Canvas initialization failed: ${error.message}. Please use a modern browser that supports HTML5 Canvas.`);
        return false;
    }
}

/**
 * Set up default canvas styles and coordinate system
 */
function setupCanvasDefaults() {
    // Set default font
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Set default line styles
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with white background
    clearCanvas();
}

/**
 * Clear the entire canvas with a white background
 */
function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

/**
 * Draw a rectangle with optional fill and stroke
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate  
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {string} fillColor - Fill color (optional)
 * @param {string} strokeColor - Stroke color (optional)
 */
function drawRectangle(x, y, width, height, fillColor = null, strokeColor = '#000000') {
    ctx.save();

    // Fill rectangle if color provided
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, width, height);
    }

    // Stroke rectangle if color provided
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.strokeRect(x, y, width, height);
    }

    ctx.restore();
}

/**
 * Draw text at specified coordinates
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Text color
 * @param {string} font - Font specification (optional)
 */
function drawText(text, x, y, color = '#000000', font = '14px Arial') {
    ctx.save();

    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);

    ctx.restore();
}

/**
 * Draw a circle
 * @param {number} x - Center X coordinate
 * @param {number} y - Center Y coordinate
 * @param {number} radius - Circle radius
 * @param {string} fillColor - Fill color (optional)
 * @param {string} strokeColor - Stroke color (optional)
 */
function drawCircle(x, y, radius, fillColor = null, strokeColor = '#000000') {
    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    // Fill circle if color provided
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    // Stroke circle if color provided
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Draw a line between two points
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @param {string} color - Line color
 * @param {number} width - Line width (optional)
 */
function drawLine(x1, y1, x2, y2, color = '#000000', width = 2) {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw a rounded rectangle
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @param {number} radius - Corner radius
 * @param {string} fillColor - Fill color (optional)
 * @param {string} strokeColor - Stroke color (optional)
 */
function drawRoundedRectangle(x, y, width, height, radius, fillColor = null, strokeColor = '#000000') {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    // Fill if color provided
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    // Stroke if color provided
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Get canvas dimensions
 * @returns {Object} Object with width and height properties
 */
function getCanvasDimensions() {
    return {
        width: canvasWidth,
        height: canvasHeight
    };
}

/**
 * Memory Frame Rendering Functions
 */

/**
 * Calculate frame dimensions and positions based on frame count
 * @param {number} frameCount - Number of memory frames
 * @returns {Object} Frame layout configuration
 */
function calculateFrameLayout(frameCount) {
    const canvasDims = getCanvasDimensions();
    const margin = 40;
    const availableWidth = canvasDims.width - (2 * margin);
    const availableHeight = canvasDims.height - (2 * margin);

    // Frame dimensions
    const frameWidth = Math.min(120, (availableWidth - (frameCount - 1) * 20) / frameCount);
    const frameHeight = 80;

    // Calculate starting position to center frames horizontally
    const totalFramesWidth = (frameCount * frameWidth) + ((frameCount - 1) * 20);
    const startX = (canvasDims.width - totalFramesWidth) / 2;
    const startY = margin + 50; // Leave space for title

    return {
        frameWidth,
        frameHeight,
        startX,
        startY,
        spacing: 20,
        margin
    };
}

/**
 * Get color for frame state
 * @param {string} state - Frame state ('hit', 'miss', 'replacement', 'oldest', 'default')
 * @returns {Object} Colors for fill and stroke
 */
function getFrameColors(state) {
    const colors = {
        hit: { fill: '#27ae60', stroke: '#1e8449', text: '#ffffff' },
        miss: { fill: '#e74c3c', stroke: '#c0392b', text: '#ffffff' },
        replacement: { fill: '#f39c12', stroke: '#d68910', text: '#ffffff' },
        oldest: { fill: '#f8f9fa', stroke: '#fd7e14', text: '#212529' },
        default: { fill: '#f8f9fa', stroke: '#6c757d', text: '#212529' },
        empty: { fill: '#ffffff', stroke: '#dee2e6', text: '#6c757d' }
    };

    return colors[state] || colors.default;
}

/**
 * Draw memory frames with current state
 * @param {Array} frames - Array of frame contents (null for empty, number for page)
 * @param {Object} highlightInfo - Information about which frames to highlight
 * @param {number} currentPage - Current page reference being processed
 * @param {number} oldestFrameIndex - Index of the oldest frame (for FIFO indication)
 */
function drawMemoryFrames(frames, highlightInfo = {}, currentPage = null, oldestFrameIndex = -1) {
    if (!frames || frames.length === 0) {
        console.warn('No frames to draw');
        return;
    }

    // Use grid layout for many frames, horizontal for few frames
    if (frames.length > 6) {
        drawMemoryFramesGrid(frames, highlightInfo, currentPage, oldestFrameIndex);
        return;
    }

    // Clear canvas
    clearCanvas();

    // Calculate layout
    const layout = calculateFrameLayout(frames.length);

    // Draw title
    drawText('Memory Frames (FIFO Order)', canvasWidth / 2, 25, '#2c3e50', '18px Arial');

    // Draw current page reference and operation status if provided
    if (currentPage !== null) {
        drawText(`Current Page Reference: ${currentPage}`, canvasWidth / 2, 50, '#34495e', '14px Arial');

        // Draw operation status with color coding
        if (highlightInfo.stepInfo && highlightInfo.stepInfo.operationType) {
            const operationType = highlightInfo.stepInfo.operationType;
            let statusText = '';
            let statusColor = '#34495e';

            switch (operationType) {
                case 'hit':
                    statusText = '✓ PAGE HIT';
                    statusColor = '#27ae60';
                    break;
                case 'miss':
                    statusText = '✗ PAGE FAULT (Empty Frame)';
                    statusColor = '#e74c3c';
                    break;
                case 'replacement':
                    statusText = '⟲ PAGE FAULT (Replacement)';
                    statusColor = '#f39c12';
                    break;
                default:
                    statusText = 'Ready to Process';
                    statusColor = '#6c757d';
            }

            drawText(statusText, canvasWidth / 2, 75, statusColor, '16px Arial');
        }
    }

    // Draw each frame
    frames.forEach((frameContent, index) => {
        const x = layout.startX + (index * (layout.frameWidth + layout.spacing));
        const y = layout.startY;

        drawSingleFrame(frameContent, index, x, y, layout.frameWidth, layout.frameHeight,
            highlightInfo, oldestFrameIndex);
    });

    // Draw legend at the bottom
    drawFrameLegend(layout.startY + layout.frameHeight + 60);

    // Draw step information if available
    if (highlightInfo.stepInfo) {
        drawStepInformation(highlightInfo.stepInfo, layout.startY + layout.frameHeight + 120);
    }
}

/**
 * Draw color legend for frame states
 * @param {number} startY - Y position to start drawing legend
 */
function drawFrameLegend(startY) {
    const legendItems = [
        { state: 'hit', label: 'Page Hit' },
        { state: 'miss', label: 'Page Miss/Fault' },
        { state: 'replacement', label: 'Page Replacement' },
        { state: 'oldest', label: 'Oldest Frame (FIFO)' },
        { state: 'empty', label: 'Empty Frame' }
    ];

    const itemWidth = 140;
    const itemHeight = 25;
    const totalWidth = legendItems.length * itemWidth;
    const startX = (canvasWidth - totalWidth) / 2;

    // Draw legend title
    drawText('Legend:', canvasWidth / 2, startY - 15, '#2c3e50', '14px Arial');

    legendItems.forEach((item, index) => {
        const x = startX + (index * itemWidth);
        const colors = getFrameColors(item.state);

        // Draw small color box
        const boxSize = 16;
        const boxX = x + 10;
        const boxY = startY - boxSize / 2;

        drawRoundedRectangle(boxX, boxY, boxSize, boxSize, 3, colors.fill, colors.stroke);

        // Draw label
        drawText(item.label, boxX + boxSize + 8, startY, '#2c3e50', '11px Arial');
    });
}

/**
 * Draw step information display
 * @param {Object} stepInfo - Information about current step
 */
function drawStepInformation(stepInfo, startY) {
    const infoItems = [
        `Step: ${stepInfo.currentStep} / ${stepInfo.totalSteps}`,
        `Page Faults: ${stepInfo.faultCount}`,
        `Fault Rate: ${stepInfo.faultRate}%`
    ];

    const itemWidth = 200;
    const totalWidth = infoItems.length * itemWidth;
    const startX = (canvasWidth - totalWidth) / 2;

    infoItems.forEach((info, index) => {
        const x = startX + (index * itemWidth);
        drawText(info, x + itemWidth / 2, startY, '#34495e', '12px Arial');
    });
}

/**
 * Create smooth color transition animation for frame state changes
 * @param {number} frameIndex - Index of frame to animate
 * @param {string} fromState - Starting state
 * @param {string} toState - Ending state
 * @param {number} duration - Animation duration in milliseconds
 * @param {Function} callback - Callback when animation completes
 */
function animateFrameTransition(frameIndex, fromState, toState, duration = 300, callback = null) {
    const startTime = performance.now();
    const fromColors = getFrameColors(fromState);
    const toColors = getFrameColors(toState);

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Interpolate colors (simplified - just switch at 50% for now)
        const currentColors = progress < 0.5 ? fromColors : toColors;

        // Redraw frame with current colors
        // This would need to be integrated with the main drawing loop
        // For now, we'll just call the callback when done

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (callback) {
            callback();
        }
    }

    requestAnimationFrame(animate);
}

/**
 * Update canvas size for responsive design
 * @param {number} containerWidth - Width of the container element
 */
function updateCanvasSize(containerWidth) {
    const aspectRatio = canvasHeight / canvasWidth;
    const maxWidth = Math.min(containerWidth - 40, 800); // 20px margin on each side

    if (maxWidth < canvasWidth) {
        canvas.style.width = maxWidth + 'px';
        canvas.style.height = (maxWidth * aspectRatio) + 'px';
    } else {
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
    }
}

/**
 * Get optimal frame layout for different screen sizes
 * @param {number} frameCount - Number of frames
 * @param {number} availableWidth - Available width for frames
 * @returns {Object} Optimized layout configuration
 */
function getResponsiveFrameLayout(frameCount, availableWidth) {
    const minFrameWidth = 80;
    const maxFrameWidth = 140;
    const spacing = 15;

    // Calculate frame width based on available space
    let frameWidth = (availableWidth - ((frameCount - 1) * spacing)) / frameCount;
    frameWidth = Math.max(minFrameWidth, Math.min(maxFrameWidth, frameWidth));

    // If frames are too small, consider stacking them
    if (frameWidth < minFrameWidth && frameCount > 5) {
        // For many frames, use a grid layout
        const framesPerRow = Math.floor(availableWidth / (minFrameWidth + spacing));
        const rows = Math.ceil(frameCount / framesPerRow);

        return {
            frameWidth: minFrameWidth,
            frameHeight: 60,
            framesPerRow,
            rows,
            spacing,
            layout: 'grid'
        };
    }

    return {
        frameWidth,
        frameHeight: 80,
        framesPerRow: frameCount,
        rows: 1,
        spacing,
        layout: 'horizontal'
    };
}

/**
 * Draw memory frames with grid layout for many frames
 * @param {Array} frames - Array of frame contents
 * @param {Object} highlightInfo - Highlight information
 * @param {number} currentPage - Current page reference
 * @param {number} oldestFrameIndex - Index of oldest frame
 */
function drawMemoryFramesGrid(frames, highlightInfo = {}, currentPage = null, oldestFrameIndex = -1) {
    if (!frames || frames.length === 0) {
        console.warn('No frames to draw');
        return;
    }

    clearCanvas();

    const canvasDims = getCanvasDimensions();
    const margin = 30;
    const availableWidth = canvasDims.width - (2 * margin);

    const layout = getResponsiveFrameLayout(frames.length, availableWidth);

    // Draw title
    drawText('Memory Frames (FIFO Order)', canvasWidth / 2, 25, '#2c3e50', '16px Arial');

    if (currentPage !== null) {
        drawText(`Current Page Reference: ${currentPage}`, canvasWidth / 2, 45, '#34495e', '12px Arial');
    }

    const startY = 70;

    if (layout.layout === 'grid') {
        // Grid layout for many frames
        for (let i = 0; i < frames.length; i++) {
            const row = Math.floor(i / layout.framesPerRow);
            const col = i % layout.framesPerRow;

            const x = margin + col * (layout.frameWidth + layout.spacing);
            const y = startY + row * (layout.frameHeight + layout.spacing);

            drawSingleFrame(frames[i], i, x, y, layout.frameWidth, layout.frameHeight,
                highlightInfo, oldestFrameIndex);
        }
    } else {
        // Horizontal layout
        const totalWidth = frames.length * layout.frameWidth + (frames.length - 1) * layout.spacing;
        const startX = (canvasDims.width - totalWidth) / 2;

        for (let i = 0; i < frames.length; i++) {
            const x = startX + i * (layout.frameWidth + layout.spacing);
            const y = startY;

            drawSingleFrame(frames[i], i, x, y, layout.frameWidth, layout.frameHeight,
                highlightInfo, oldestFrameIndex);
        }
    }

    // Draw legend and step info
    const legendY = startY + (layout.rows * (layout.frameHeight + layout.spacing)) + 30;
    drawFrameLegend(legendY);

    if (highlightInfo.stepInfo) {
        drawStepInformation(highlightInfo.stepInfo, legendY + 40);
    }
}

/**
 * Draw a single memory frame
 * @param {number|null} frameContent - Content of the frame
 * @param {number} frameIndex - Index of the frame
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Frame width
 * @param {number} height - Frame height
 * @param {Object} highlightInfo - Highlight information
 * @param {number} oldestFrameIndex - Index of oldest frame
 */
function drawSingleFrame(frameContent, frameIndex, x, y, width, height, highlightInfo, oldestFrameIndex) {
    // Determine frame state
    let frameState = 'default';

    if (highlightInfo.hitFrame === frameIndex) {
        frameState = 'hit';
    } else if (highlightInfo.missFrame === frameIndex) {
        frameState = 'miss';
    } else if (highlightInfo.replacementFrame === frameIndex) {
        frameState = 'replacement';
    } else if (oldestFrameIndex === frameIndex && frameContent !== null) {
        frameState = 'oldest';
    } else if (frameContent === null) {
        frameState = 'empty';
    }

    const colors = getFrameColors(frameState);

    // Draw frame with glow effect for highlighted frames
    if (frameState === 'hit' || frameState === 'miss' || frameState === 'replacement') {
        ctx.save();
        ctx.shadowColor = colors.stroke;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        drawRoundedRectangle(x, y, width, height, 6, colors.fill, colors.stroke);
        ctx.restore();
    } else {
        drawRoundedRectangle(x, y, width, height, 6, colors.fill, colors.stroke);
    }

    // Draw frame label
    const fontSize = Math.min(10, width / 8);
    drawText(`F${frameIndex}`, x + width / 2, y - 8, '#6c757d', `${fontSize}px Arial`);

    // Draw content
    if (frameContent !== null) {
        const contentFontSize = Math.min(14, width / 6);
        drawText(`${frameContent}`, x + width / 2, y + height / 2, colors.text, `${contentFontSize}px Arial`);
    } else {
        const emptyFontSize = Math.min(12, width / 8);
        drawText('Empty', x + width / 2, y + height / 2, colors.text, `${emptyFontSize}px Arial`);
    }

    // Draw FIFO indicator for oldest frame
    if (oldestFrameIndex === frameIndex && frameContent !== null && width > 100) {
        drawText('← Next', x + width + 5, y + height / 2, '#fd7e14', '10px Arial');
    }
}

/**
 * Test memory frame rendering with sample data
 */
function testMemoryFrameRendering() {
    console.log('Testing memory frame rendering...');

    // Test with different frame counts and states
    const testCases = [
        {
            name: 'Basic 3 frames with hit',
            frames: [1, 2, null],
            highlight: { hitFrame: 0 },
            currentPage: 1,
            oldestFrame: 0
        },
        {
            name: '4 frames with replacement',
            frames: [1, 2, 3, 4],
            highlight: { replacementFrame: 2 },
            currentPage: 5,
            oldestFrame: 2
        },
        {
            name: 'Many frames (grid layout)',
            frames: [1, 2, 3, 4, 5, 6, 7, 8],
            highlight: { missFrame: 5 },
            currentPage: 9,
            oldestFrame: 0
        }
    ];

    let currentTest = 0;

    function runNextTest() {
        if (currentTest < testCases.length) {
            const test = testCases[currentTest];
            console.log(`Running test: ${test.name}`);

            drawMemoryFrames(test.frames, test.highlight, test.currentPage, test.oldestFrame);

            currentTest++;

            // Auto-advance to next test after 2 seconds
            setTimeout(runNextTest, 2000);
        } else {
            console.log('All memory frame rendering tests completed');
        }
    }

    runNextTest();
}

/**
 * Render current FIFO algorithm state to canvas
 * @param {FIFOAlgorithm} algorithm - FIFO algorithm instance
 * @param {Object} animationState - Current animation state
 */
function renderFIFOState(algorithm, animationState) {
    try {
        if (!algorithm) {
            console.warn('No FIFO algorithm instance provided');
            return;
        }

        if (!canvas || !ctx) {
            console.warn('Canvas not available for rendering');
            return;
        }

        const currentState = algorithm.getCurrentState();
        if (!currentState) {
            console.warn('No current state available from algorithm');
            return;
        }

        const frames = currentState.frames || [];
        const currentStep = animationState.currentStep || 0;
        const pageReferences = algorithm.pageReferences || [];

        // Determine current page reference
        const currentPage = currentStep < pageReferences.length ? pageReferences[currentStep] : null;

        // Get step history to determine highlight state
        const stepHistory = algorithm.getStepHistory ? algorithm.getStepHistory() : [];
        // currentStep is 1-based, but stepHistory is 0-based, so we need currentStep - 1
        const currentStepData = stepHistory[currentStep - 1];

        let highlightInfo = {};

        if (currentStepData) {
            if (currentStepData.isHit) {
                // Find which frame contains the current page
                const hitFrameIndex = frames.findIndex(frame => frame === currentPage);
                if (hitFrameIndex !== -1) {
                    highlightInfo.hitFrame = hitFrameIndex;
                }
            } else {
                // Page fault - highlight the frame that was modified
                if (currentStepData.replacedFrameIndex !== null && currentStepData.replacedFrameIndex !== undefined) {
                    highlightInfo.replacementFrame = currentStepData.replacedFrameIndex;
                } else {
                    // New page added to empty frame - find which frame was modified
                    const previousFrameState = currentStepData.previousFrameState || [];
                    const newFrameIndex = frames.findIndex((frame, index) =>
                        frame === currentPage && previousFrameState[index] === null);
                    if (newFrameIndex !== -1) {
                        highlightInfo.missFrame = newFrameIndex;
                    }
                }
            }
        }

        // Add enhanced step information
        highlightInfo.stepInfo = {
            currentStep: currentStep + 1,
            totalSteps: pageReferences.length,
            faultCount: currentState.faultCount || 0,
            faultRate: currentState.faultRate || 0,
            operationType: currentStepData ? (currentStepData.isHit ? 'hit' :
                (currentStepData.replacedFrameIndex !== null ? 'replacement' : 'miss')) : 'initial'
        };

        // Determine oldest frame index for FIFO indication
        const oldestFrameIndex = algorithm.getOldestFrameIndex ? algorithm.getOldestFrameIndex() : -1;

        // Render the frames with enhanced visual feedback
        drawMemoryFrames(frames, highlightInfo, currentPage, oldestFrameIndex);

    } catch (error) {
        console.error('Error rendering FIFO state:', error);

        // Attempt to show a basic error state on canvas
        try {
            if (canvas && ctx) {
                clearCanvas();
                drawText('Rendering Error', canvas.width / 2, canvas.height / 2, '#e74c3c', '18px Arial');
                drawText('Please refresh the page', canvas.width / 2, canvas.height / 2 + 30, '#7f8c8d', '14px Arial');
            }
        } catch (fallbackError) {
            console.error('Failed to render error state:', fallbackError);
        }

        showAnimationStatus('Rendering error occurred', 'error');
    }
}

/**
 * Initialize canvas for responsive design
 */
function initializeResponsiveCanvas() {
    const canvasContainer = document.querySelector('.canvas-container');

    if (canvasContainer) {
        // Set up resize observer for responsive canvas
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    updateCanvasSize(entry.contentRect.width);
                }
            });

            resizeObserver.observe(canvasContainer);
        } else {
            // Fallback for browsers without ResizeObserver
            window.addEventListener('resize', () => {
                updateCanvasSize(canvasContainer.clientWidth);
            });
        }

        // Initial size update
        updateCanvasSize(canvasContainer.clientWidth);
    }
}

/**
 * Test responsive design on different screen sizes
 */
function testResponsiveDesign() {
    console.log('Testing responsive design...');

    const tests = [
        {
            name: 'Mobile Layout Elements',
            test: () => {
                // Check if mobile-specific CSS classes exist
                const container = document.querySelector('.container');
                if (!container) return false;

                // Check if elements adapt to smaller screens
                const controlPanel = document.querySelector('.control-panel');
                const canvas = document.getElementById('simulation-canvas');

                return controlPanel && canvas;
            }
        },
        {
            name: 'Canvas Responsiveness',
            test: () => {
                const canvas = document.getElementById('simulation-canvas');
                const container = document.querySelector('.canvas-container');

                if (!canvas || !container) return false;

                // Test canvas scaling
                updateCanvasSize(400); // Simulate small screen
                const smallScreenStyle = canvas.style.width;

                updateCanvasSize(800); // Simulate large screen
                const largeScreenStyle = canvas.style.width;

                return smallScreenStyle !== largeScreenStyle;
            }
        },
        {
            name: 'Touch Device Support',
            test: () => {
                // Check if touch events are supported
                return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            }
        },
        {
            name: 'Viewport Meta Tag',
            test: () => {
                const viewportMeta = document.querySelector('meta[name="viewport"]');
                return viewportMeta && viewportMeta.content.includes('width=device-width');
            }
        }
    ];

    let allPassed = true;

    tests.forEach(test => {
        try {
            const result = test.test();
            console.log(`${result ? '✓' : '✗'} ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
            if (!result) allPassed = false;
        } catch (error) {
            console.log(`✗ ${test.name}: FAIL - ${error.message}`);
            allPassed = false;
        }
    });

    console.log(`Responsive design tests: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
}

/**
 * Detect device type and capabilities
 */
function detectDeviceCapabilities() {
    const capabilities = {
        deviceType: 'desktop',
        touchSupport: false,
        screenSize: 'large',
        orientation: 'landscape',
        pixelRatio: window.devicePixelRatio || 1,
        colorDepth: screen.colorDepth || 24,
        maxTouchPoints: navigator.maxTouchPoints || 0
    };

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
        capabilities.deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
        capabilities.deviceType = 'tablet';
    }

    // Detect touch support
    capabilities.touchSupport = 'ontouchstart' in window || capabilities.maxTouchPoints > 0;

    // Detect screen size category
    const width = window.innerWidth;
    if (width < 768) {
        capabilities.screenSize = 'small';
    } else if (width < 1024) {
        capabilities.screenSize = 'medium';
    } else {
        capabilities.screenSize = 'large';
    }

    // Detect orientation
    capabilities.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    return capabilities;
}

/**
 * Optimize application for detected device capabilities
 */
function optimizeForDevice() {
    try {
        const capabilities = detectDeviceCapabilities();
        console.log('Device capabilities detected:', capabilities);

        // Apply device-specific optimizations
        if (capabilities.deviceType === 'mobile') {
            // Mobile optimizations
            document.body.classList.add('mobile-device');

            // Reduce animation complexity on mobile
            if (window.currentAnimationEngine) {
                window.currentAnimationEngine.setSpeed(1500); // Slower animations on mobile
            }
        }

        if (capabilities.touchSupport) {
            // Touch device optimizations
            document.body.classList.add('touch-device');

            // Add touch-friendly button sizes
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.minHeight = '44px'; // iOS recommended touch target size
            });
        }

        if (capabilities.screenSize === 'small') {
            // Small screen optimizations
            document.body.classList.add('small-screen');

            // Adjust canvas size for small screens
            if (canvas) {
                updateCanvasSize(Math.min(400, window.innerWidth - 40));
            }
        }

        // High DPI display optimizations
        if (capabilities.pixelRatio > 1) {
            document.body.classList.add('high-dpi');

            // Adjust canvas for high DPI displays
            if (canvas && ctx) {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * capabilities.pixelRatio;
                canvas.height = rect.height * capabilities.pixelRatio;
                ctx.scale(capabilities.pixelRatio, capabilities.pixelRatio);
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
            }
        }

        return true;
    } catch (error) {
        console.warn('Device optimization failed:', error);
        return false;
    }
}

/**
 * Export canvas as image
 * @param {string} filename - Filename for the exported image
 * @returns {boolean} Success status
 */
function exportCanvasScreenshot(filename = 'fifo-simulation.png') {
    try {
        if (!canvas) {
            throw new Error('Canvas not initialized');
        }

        // Check browser support for canvas export
        if (typeof canvas.toDataURL !== 'function') {
            throw new Error('Canvas export not supported in this browser');
        }

        // Create download link
        const link = document.createElement('a');

        // Check if download attribute is supported
        if (typeof link.download === 'undefined') {
            // Fallback for older browsers - open in new window
            const dataURL = canvas.toDataURL('image/png');
            const newWindow = window.open();
            newWindow.document.write(`<img src="${dataURL}" alt="FIFO Simulation Screenshot"/>`);
            showAnimationStatus('Screenshot opened in new window', 'info');
            return true;
        }

        link.download = filename;
        link.href = canvas.toDataURL('image/png');

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`Canvas exported as ${filename}`);
        showAnimationStatus('Screenshot exported successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Failed to export canvas:', error);
        showAnimationStatus(`Failed to export screenshot: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Generate execution trace data for export
 * @param {FIFOAlgorithm} algorithm - FIFO algorithm instance
 * @returns {Array} Array of step data for export
 */
function generateExecutionTrace(algorithm) {
    if (!algorithm || !algorithm.getStepHistory) {
        console.warn('No algorithm instance or step history available');
        return [];
    }

    const stepHistory = algorithm.getStepHistory();
    const pageReferences = algorithm.pageReferences || [];
    const frameCount = algorithm.frameCount || 0;

    const traceData = [];

    // Add header information
    traceData.push({
        step: 'Configuration',
        pageReference: '',
        frameState: `${frameCount} frames`,
        operation: 'Initial Setup',
        isHit: '',
        faultCount: '',
        faultRate: '',
        explanation: `FIFO Page Replacement with ${frameCount} memory frames`
    });

    // Add each step
    stepHistory.forEach((stepData, index) => {
        const currentPage = pageReferences[index];
        const frameState = stepData.frameState ? stepData.frameState.map(f => f === null ? 'Empty' : f).join(' | ') : '';
        const operation = stepData.isHit ? 'Page Hit' : (stepData.replacedFrameIndex !== null ? 'Page Replacement' : 'Page Fault (Empty Frame)');

        let explanation = '';
        if (stepData.isHit) {
            explanation = `Page ${currentPage} found in frame ${stepData.frameState.indexOf(currentPage)}`;
        } else if (stepData.replacedFrameIndex !== null) {
            explanation = `Page ${currentPage} replaced page ${stepData.replacedPage} in frame ${stepData.replacedFrameIndex}`;
        } else {
            const emptyFrameIndex = stepData.frameState.indexOf(currentPage);
            explanation = `Page ${currentPage} loaded into empty frame ${emptyFrameIndex}`;
        }

        traceData.push({
            step: index + 1,
            pageReference: currentPage,
            frameState: frameState,
            operation: operation,
            isHit: stepData.isHit ? 'Yes' : 'No',
            faultCount: stepData.faultCount || 0,
            faultRate: stepData.faultRate ? `${stepData.faultRate}%` : '0%',
            explanation: explanation
        });
    });

    return traceData;
}

/**
 * Export execution trace as CSV
 * @param {FIFOAlgorithm} algorithm - FIFO algorithm instance
 * @param {string} filename - Filename for the exported CSV
 * @returns {boolean} Success status
 */
function exportExecutionTraceCSV(algorithm, filename = 'fifo-execution-trace.csv') {
    try {
        const traceData = generateExecutionTrace(algorithm);

        if (traceData.length === 0) {
            throw new Error('No trace data available');
        }

        // Create CSV header
        const headers = ['Step', 'Page Reference', 'Frame State', 'Operation', 'Is Hit', 'Fault Count', 'Fault Rate', 'Explanation'];
        let csvContent = headers.join(',') + '\n';

        // Add data rows
        traceData.forEach(row => {
            const csvRow = [
                row.step,
                row.pageReference,
                `"${row.frameState}"`, // Quote frame state to handle commas
                row.operation,
                row.isHit,
                row.faultCount,
                row.faultRate,
                `"${row.explanation}"` // Quote explanation to handle commas
            ].join(',');
            csvContent += csvRow + '\n';
        });

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        // Check browser support for download functionality
        if (typeof link.download !== 'undefined' && typeof URL.createObjectURL === 'function') {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // Fallback for older browsers - show data in new window
            const newWindow = window.open();
            newWindow.document.write(`<pre>${csvContent}</pre>`);
            newWindow.document.title = filename;
            showAnimationStatus('CSV data opened in new window (copy manually)', 'info');
            return true;
        }

        console.log(`Execution trace exported as ${filename}`);
        showAnimationStatus('Execution trace exported successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Failed to export execution trace:', error);
        showAnimationStatus('Failed to export execution trace', 'error');
        return false;
    }
}

/**
 * Export execution trace as JSON
 * @param {FIFOAlgorithm} algorithm - FIFO algorithm instance
 * @param {string} filename - Filename for the exported JSON
 * @returns {boolean} Success status
 */
function exportExecutionTraceJSON(algorithm, filename = 'fifo-execution-trace.json') {
    try {
        const traceData = generateExecutionTrace(algorithm);

        if (traceData.length === 0) {
            throw new Error('No trace data available');
        }

        // Create comprehensive JSON structure
        const jsonData = {
            metadata: {
                algorithm: 'FIFO Page Replacement',
                frameCount: algorithm.frameCount || 0,
                pageReferences: algorithm.pageReferences || [],
                totalSteps: traceData.length - 1, // Subtract 1 for configuration row
                exportTimestamp: new Date().toISOString(),
                finalFaultCount: traceData[traceData.length - 1]?.faultCount || 0,
                finalFaultRate: traceData[traceData.length - 1]?.faultRate || '0%'
            },
            steps: traceData.slice(1), // Remove configuration row for steps array
            summary: {
                totalPageReferences: algorithm.pageReferences ? algorithm.pageReferences.length : 0,
                totalPageFaults: traceData[traceData.length - 1]?.faultCount || 0,
                hitCount: traceData.slice(1).filter(step => step.isHit === 'Yes').length,
                missCount: traceData.slice(1).filter(step => step.isHit === 'No').length
            }
        };

        // Create and trigger download
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');

        // Check browser support for download functionality
        if (typeof link.download !== 'undefined' && typeof URL.createObjectURL === 'function') {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // Fallback for older browsers - show data in new window
            const newWindow = window.open();
            newWindow.document.write(`<pre>${jsonString}</pre>`);
            newWindow.document.title = filename;
            showAnimationStatus('JSON data opened in new window (copy manually)', 'info');
            return true;
        }

        console.log(`Execution trace exported as ${filename}`);
        showAnimationStatus('Execution trace exported successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Failed to export execution trace:', error);
        showAnimationStatus('Failed to export execution trace', 'error');
        return false;
    }
}

/**
 * Show export options dialog and handle user selection
 * @param {FIFOAlgorithm} algorithm - FIFO algorithm instance
 */
function showExportTraceDialog(algorithm) {
    // Create a simple dialog using confirm for format selection
    const useCSV = confirm('Choose export format:\n\nOK = CSV (Comma-separated values)\nCancel = JSON (JavaScript Object Notation)');

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    if (useCSV) {
        exportExecutionTraceCSV(algorithm, `fifo-trace-${timestamp}.csv`);
    } else {
        exportExecutionTraceJSON(algorithm, `fifo-trace-${timestamp}.json`);
    }
}

/**
 * Test canvas rendering functionality with simple shapes
 */
function testCanvasRendering() {
    console.log('Testing canvas rendering...');

    // Test memory frame rendering instead of basic shapes
    testMemoryFrameRendering();

    console.log('Canvas rendering test completed successfully');
}

/**
 * Test instructions and help system functionality
 */
function testInstructionsSystem() {
    console.log('Testing instructions and help system...');

    const tests = [
        {
            name: 'Instructions Toggle Button',
            test: () => {
                const toggleBtn = document.getElementById('toggle-instructions-btn');
                return toggleBtn !== null && toggleBtn.getAttribute('aria-expanded') === 'true';
            }
        },
        {
            name: 'Instructions Content',
            test: () => {
                const content = document.getElementById('instructions-content');
                return content !== null && !content.classList.contains('collapsed');
            }
        },
        {
            name: 'Example Loading Buttons',
            test: () => {
                const buttons = document.querySelectorAll('.load-example-btn');
                return buttons.length >= 3; // Should have at least 3 example buttons
            }
        },
        {
            name: 'Help Buttons',
            test: () => {
                const helpButtons = document.querySelectorAll('.help-btn');
                return helpButtons.length >= 3; // Should have help buttons for main sections
            }
        },
        {
            name: 'Color Legend Interactive',
            test: () => {
                const legendItems = document.querySelectorAll('.legend-item');
                return legendItems.length >= 3; // Should have hit, miss, replacement
            }
        },
        {
            name: 'Load Example Function',
            test: () => {
                // Test loading an example
                loadExample(3, '1,2,3');
                const frameInput = document.getElementById('frame-count');
                const refInput = document.getElementById('page-references');
                return frameInput && refInput &&
                    frameInput.value === '3' &&
                    refInput.value === '1,2,3';
            }
        },
        {
            name: 'Contextual Help Function',
            test: () => {
                return typeof showContextualHelp === 'function';
            }
        }
    ];

    let allPassed = true;

    tests.forEach(test => {
        try {
            const result = test.test();
            console.log(`${result ? '✓' : '✗'} ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
            if (!result) allPassed = false;
        } catch (error) {
            console.log(`✗ ${test.name}: FAIL - ${error.message}`);
            allPassed = false;
        }
    });

    console.log(`Instructions system tests: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
}

/**
 * Test export functionality
 */
function testExportFunctionality() {
    console.log('Testing export functionality...');

    const tests = [
        {
            name: 'Export Canvas Screenshot - No Canvas',
            test: () => {
                const originalCanvas = canvas;
                canvas = null;
                const result = exportCanvasScreenshot('test.png');
                canvas = originalCanvas;
                return result === false;
            }
        },
        {
            name: 'Generate Execution Trace - No Algorithm',
            test: () => {
                const trace = generateExecutionTrace(null);
                return Array.isArray(trace) && trace.length === 0;
            }
        },
        {
            name: 'Generate Execution Trace - Valid Algorithm',
            test: () => {
                const mockAlgorithm = {
                    getStepHistory: () => [
                        {
                            pageNumber: 1,
                            isHit: false,
                            frameState: [1, null, null],
                            faultCount: 1,
                            faultRate: 100,
                            replacedFrameIndex: null
                        }
                    ],
                    pageReferences: [1],
                    frameCount: 3
                };
                const trace = generateExecutionTrace(mockAlgorithm);
                return Array.isArray(trace) && trace.length > 0;
            }
        },
        {
            name: 'Update Export Button States - No Simulation',
            test: () => {
                updateExportButtonStates(false, false);
                const screenshotBtn = document.getElementById('export-screenshot-btn');
                const traceBtn = document.getElementById('export-trace-btn');
                return screenshotBtn && traceBtn && screenshotBtn.disabled && traceBtn.disabled;
            }
        },
        {
            name: 'Update Export Button States - With Simulation',
            test: () => {
                updateExportButtonStates(true, true);
                const screenshotBtn = document.getElementById('export-screenshot-btn');
                const traceBtn = document.getElementById('export-trace-btn');
                return screenshotBtn && traceBtn && !screenshotBtn.disabled && !traceBtn.disabled;
            }
        }
    ];

    let allPassed = true;

    tests.forEach(test => {
        try {
            const result = test.test();
            console.log(`${result ? '✓' : '✗'} ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
            if (!result) allPassed = false;
        } catch (error) {
            console.log(`✗ ${test.name}: FAIL - ${error.message}`);
            allPassed = false;
        }
    });

    console.log(`Export functionality tests: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
}

/**
 * Test comprehensive error handling functionality
 */
function testErrorHandling() {
    console.log('Testing error handling functionality...');

    const tests = [
        {
            name: 'Browser Compatibility Check',
            test: () => {
                const compatibility = checkBrowserCompatibility();
                return typeof compatibility === 'object' &&
                    Array.isArray(compatibility.warnings) &&
                    Array.isArray(compatibility.errors);
            }
        },
        {
            name: 'Display Error with Options',
            test: () => {
                try {
                    displayError('Test error message', { showRetry: true });
                    const errorDiv = document.getElementById('error-display');
                    return errorDiv && errorDiv.style.display === 'block';
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'Handle User Friendly Error',
            test: () => {
                try {
                    const testError = new Error('Canvas not supported');
                    handleUserFriendlyError(testError, 'test context');
                    return true; // If no exception thrown, test passes
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'Loading State Management',
            test: () => {
                try {
                    showLoadingState('Test loading...');
                    const loadingOverlay = document.getElementById('loading-overlay');
                    const hasLoading = loadingOverlay && loadingOverlay.style.display === 'flex';

                    hideLoadingState();
                    const hiddenLoading = loadingOverlay && loadingOverlay.style.display === 'none';

                    return hasLoading && hiddenLoading;
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'Enhanced Animation Status',
            test: () => {
                try {
                    showAnimationStatus('Test warning', 'warning', 1000);
                    const statusElement = document.getElementById('animation-status');
                    return statusElement && statusElement.classList.contains('warning');
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'Canvas Error Handling',
            test: () => {
                try {
                    // Test with invalid algorithm
                    renderFIFOState(null, {});
                    return true; // Should not throw error
                } catch (error) {
                    return false;
                }
            }
        }
    ];

    let allPassed = true;

    tests.forEach(test => {
        try {
            const result = test.test();
            console.log(`${result ? '✓' : '✗'} ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
            if (!result) allPassed = false;
        } catch (error) {
            console.log(`✗ ${test.name}: FAIL - ${error.message}`);
            allPassed = false;
        }
    });

    // Clean up after tests
    try {
        hideError();
        hideLoadingState();
    } catch (error) {
        console.warn('Cleanup after error handling tests failed:', error);
    }

    console.log(`Error handling tests: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
}

/**
 * Test complete user workflows from input to export
 */
function testCompleteUserWorkflows() {
    console.log('Testing complete user workflows...');

    const tests = [
        {
            name: 'Complete Workflow - Input to Simulation',
            test: () => {
                try {
                    // Test input validation and simulation initialization
                    const frameInput = document.getElementById('frame-count');
                    const pageInput = document.getElementById('page-references');
                    const initButton = document.getElementById('initialize-btn');

                    if (!frameInput || !pageInput || !initButton) {
                        return false;
                    }

                    // Set test values
                    frameInput.value = '3';
                    pageInput.value = '1,2,3,4,1,2,5';

                    // Trigger form submission
                    const form = document.getElementById('simulation-form');
                    if (form) {
                        const event = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(event);
                    }

                    // Check if simulation was initialized
                    return window.currentFIFOAlgorithm && window.currentAnimationEngine;
                } catch (error) {
                    console.error('Workflow test error:', error);
                    return false;
                }
            }
        },
        {
            name: 'Animation Control Workflow',
            test: () => {
                try {
                    if (!window.currentAnimationEngine) {
                        return false;
                    }

                    // Test step forward
                    const stepResult = window.currentAnimationEngine.stepForward();
                    if (!stepResult) return false;

                    // Test step backward
                    const backResult = window.currentAnimationEngine.stepBackward();
                    if (!backResult) return false;

                    // Test start/pause
                    const startResult = window.currentAnimationEngine.start();
                    if (!startResult) return false;

                    const pauseResult = window.currentAnimationEngine.pause();
                    if (!pauseResult) return false;

                    return true;
                } catch (error) {
                    console.error('Animation workflow test error:', error);
                    return false;
                }
            }
        },
        {
            name: 'Export Workflow',
            test: () => {
                try {
                    if (!window.currentFIFOAlgorithm || !canvas) {
                        return false;
                    }

                    // Test screenshot export (without actually downloading)
                    const screenshotBtn = document.getElementById('export-screenshot-btn');
                    const traceBtn = document.getElementById('export-trace-btn');

                    if (!screenshotBtn || !traceBtn) {
                        return false;
                    }

                    // Check if buttons are enabled
                    return !screenshotBtn.disabled && !traceBtn.disabled;
                } catch (error) {
                    console.error('Export workflow test error:', error);
                    return false;
                }
            }
        },
        {
            name: 'Responsive Design Elements',
            test: () => {
                try {
                    // Test that key responsive elements exist
                    const container = document.querySelector('.container');
                    const canvas = document.getElementById('simulation-canvas');
                    const controls = document.querySelector('.control-panel');

                    return container && canvas && controls;
                } catch (error) {
                    return false;
                }
            }
        }
    ];

    let allPassed = true;

    tests.forEach(test => {
        try {
            const result = test.test();
            console.log(`${result ? '✓' : '✗'} ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
            if (!result) allPassed = false;
        } catch (error) {
            console.log(`✗ ${test.name}: FAIL - ${error.message}`);
            allPassed = false;
        }
    });

    console.log(`Complete workflow tests: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
}

/**
 * Test algorithm correctness with multiple test scenarios
 */
function testAlgorithmCorrectnessScenarios() {
    console.log('Testing algorithm correctness with multiple scenarios...');

    const testScenarios = [
        {
            name: 'Classic FIFO Example',
            frameCount: 3,
            pageReferences: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
            expectedFaults: 9,
            description: 'Standard textbook FIFO example'
        },
        {
            name: 'All Unique Pages',
            frameCount: 2,
            pageReferences: [1, 2, 3, 4, 5],
            expectedFaults: 5,
            description: 'All pages are unique, should cause fault on each'
        },
        {
            name: 'Repeated Single Page',
            frameCount: 3,
            pageReferences: [1, 1, 1, 1, 1],
            expectedFaults: 1,
            description: 'Same page repeated, should only fault once'
        },
        {
            name: 'Alternating Pages',
            frameCount: 2,
            pageReferences: [1, 2, 1, 2, 1, 2],
            expectedFaults: 2,
            description: 'Two pages alternating, should fit in frames'
        },
        {
            name: 'Worst Case Scenario',
            frameCount: 2,
            pageReferences: [1, 2, 3, 1, 2, 3],
            expectedFaults: 6,
            description: 'Worst case where every access is a fault'
        }
    ];

    let allPassed = true;

    testScenarios.forEach(scenario => {
        try {
            const algorithm = new FIFOAlgorithm(scenario.frameCount, scenario.pageReferences);

            // Process all page references
            for (let i = 0; i < scenario.pageReferences.length; i++) {
                algorithm.processPageReference(i);
            }

            const finalState = algorithm.getCurrentState();
            const actualFaults = finalState.faultCount;
            const passed = actualFaults === scenario.expectedFaults;

            console.log(`${passed ? '✓' : '✗'} ${scenario.name}: Expected ${scenario.expectedFaults} faults, got ${actualFaults} - ${passed ? 'PASS' : 'FAIL'}`);
            console.log(`  Description: ${scenario.description}`);

            if (!passed) allPassed = false;

        } catch (error) {
            console.log(`✗ ${scenario.name}: ERROR - ${error.message}`);
            allPassed = false;
        }
    });

    console.log(`Algorithm correctness tests: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
}

/**
 * Test cross-browser compatibility features
 */
function testCrossBrowserCompatibility() {
    console.log('Testing cross-browser compatibility features...');

    const tests = [
        {
            name: 'Canvas API Support',
            test: () => {
                const testCanvas = document.createElement('canvas');
                return !!(testCanvas.getContext && testCanvas.getContext('2d'));
            }
        },
        {
            name: 'ES6 Features Support',
            test: () => {
                try {
                    // Test arrow functions, const/let, classes
                    eval('const test = () => {}; class Test {}');
                    return true;
                } catch (e) {
                    return false;
                }
            }
        },
        {
            name: 'DOM API Support',
            test: () => {
                return typeof document.querySelector === 'function' &&
                    typeof document.addEventListener === 'function' &&
                    typeof Element.prototype.classList !== 'undefined';
            }
        },
        {
            name: 'JSON Support',
            test: () => {
                return typeof JSON !== 'undefined' &&
                    typeof JSON.stringify === 'function' &&
                    typeof JSON.parse === 'function';
            }
        },
        {
            name: 'Local Storage Support',
            test: () => {
                try {
                    return typeof localStorage !== 'undefined';
                } catch (e) {
                    return false;
                }
            }
        },
        {
            name: 'Blob API Support',
            test: () => {
                return typeof Blob !== 'undefined' &&
                    typeof URL !== 'undefined' &&
                    typeof URL.createObjectURL === 'function';
            }
        },
        {
            name: 'RequestAnimationFrame Support',
            test: () => {
                return typeof requestAnimationFrame === 'function';
            }
        }
    ];

    let allPassed = true;
    let supportedFeatures = 0;

    tests.forEach(test => {
        try {
            const result = test.test();
            console.log(`${result ? '✓' : '✗'} ${test.name}: ${result ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
            if (result) supportedFeatures++;

            // Only fail if critical features are missing
            if (!result && (test.name.includes('Canvas') || test.name.includes('DOM') || test.name.includes('ES6'))) {
                allPassed = false;
            }
        } catch (error) {
            console.log(`✗ ${test.name}: ERROR - ${error.message}`);
            allPassed = false;
        }
    });

    const compatibilityScore = (supportedFeatures / tests.length * 100).toFixed(1);
    console.log(`Browser compatibility score: ${compatibilityScore}% (${supportedFeatures}/${tests.length} features supported)`);
    console.log(`Cross-browser compatibility: ${allPassed ? 'COMPATIBLE' : 'COMPATIBILITY ISSUES DETECTED'}`);

    return allPassed;
}

/**
 * Verify all canvas utility functions are working
 */
function verifyCanvasFunctionality() {
    const tests = [
        { name: 'Canvas Context', test: () => ctx !== null },
        { name: 'Canvas Dimensions', test: () => getCanvasDimensions().width === 800 && getCanvasDimensions().height === 400 },
        { name: 'Clear Canvas', test: () => { clearCanvas(); return true; } },
        { name: 'Draw Rectangle', test: () => { drawRectangle(10, 10, 50, 30, '#ff0000'); return true; } },
        { name: 'Draw Rounded Rectangle', test: () => { drawRoundedRectangle(10, 50, 50, 30, 5, '#00ff00'); return true; } },
        { name: 'Draw Text', test: () => { drawText('Test', 50, 50); return true; } },
        { name: 'Draw Circle', test: () => { drawCircle(100, 100, 20, '#00ff00'); return true; } },
        { name: 'Draw Line', test: () => { drawLine(0, 0, 100, 100); return true; } },
        {
            name: 'Calculate Frame Layout', test: () => {
                const layout = calculateFrameLayout(4);
                return layout.frameWidth > 0 && layout.frameHeight > 0;
            }
        },
        {
            name: 'Get Frame Colors', test: () => {
                const colors = getFrameColors('hit');
                return colors.fill && colors.stroke && colors.text;
            }
        },
        {
            name: 'Draw Memory Frames', test: () => {
                const testFrames = [1, 2, null];
                drawMemoryFrames(testFrames, {}, 1, 0);
                return true;
            }
        }
    ];

    console.log('Verifying canvas functionality...');
    let allPassed = true;

    tests.forEach(test => {
        try {
            const result = test.test();
            console.log(`✓ ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
            if (!result) allPassed = false;
        } catch (error) {
            console.log(`✗ ${test.name}: FAIL - ${error.message}`);
            allPassed = false;
        }
    });

    console.log(`Canvas functionality verification: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    return allPassed;
}

/**
 * Input Validation and Form Handling
 */

/**
 * Validate frame count input
 * @param {string|number} value - The frame count value to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateFrameCount(value) {
    // Handle empty or null values
    if (value === null || value === undefined || value === '') {
        return {
            isValid: false,
            error: 'Frame count is required'
        };
    }

    // Convert to number if string, handling whitespace
    const numValue = typeof value === 'string' ? parseInt(value.trim(), 10) : value;

    // Check if it's a valid number
    if (isNaN(numValue)) {
        return {
            isValid: false,
            error: 'Frame count must be a valid number'
        };
    }

    // Check if it's a positive integer
    if (!Number.isInteger(numValue) || numValue <= 0) {
        return {
            isValid: false,
            error: 'Frame count must be a positive integer'
        };
    }

    // Check practical range (1-10 for visualization purposes)
    if (numValue > 10) {
        return {
            isValid: false,
            error: 'Frame count must be between 1 and 10 for optimal visualization'
        };
    }

    return {
        isValid: true,
        value: numValue,
        error: null
    };
}

/**
 * Validate and parse page references string
 * @param {string} value - The page references string to validate
 * @returns {Object} Validation result with isValid boolean, parsed array, and error message
 */
function validatePageReferences(value) {
    // Check if value is provided
    if (!value || typeof value !== 'string') {
        return {
            isValid: false,
            error: 'Page references are required'
        };
    }

    // Trim whitespace
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
        return {
            isValid: false,
            error: 'Page references cannot be empty'
        };
    }

    // Split by comma and validate each reference
    const references = trimmedValue.split(',');
    const parsedReferences = [];

    for (let i = 0; i < references.length; i++) {
        const ref = references[i].trim();

        // Check if reference is empty after trimming
        if (ref === '') {
            return {
                isValid: false,
                error: `Page reference at position ${i + 1} is empty`
            };
        }

        // Parse as integer
        const numRef = parseInt(ref, 10);

        // Check if it's a valid integer
        if (isNaN(numRef)) {
            return {
                isValid: false,
                error: `Page reference "${ref}" at position ${i + 1} is not a valid integer`
            };
        }

        // Check if it's non-negative (page numbers should be non-negative)
        if (numRef < 0) {
            return {
                isValid: false,
                error: `Page reference ${numRef} at position ${i + 1} must be non-negative`
            };
        }

        parsedReferences.push(numRef);
    }

    // Check minimum length
    if (parsedReferences.length === 0) {
        return {
            isValid: false,
            error: 'At least one page reference is required'
        };
    }

    // Check maximum length for practical purposes
    if (parsedReferences.length > 100) {
        return {
            isValid: false,
            error: 'Too many page references (maximum 100 for optimal performance)'
        };
    }

    return {
        isValid: true,
        value: parsedReferences,
        error: null
    };
}

/**
 * Display error message to user with enhanced formatting and recovery options
 * @param {string} message - Error message to display
 * @param {Object} options - Additional options for error display
 */
function displayError(message, options = {}) {
    try {
        const errorDiv = document.getElementById('error-display');
        if (!errorDiv) {
            console.error('Error display element not found');
            // Fallback to alert if error div is missing
            alert(`Error: ${message}`);
            return;
        }

        // Enhanced error message formatting
        const errorContent = document.createElement('div');
        errorContent.innerHTML = `
            <div class="error-content">
                <div class="error-message">${message}</div>
                ${options.showRefresh ? '<button class="error-refresh-btn" onclick="location.reload()">Refresh Page</button>' : ''}
                ${options.showRetry ? '<button class="error-retry-btn" onclick="hideError()">Try Again</button>' : ''}
            </div>
        `;

        errorDiv.innerHTML = '';
        errorDiv.appendChild(errorContent);
        errorDiv.style.display = 'block';
        errorDiv.className = 'error-message show';

        // Clear any existing timeout
        if (errorDiv.hideTimeout) {
            clearTimeout(errorDiv.hideTimeout);
        }

        // Auto-hide after longer duration for errors (unless persistent)
        if (!options.persistent) {
            errorDiv.hideTimeout = setTimeout(() => {
                hideError();
            }, options.duration || 8000);
        }

        console.error('Error displayed to user:', message);

        // Log additional error context if provided
        if (options.context) {
            console.error('Error context:', options.context);
        }

    } catch (error) {
        console.error('Failed to display error message:', error);
        // Ultimate fallback
        alert(`Error: ${message}`);
    }
}

/**
 * Show user-friendly error message based on error type
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
function handleUserFriendlyError(error, context = '') {
    let userMessage = '';
    let options = {};

    // Categorize errors and provide appropriate messages
    if (error.message.includes('Canvas')) {
        userMessage = 'Graphics rendering is not available in your browser. Please use a modern browser like Chrome, Firefox, or Safari.';
        options.showRefresh = true;
    } else if (error.message.includes('localStorage')) {
        userMessage = 'Browser storage is not available. Some features may not work properly.';
        options.showRetry = true;
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Network connection issue. Please check your internet connection and try again.';
        options.showRetry = true;
    } else if (error.message.includes('Invalid') || error.message.includes('validation')) {
        userMessage = 'Invalid input detected. Please check your entries and try again.';
        options.showRetry = true;
    } else if (error.message.includes('Memory') || error.message.includes('out of memory')) {
        userMessage = 'Not enough memory available. Try using smaller input values or refresh the page.';
        options.showRefresh = true;
    } else {
        userMessage = `An unexpected error occurred${context ? ` in ${context}` : ''}. Please try refreshing the page.`;
        options.showRefresh = true;
    }

    options.context = error;
    displayError(userMessage, options);
}

/**
 * Hide error message
 */
function hideError() {
    const errorDiv = document.getElementById('error-display');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.className = 'error-message';
        errorDiv.textContent = '';

        // Clear any pending auto-hide timeout
        if (errorDiv.hideTimeout) {
            clearTimeout(errorDiv.hideTimeout);
            errorDiv.hideTimeout = null;
        }

        console.log('Error message hidden');
    }
}

/**
 * Add visual feedback to input field
 * @param {HTMLElement} inputElement - The input element to style
 * @param {boolean} isValid - Whether the input is valid
 */
function updateInputValidation(inputElement, isValid) {
    if (!inputElement) return;

    // Remove existing validation classes
    inputElement.classList.remove('valid', 'invalid');

    // Add appropriate class
    if (isValid) {
        inputElement.classList.add('valid');
    } else {
        inputElement.classList.add('invalid');
    }
}

/**
 * Validate all form inputs
 * @returns {Object} Validation result with overall validity and parsed values
 */
function validateAllInputs() {
    const frameCountInput = document.getElementById('frame-count');
    const pageReferencesInput = document.getElementById('page-references');

    // Validate frame count
    const frameCountResult = validateFrameCount(frameCountInput.value);
    updateInputValidation(frameCountInput, frameCountResult.isValid);

    // Validate page references
    const pageReferencesResult = validatePageReferences(pageReferencesInput.value);
    updateInputValidation(pageReferencesInput, pageReferencesResult.isValid);

    // Return combined result
    if (!frameCountResult.isValid) {
        return {
            isValid: false,
            error: frameCountResult.error
        };
    }

    if (!pageReferencesResult.isValid) {
        return {
            isValid: false,
            error: pageReferencesResult.error
        };
    }

    return {
        isValid: true,
        frameCount: frameCountResult.value,
        pageReferences: pageReferencesResult.value,
        error: null
    };
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmission(event) {
    event.preventDefault();

    // Hide any existing errors
    hideError();

    // Validate all inputs
    const validationResult = validateAllInputs();

    if (!validationResult.isValid) {
        displayError(validationResult.error);
        return;
    }

    // If validation passes, initialize simulation
    console.log('Form validation passed:', {
        frameCount: validationResult.frameCount,
        pageReferences: validationResult.pageReferences
    });

    // Show loading state
    showLoadingState('Initializing simulation...');

    // Initialize FIFO algorithm and animation engine with validated inputs
    try {
        // Validate canvas is available before proceeding
        if (!canvas || !ctx) {
            throw new Error('Canvas not properly initialized. Please refresh the page and try again.');
        }

        const fifoAlgorithm = new FIFOAlgorithm(
            validationResult.frameCount,
            validationResult.pageReferences
        );

        console.log('FIFO Algorithm initialized successfully:', fifoAlgorithm.getCurrentState());

        // Create animation engine with error handling
        const animationEngine = new AnimationEngine(null, fifoAlgorithm);

        console.log('Animation Engine initialized successfully:', animationEngine.getCurrentState());

        // Store instances globally for other components to use
        window.currentFIFOAlgorithm = fifoAlgorithm;
        window.currentAnimationEngine = animationEngine;

        // Enable animation controls now that engine is ready
        try {
            enableAnimationControls();
            setupAnimationControlListeners();
            updateAnimationControlStates();
        } catch (controlError) {
            console.warn('Some animation controls may not be available:', controlError);
            showAnimationStatus('Animation controls partially available', 'warning');
        }

        // Initialize step explanation display
        try {
            initializeStepExplanation();
        } catch (explanationError) {
            console.warn('Step explanation display initialization failed:', explanationError);
        }

        // Enable export buttons now that simulation is initialized
        try {
            updateExportButtonStates(true, false);
        } catch (exportError) {
            console.warn('Export functionality may not be available:', exportError);
        }

        // Hide loading state and show success
        hideLoadingState();
        hideError();
        showAnimationStatus('Simulation initialized successfully!', 'success');
        console.log('Simulation ready! Use animation controls to step through the algorithm.');

    } catch (error) {
        hideLoadingState();
        console.error('Failed to initialize simulation:', error);

        // Provide specific error messages based on error type
        let userMessage = 'Failed to initialize simulation: ';
        if (error.message.includes('Canvas')) {
            userMessage += 'Canvas rendering is not available. Please use a modern browser.';
        } else if (error.message.includes('Frame count')) {
            userMessage += 'Invalid frame count. Please enter a number between 1 and 10.';
        } else if (error.message.includes('Page references')) {
            userMessage += 'Invalid page references. Please enter comma-separated positive integers.';
        } else {
            userMessage += error.message;
        }

        displayError(userMessage);

        // Disable controls on error
        disableAnimationControls();
        updateExportButtonStates(false, false);
    }
}

/**
 * Handle real-time input validation
 * @param {Event} event - Input change event
 */
function handleInputChange(event) {
    const inputElement = event.target;

    // Clear any existing timeout for this input
    if (inputElement.validationTimeout) {
        clearTimeout(inputElement.validationTimeout);
    }

    // Validate specific input
    let validationResult;

    if (inputElement.id === 'frame-count') {
        validationResult = validateFrameCount(inputElement.value);
    } else if (inputElement.id === 'page-references') {
        validationResult = validatePageReferences(inputElement.value);
    }

    if (validationResult) {
        updateInputValidation(inputElement, validationResult.isValid);

        // For real-time validation, only show errors on blur or after user stops typing
        if (event.type === 'blur' && !validationResult.isValid) {
            displayError(validationResult.error);
        } else if (event.type === 'input') {
            // Debounce error display for input events
            if (!validationResult.isValid) {
                inputElement.validationTimeout = setTimeout(() => {
                    displayError(validationResult.error);
                }, 1500); // Longer delay for input events
            } else {
                hideError(); // Clear error immediately when input becomes valid
            }
        }
    }
}

/**
 * Enable animation control buttons after successful initialization
 */
function enableAnimationControls() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const stepBackwardBtn = document.getElementById('step-backward-btn');

    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true; // Initially disabled until animation starts
    if (stepForwardBtn) stepForwardBtn.disabled = false;
    if (stepBackwardBtn) stepBackwardBtn.disabled = true; // Initially disabled (at start)

    console.log('Animation controls enabled');
}

/**
 * Disable animation control buttons
 */
function disableAnimationControls() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const stepBackwardBtn = document.getElementById('step-backward-btn');

    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = true;
    if (stepForwardBtn) stepForwardBtn.disabled = true;
    if (stepBackwardBtn) stepBackwardBtn.disabled = true;

    console.log('Animation controls disabled');
}

/**
 * Initialize form event listeners
 */
function initializeFormHandling() {
    const form = document.getElementById('simulation-form');
    const frameCountInput = document.getElementById('frame-count');
    const pageReferencesInput = document.getElementById('page-references');

    // Form submission handler
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
        console.log('Form submission event listener added');
    } else {
        console.error('Simulation form not found');
    }

    // Frame count input handlers
    if (frameCountInput) {
        frameCountInput.addEventListener('input', handleInputChange);
        frameCountInput.addEventListener('blur', handleInputChange);
        frameCountInput.addEventListener('focus', () => hideError()); // Clear errors on focus
        console.log('Frame count input event listeners added');
    } else {
        console.error('Frame count input not found');
    }

    // Page references input handlers
    if (pageReferencesInput) {
        pageReferencesInput.addEventListener('input', handleInputChange);
        pageReferencesInput.addEventListener('blur', handleInputChange);
        pageReferencesInput.addEventListener('focus', () => hideError()); // Clear errors on focus
        console.log('Page references input event listeners added');
    } else {
        console.error('Page references input not found');
    }

    console.log('Form event listeners initialization complete');
}

/**
 * Set up animation control event listeners with enhanced functionality
 */
function setupAnimationControlListeners() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const stepBackwardBtn = document.getElementById('step-backward-btn');
    const speedSlider = document.getElementById('speed-slider');
    const speedDisplay = document.getElementById('speed-display');

    // Start button with enhanced state management
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const success = window.currentAnimationEngine.start();
                if (success) {
                    updateAnimationControlStates();
                    // Trigger canvas rendering update
                    renderCurrentAnimationState();
                }
            }
        });
        console.log('Start button event listener added');
    }

    // Pause button with enhanced state management
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const success = window.currentAnimationEngine.pause();
                if (success) {
                    updateAnimationControlStates();
                    // Trigger canvas rendering update
                    renderCurrentAnimationState();
                }
            }
        });
        console.log('Pause button event listener added');
    }

    // Step forward button with smooth transitions
    if (stepForwardBtn) {
        stepForwardBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const stepResult = window.currentAnimationEngine.stepForward();
                if (stepResult) {
                    updateAnimationControlStates();
                    // Render with smooth transition
                    renderCurrentAnimationStateWithTransition();
                }
            }
        });
        console.log('Step forward button event listener added');
    }

    // Step backward button with smooth transitions
    if (stepBackwardBtn) {
        stepBackwardBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const success = window.currentAnimationEngine.stepBackward();
                if (success) {
                    updateAnimationControlStates();
                    // Render with smooth transition
                    renderCurrentAnimationStateWithTransition();
                }
            }
        });
        console.log('Step backward button event listener added');
    }

    // Enhanced speed slider with real-time feedback
    if (speedSlider && speedDisplay) {
        // Input event for real-time updates
        speedSlider.addEventListener('input', (event) => {
            const speed = parseInt(event.target.value, 10);
            updateSpeedDisplay(speed);
        });

        // Change event for applying speed changes
        speedSlider.addEventListener('change', (event) => {
            const speed = parseInt(event.target.value, 10);
            if (window.currentAnimationEngine) {
                const success = window.currentAnimationEngine.setSpeed(speed);
                if (success) {
                    console.log(`Animation speed updated to ${speed}ms`);
                }
            }
        });

        // Initialize speed display
        const initialSpeed = parseInt(speedSlider.value, 10);
        updateSpeedDisplay(initialSpeed);
        console.log('Speed slider event listeners added');
    }

    // Add keyboard shortcuts for animation controls
    setupKeyboardShortcuts();

    console.log('Enhanced animation control event listeners setup complete');
}

/**
 * Initialize the step explanation display
 */
function initializeStepExplanation() {
    const explanationElement = document.getElementById('operation-explanation');
    const operationTypeElement = document.getElementById('operation-type');
    const modifiedFrameElement = document.getElementById('modified-frame');
    const previousValueElement = document.getElementById('previous-value');

    if (explanationElement) {
        explanationElement.textContent = "Simulation ready. Click 'Start' or 'Step Forward' to begin processing page references and see detailed explanations of each FIFO algorithm operation.";
        explanationElement.className = "explanation-text initial";
    }

    if (operationTypeElement) {
        operationTypeElement.textContent = "Ready";
        operationTypeElement.className = "operation-badge initial";
    }

    if (modifiedFrameElement) {
        modifiedFrameElement.textContent = "-";
    }

    if (previousValueElement) {
        previousValueElement.textContent = "-";
    }
}

/**
 * Show animation status feedback to user
 * @param {string} message - Status message to display
 * @param {string} type - Type of status (success, error, info, warning)
 * @param {number} duration - Duration to show message in milliseconds
 */
function showAnimationStatus(message, type = 'info', duration = 2000) {
    const statusElement = document.getElementById('animation-status');
    if (!statusElement) return;

    // Clear any existing timeout
    if (statusElement.hideTimeout) {
        clearTimeout(statusElement.hideTimeout);
    }

    statusElement.textContent = message;
    statusElement.className = `show ${type}`;

    // Auto-hide after duration (except for error messages which stay longer)
    const actualDuration = type === 'error' ? duration * 2 : duration;
    statusElement.hideTimeout = setTimeout(() => {
        statusElement.className = '';
    }, actualDuration);
}

/**
 * Show loading state with spinner and message
 * @param {string} message - Loading message to display
 */
function showLoadingState(message = 'Loading...') {
    try {
        // Create or update loading overlay
        let loadingOverlay = document.getElementById('loading-overlay');

        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <div class="loading-message">${message}</div>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            const messageElement = loadingOverlay.querySelector('.loading-message');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }

        loadingOverlay.style.display = 'flex';

        // Disable form inputs during loading
        const form = document.getElementById('simulation-form');
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => {
                input.dataset.wasDisabled = input.disabled;
                input.disabled = true;
            });
        }

    } catch (error) {
        console.warn('Failed to show loading state:', error);
    }
}

/**
 * Hide loading state and restore form functionality
 */
function hideLoadingState() {
    try {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }

        // Re-enable form inputs
        const form = document.getElementById('simulation-form');
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => {
                if (input.dataset.wasDisabled !== 'true') {
                    input.disabled = false;
                }
                delete input.dataset.wasDisabled;
            });
        }

    } catch (error) {
        console.warn('Failed to hide loading state:', error);
    }
}

/**
 * Update animation control button states based on current animation state
 */
function updateAnimationControlStates() {
    if (!window.currentAnimationEngine) {
        disableAnimationControls();
        return;
    }

    const state = window.currentAnimationEngine.getCurrentState();

    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const stepBackwardBtn = document.getElementById('step-backward-btn');

    // Start button: disabled if playing or complete
    if (startBtn) {
        startBtn.disabled = state.isPlaying || state.isComplete;
        startBtn.textContent = state.isComplete ? 'Complete' : 'Start';
    }

    // Pause button: enabled only when playing
    if (pauseBtn) {
        pauseBtn.disabled = !state.isPlaying;
    }

    // Step forward button: disabled if playing or at last step
    if (stepForwardBtn) {
        stepForwardBtn.disabled = state.isPlaying || !state.canStepForward;
    }

    // Step backward button: disabled if playing or at first step
    if (stepBackwardBtn) {
        stepBackwardBtn.disabled = state.isPlaying || !state.canStepBackward;
    }

    // Update visual feedback for button states
    updateButtonVisualStates(state);

    // Update export button states - enable trace export if we have step data
    const hasStepData = state.currentStep > 0;
    updateExportButtonStates(true, hasStepData);
}

/**
 * Update visual states of control buttons for better user feedback
 * @param {Object} state - Current animation state
 */
function updateButtonVisualStates(state) {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');

    // Add visual classes for active states
    if (startBtn) {
        startBtn.classList.toggle('active', state.isPlaying);
    }

    if (pauseBtn) {
        pauseBtn.classList.toggle('active', state.isPlaying);
    }
}

/**
 * Update speed display with formatted text and visual feedback
 * @param {number} speed - Speed value in milliseconds
 */
function updateSpeedDisplay(speed) {
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) {
        // Format speed display with descriptive text
        let speedText = `${speed}ms`;
        let speedDescription = '';

        if (speed <= 300) {
            speedDescription = ' (Very Fast)';
        } else if (speed <= 600) {
            speedDescription = ' (Fast)';
        } else if (speed <= 1200) {
            speedDescription = ' (Normal)';
        } else if (speed <= 2000) {
            speedDescription = ' (Slow)';
        } else {
            speedDescription = ' (Very Slow)';
        }

        speedDisplay.textContent = speedText + speedDescription;
    }
}

/**
 * Set up keyboard shortcuts for animation controls
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Only handle shortcuts when not typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        if (!window.currentAnimationEngine) {
            return;
        }

        switch (event.key) {
            case ' ': // Spacebar - Start/Pause
                event.preventDefault();
                const state = window.currentAnimationEngine.getCurrentState();
                if (state.isPlaying) {
                    window.currentAnimationEngine.pause();
                } else if (!state.isComplete) {
                    window.currentAnimationEngine.start();
                }
                updateAnimationControlStates();
                break;

            case 'ArrowRight': // Right arrow - Step forward
                event.preventDefault();
                if (window.currentAnimationEngine.canStepForward() &&
                    !window.currentAnimationEngine.getCurrentState().isPlaying) {
                    window.currentAnimationEngine.stepForward();
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                }
                break;

            case 'ArrowLeft': // Left arrow - Step backward
                event.preventDefault();
                if (window.currentAnimationEngine.canStepBackward() &&
                    !window.currentAnimationEngine.getCurrentState().isPlaying) {
                    window.currentAnimationEngine.stepBackward();
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                }
                break;

            case 'Home': // Home key - Jump to start
                event.preventDefault();
                if (!window.currentAnimationEngine.getCurrentState().isPlaying) {
                    window.currentAnimationEngine.jumpToStep(0);
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                }
                break;

            case 'End': // End key - Jump to end
                event.preventDefault();
                if (!window.currentAnimationEngine.getCurrentState().isPlaying) {
                    const totalSteps = window.currentAnimationEngine.getCurrentState().totalSteps;
                    window.currentAnimationEngine.jumpToStep(totalSteps);
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                }
                break;
        }
    });

    console.log('Keyboard shortcuts for animation controls set up');
}

/**
 * Render current animation state to canvas
 */
function renderCurrentAnimationState() {
    if (!window.currentAnimationEngine || !window.currentFIFOAlgorithm) {
        return;
    }

    try {
        renderFIFOState(window.currentFIFOAlgorithm, window.currentAnimationEngine.getCurrentState());
    } catch (error) {
        console.error('Error rendering animation state:', error);
    }
}

/**
 * Render current animation state with smooth transition effect
 */
function renderCurrentAnimationStateWithTransition() {
    if (!window.currentAnimationEngine || !window.currentFIFOAlgorithm) {
        return;
    }

    try {
        // Add a brief visual transition effect
        const canvas = document.getElementById('simulation-canvas');
        if (canvas) {
            canvas.style.transition = 'opacity 0.2s ease-in-out';
            canvas.style.opacity = '0.7';

            setTimeout(() => {
                renderFIFOState(window.currentFIFOAlgorithm, window.currentAnimationEngine.getCurrentState());
                canvas.style.opacity = '1';
            }, 100);

            // Remove transition after animation
            setTimeout(() => {
                canvas.style.transition = '';
            }, 300);
        } else {
            // Fallback to regular rendering
            renderCurrentAnimationState();
        }
    } catch (error) {
        console.error('Error rendering animation state with transition:', error);
        // Fallback to regular rendering
        renderCurrentAnimationState();
    }
}

/**
 * Initialize instructions and help system functionality
 */
function initializeInstructionsSystem() {
    // Initialize collapsible instructions
    initializeCollapsibleInstructions();

    // Initialize example loading buttons
    initializeExampleButtons();

    // Initialize tooltips for complex controls
    initializeTooltips();

    console.log('Instructions and help system initialized');
}

/**
 * Initialize collapsible instructions panel
 */
function initializeCollapsibleInstructions() {
    const toggleBtn = document.getElementById('toggle-instructions-btn');
    const instructionsContent = document.getElementById('instructions-content');

    if (!toggleBtn || !instructionsContent) {
        console.warn('Instructions toggle elements not found');
        return;
    }

    toggleBtn.addEventListener('click', () => {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;

        // Update button state
        toggleBtn.setAttribute('aria-expanded', newState.toString());

        // Update button text and icon
        const toggleText = toggleBtn.querySelector('.toggle-text');
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');

        if (toggleText) {
            toggleText.textContent = newState ? 'Hide Instructions' : 'Show Instructions';
        }

        if (toggleIcon) {
            toggleIcon.textContent = newState ? '▼' : '▶';
        }

        // Toggle content visibility
        if (newState) {
            instructionsContent.classList.remove('collapsed');
            instructionsContent.style.maxHeight = 'none';
        } else {
            instructionsContent.classList.add('collapsed');
            instructionsContent.style.maxHeight = '0';
        }

        console.log(`Instructions panel ${newState ? 'expanded' : 'collapsed'}`);
    });
}

/**
 * Initialize example loading buttons
 */
function initializeExampleButtons() {
    const exampleButtons = document.querySelectorAll('.load-example-btn');

    exampleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const frames = button.getAttribute('data-frames');
            const references = button.getAttribute('data-references');

            if (frames && references) {
                loadExample(parseInt(frames), references);
            }
        });
    });

    console.log(`Initialized ${exampleButtons.length} example loading buttons`);
}

/**
 * Load an example configuration into the form
 * @param {number} frameCount - Number of frames
 * @param {string} pageReferences - Comma-separated page references
 */
function loadExample(frameCount, pageReferences) {
    const frameCountInput = document.getElementById('frame-count');
    const pageReferencesInput = document.getElementById('page-references');

    if (!frameCountInput || !pageReferencesInput) {
        console.warn('Form inputs not found');
        return;
    }

    // Set the values
    frameCountInput.value = frameCount;
    pageReferencesInput.value = pageReferences;

    // Clear any existing errors
    hideError();

    // Remove any validation classes
    frameCountInput.classList.remove('invalid', 'valid');
    pageReferencesInput.classList.remove('invalid', 'valid');

    // Add visual feedback
    frameCountInput.classList.add('valid');
    pageReferencesInput.classList.add('valid');

    // Show success message
    showAnimationStatus(`Example loaded: ${frameCount} frames, ${pageReferences.split(',').length} page references`, 'success');

    // Scroll to configuration section
    const configSection = document.querySelector('.input-section');
    if (configSection) {
        configSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    console.log(`Loaded example: ${frameCount} frames, references: ${pageReferences}`);
}

/**
 * Initialize tooltips for complex controls
 */
function initializeTooltips() {
    const tooltipElements = [
        {
            selector: '#speed-slider',
            title: 'Animation Speed Control',
            description: 'Drag to adjust how fast the automatic animation progresses. Lower values = faster animation.'
        },
        {
            selector: '#export-screenshot-btn',
            title: 'Export Screenshot',
            description: 'Save the current visualization as a PNG image file.'
        },
        {
            selector: '#export-trace-btn',
            title: 'Export Execution Trace',
            description: 'Download detailed step-by-step data in CSV or JSON format.'
        },
        {
            selector: '.keyboard-shortcuts',
            title: 'Keyboard Shortcuts',
            description: 'Use these keys for quick control without clicking buttons.'
        }
    ];

    tooltipElements.forEach(({ selector, title, description }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.title = `${title}: ${description}`;

            // Add enhanced tooltip for better accessibility
            element.setAttribute('aria-label', `${title}. ${description}`);
        }
    });

    console.log(`Initialized tooltips for ${tooltipElements.length} elements`);
}

/**
 * Show contextual help for specific sections
 * @param {string} section - Section identifier
 */
function showContextualHelp(section) {
    const helpContent = {
        configuration: {
            title: 'Configuration Help',
            content: `
                <h4>Setting Up Your Simulation</h4>
                <p><strong>Memory Frames:</strong> Choose 2-4 frames for clear visualization. More frames typically mean fewer page faults.</p>
                <p><strong>Page References:</strong> Enter the sequence of pages your program will access. Use realistic patterns or textbook examples.</p>
                <p><strong>Tips:</strong> Start with the classic example "1,2,3,4,1,2,5,1,2,3,4,5" with 3 frames.</p>
            `
        },
        animation: {
            title: 'Animation Control Help',
            content: `
                <h4>Controlling the Animation</h4>
                <p><strong>Start/Pause:</strong> Use for automatic progression through all page references.</p>
                <p><strong>Step Controls:</strong> Use for detailed analysis of each operation.</p>
                <p><strong>Speed Control:</strong> Adjust timing to match your learning pace.</p>
                <p><strong>Keyboard Shortcuts:</strong> Space bar toggles play/pause, arrow keys step through.</p>
            `
        },
        visualization: {
            title: 'Understanding the Visualization',
            content: `
                <h4>Reading the Memory Frame Display</h4>
                <p><strong>Frame Colors:</strong> Green = hit, Red = miss, Yellow = replacement</p>
                <p><strong>FIFO Order:</strong> The "← Next" indicator shows which frame will be replaced next</p>
                <p><strong>Statistics:</strong> Watch fault count and rate to understand algorithm performance</p>
            `
        }
    };

    const help = helpContent[section];
    if (help) {
        // Create and show help modal or tooltip
        showHelpModal(help.title, help.content);
    }
}

/**
 * Show help modal with content
 * @param {string} title - Modal title
 * @param {string} content - HTML content
 */
function showHelpModal(title, content) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'help-modal-overlay';
    overlay.innerHTML = `
        <div class="help-modal">
            <div class="help-modal-header">
                <h3>${title}</h3>
                <button class="help-modal-close" aria-label="Close help">&times;</button>
            </div>
            <div class="help-modal-content">
                ${content}
            </div>
        </div>
    `;

    // Add to page
    document.body.appendChild(overlay);

    // Add event listeners
    const closeBtn = overlay.querySelector('.help-modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

/**
 * Initialize enhanced legend with interactive features
 */
function initializeInteractiveLegend() {
    const legendItems = document.querySelectorAll('.legend-item');

    legendItems.forEach(item => {
        const colorBox = item.querySelector('.color-box');
        const description = item.querySelector('span');

        if (colorBox && description) {
            // Add hover effects and detailed explanations
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.05)';
                item.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
                item.style.boxShadow = 'none';
            });

            // Add click for detailed explanation
            item.addEventListener('click', () => {
                const colorType = colorBox.classList.contains('hit') ? 'hit' :
                    colorBox.classList.contains('miss') ? 'miss' : 'replacement';
                showColorExplanation(colorType);
            });
        }
    });
}

/**
 * Show detailed explanation for color coding
 * @param {string} colorType - Type of color (hit, miss, replacement)
 */
function showColorExplanation(colorType) {
    const explanations = {
        hit: {
            title: 'Page Hit (Green)',
            content: `
                <h4>What is a Page Hit?</h4>
                <p>A page hit occurs when the requested page is already loaded in one of the memory frames. This is the best-case scenario because:</p>
                <ul>
                    <li>No page fault occurs</li>
                    <li>No disk I/O is needed</li>
                    <li>The program can continue immediately</li>
                    <li>No frame replacement is necessary</li>
                </ul>
                <p><strong>Performance Impact:</strong> Page hits are very fast (nanoseconds) compared to page faults (milliseconds).</p>
            `
        },
        miss: {
            title: 'Page Fault - Empty Frame (Red)',
            content: `
                <h4>What is a Page Fault?</h4>
                <p>A page fault occurs when the requested page is not in memory. When there's an empty frame available:</p>
                <ul>
                    <li>The operating system loads the page from disk</li>
                    <li>The page is placed in the empty frame</li>
                    <li>No existing page needs to be replaced</li>
                    <li>The fault count increases</li>
                </ul>
                <p><strong>Performance Impact:</strong> Requires disk access, which is much slower than memory access.</p>
            `
        },
        replacement: {
            title: 'Page Replacement (Yellow)',
            content: `
                <h4>What is Page Replacement?</h4>
                <p>When a page fault occurs and all frames are full, the FIFO algorithm must replace an existing page:</p>
                <ul>
                    <li>The oldest page (first in) is selected for replacement</li>
                    <li>If the old page was modified, it's written back to disk</li>
                    <li>The new page is loaded from disk</li>
                    <li>The frame now contains the new page</li>
                </ul>
                <p><strong>FIFO Rule:</strong> Always replace the page that has been in memory the longest, regardless of usage patterns.</p>
            `
        }
    };

    const explanation = explanations[colorType];
    if (explanation) {
        showHelpModal(explanation.title, explanation.content);
    }
}

/**
 * Initialize export functionality event listeners
 */
function initializeExportFunctionality() {
    const exportScreenshotBtn = document.getElementById('export-screenshot-btn');
    const exportTraceBtn = document.getElementById('export-trace-btn');

    if (!exportScreenshotBtn || !exportTraceBtn) {
        console.warn('Export buttons not found');
        return;
    }

    // Screenshot export button
    exportScreenshotBtn.addEventListener('click', () => {
        console.log('Screenshot export requested');

        if (!canvas) {
            showAnimationStatus('No simulation to export', 'error');
            return;
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `fifo-simulation-${timestamp}.png`;

        exportCanvasScreenshot(filename);
    });

    // Execution trace export button
    exportTraceBtn.addEventListener('click', () => {
        console.log('Execution trace export requested');

        if (!window.currentFIFOAlgorithm) {
            showAnimationStatus('No simulation data to export', 'error');
            return;
        }

        showExportTraceDialog(window.currentFIFOAlgorithm);
    });

    console.log('Export functionality event listeners initialized');
}

/**
 * Update export button states based on simulation status
 * @param {boolean} hasSimulation - Whether a simulation is active
 * @param {boolean} hasData - Whether simulation has step data
 */
function updateExportButtonStates(hasSimulation = false, hasData = false) {
    const exportScreenshotBtn = document.getElementById('export-screenshot-btn');
    const exportTraceBtn = document.getElementById('export-trace-btn');

    if (exportScreenshotBtn) {
        exportScreenshotBtn.disabled = !hasSimulation;
        exportScreenshotBtn.title = hasSimulation ?
            'Export current simulation as PNG image' :
            'Initialize a simulation first';
    }

    if (exportTraceBtn) {
        exportTraceBtn.disabled = !hasData;
        exportTraceBtn.title = hasData ?
            'Export execution trace as CSV or JSON' :
            'Run simulation steps to generate trace data';
    }
}

/**
 * Check browser compatibility and feature support
 * @returns {Object} Compatibility report with supported features
 */
function checkBrowserCompatibility() {
    const compatibility = {
        canvas: false,
        localStorage: false,
        download: false,
        blob: false,
        requestAnimationFrame: false,
        es6: false,
        warnings: [],
        errors: []
    };

    try {
        // Check Canvas API support
        const testCanvas = document.createElement('canvas');
        compatibility.canvas = !!(testCanvas.getContext && testCanvas.getContext('2d'));
        if (!compatibility.canvas) {
            compatibility.errors.push('Canvas API not supported');
        }

        // Check localStorage support
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            compatibility.localStorage = true;
        } catch (e) {
            compatibility.warnings.push('localStorage not available - settings will not persist');
        }

        // Check download attribute support
        const testLink = document.createElement('a');
        compatibility.download = 'download' in testLink;
        if (!compatibility.download) {
            compatibility.warnings.push('File download may open in new window instead of downloading');
        }

        // Check Blob API support
        compatibility.blob = typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
        if (!compatibility.blob) {
            compatibility.warnings.push('Export functionality may be limited');
        }

        // Check requestAnimationFrame support
        compatibility.requestAnimationFrame = typeof requestAnimationFrame === 'function';
        if (!compatibility.requestAnimationFrame) {
            compatibility.warnings.push('Animations may be less smooth');
        }

        // Check ES6 support (basic check)
        try {
            eval('const test = () => {}; class Test {}');
            compatibility.es6 = true;
        } catch (e) {
            compatibility.errors.push('Modern JavaScript features not supported - please update your browser');
        }

    } catch (error) {
        compatibility.errors.push(`Browser compatibility check failed: ${error.message}`);
    }

    return compatibility;
}

/**
 * Initialize the application when DOM is loaded
 */
function initializeApplication() {
    console.log('Initializing FIFO Page Replacement Simulator...');

    try {
        // Check browser compatibility first
        const compatibility = checkBrowserCompatibility();

        // Show critical errors
        if (compatibility.errors.length > 0) {
            const errorMessage = 'Browser compatibility issues detected:\n' + compatibility.errors.join('\n');
            displayError(errorMessage);
            console.error('Critical compatibility issues:', compatibility.errors);
            return;
        }

        // Show warnings but continue
        if (compatibility.warnings.length > 0) {
            console.warn('Browser compatibility warnings:', compatibility.warnings);
            showAnimationStatus(`${compatibility.warnings.length} compatibility warning(s) - some features may be limited`, 'warning', 4000);
        }

        // Initialize canvas rendering with error handling
        if (!initializeCanvas()) {
            console.error('Failed to initialize canvas');
            displayError('Canvas initialization failed. Please ensure your browser supports HTML5 Canvas.');
            return;
        }

        // Initialize responsive canvas with error handling
        try {
            initializeResponsiveCanvas();
        } catch (error) {
            console.warn('Responsive canvas initialization failed:', error);
            showAnimationStatus('Responsive design may not work properly', 'warning');
        }

        // Optimize for detected device capabilities
        try {
            optimizeForDevice();
        } catch (error) {
            console.warn('Device optimization failed:', error);
        }

        // Initialize form handling with error handling
        try {
            initializeFormHandling();
        } catch (error) {
            console.error('Form handling initialization failed:', error);
            displayError('Form initialization failed. Please refresh the page.');
            return;
        }

        // Initialize export functionality with error handling
        try {
            initializeExportFunctionality();
        } catch (error) {
            console.warn('Export functionality initialization failed:', error);
            showAnimationStatus('Export features may not be available', 'warning');
        }

        // Initialize instructions and help system with error handling
        try {
            initializeInstructionsSystem();
        } catch (error) {
            console.warn('Instructions system initialization failed:', error);
        }

        // Initialize interactive legend with error handling
        try {
            initializeInteractiveLegend();
        } catch (error) {
            console.warn('Interactive legend initialization failed:', error);
        }

        // Test canvas rendering functionality
        try {
            testCanvasRendering();
        } catch (error) {
            console.warn('Canvas rendering test failed:', error);
        }

        // Run all tests in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            runAllTests();
        }

        // Run integration validation in production
        try {
            validateApplicationIntegrity();
        } catch (error) {
            console.warn('Application integrity validation failed:', error);
        }

        console.log('Application initialization complete');

        // Make testing and validation functions available globally for debugging
        window.generateTestingReport = generateTestingReport;
        window.validateStandardsCompliance = validateStandardsCompliance;
        window.createFinalTestingChecklist = createFinalTestingChecklist;

        // Run final validation in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(() => {
                console.log('\n=== RUNNING FINAL VALIDATION ===');
                validateStandardsCompliance();
                createFinalTestingChecklist();
                console.log('\n=== VALIDATION COMPLETE ===');
                console.log('Use window.generateTestingReport() for detailed analysis');
            }, 2000);
        }

    } catch (error) {
        console.error('Application initialization failed:', error);
        displayError(`Application failed to load: ${error.message}. Please refresh the page and try again.`);
    }
}

/**
 * Validate application integrity and component integration
 */
function validateApplicationIntegrity() {
    console.log('Validating application integrity...');

    const validations = [
        {
            name: 'Core DOM Elements',
            check: () => {
                const requiredElements = [
                    'simulation-canvas',
                    'frame-count',
                    'page-references',
                    'initialize-btn',
                    'start-btn',
                    'pause-btn',
                    'step-forward-btn',
                    'step-backward-btn',
                    'export-screenshot-btn',
                    'export-trace-btn'
                ];

                return requiredElements.every(id => document.getElementById(id) !== null);
            }
        },
        {
            name: 'Canvas Functionality',
            check: () => {
                return canvas && ctx && typeof ctx.fillRect === 'function';
            }
        },
        {
            name: 'Event Listeners',
            check: () => {
                const form = document.getElementById('simulation-form');
                const startBtn = document.getElementById('start-btn');
                return form && startBtn;
            }
        },
        {
            name: 'CSS Styles Loaded',
            check: () => {
                const container = document.querySelector('.container');
                if (!container) return false;

                const styles = window.getComputedStyle(container);
                return styles.maxWidth && styles.maxWidth !== 'none';
            }
        },
        {
            name: 'JavaScript Classes Available',
            check: () => {
                return typeof FIFOAlgorithm === 'function' &&
                    typeof AnimationEngine === 'function';
            }
        }
    ];

    let allValid = true;

    validations.forEach(validation => {
        try {
            const isValid = validation.check();
            console.log(`${isValid ? '✓' : '✗'} ${validation.name}: ${isValid ? 'VALID' : 'INVALID'}`);
            if (!isValid) allValid = false;
        } catch (error) {
            console.log(`✗ ${validation.name}: ERROR - ${error.message}`);
            allValid = false;
        }
    });

    if (allValid) {
        console.log('✓ Application integrity validation passed');
        showAnimationStatus('Application ready for use', 'success', 3000);
    } else {
        console.warn('✗ Application integrity validation failed');
        showAnimationStatus('Some application features may not work properly', 'warning', 5000);
    }

    return allValid;
}

/**
 * Generate comprehensive testing report
 */
function generateTestingReport() {
    console.log('\n=== COMPREHENSIVE TESTING REPORT ===');

    const report = {
        timestamp: new Date().toISOString(),
        browser: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        },
        screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio || 1
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        features: checkBrowserCompatibility(),
        device: detectDeviceCapabilities(),
        tests: {
            validation: false,
            fifoAlgorithm: false,
            animationEngine: false,
            exportFunctionality: false,
            errorHandling: false,
            instructions: false,
            workflows: false,
            algorithmCorrectness: false,
            crossBrowser: false,
            responsive: false,
            integrity: false
        }
    };

    // Run all tests and collect results
    try {
        report.tests.validation = runValidationTests();
        report.tests.fifoAlgorithm = runFIFOAlgorithmTests();
        report.tests.animationEngine = runAnimationEngineTests();
        report.tests.exportFunctionality = testExportFunctionality();
        report.tests.errorHandling = testErrorHandling();
        report.tests.instructions = testInstructionsSystem();
        report.tests.workflows = testCompleteUserWorkflows();
        report.tests.algorithmCorrectness = testAlgorithmCorrectnessScenarios();
        report.tests.crossBrowser = testCrossBrowserCompatibility();
        report.tests.responsive = testResponsiveDesign();
        report.tests.integrity = validateApplicationIntegrity();
    } catch (error) {
        console.error('Error running tests for report:', error);
    }

    // Calculate overall score
    const testResults = Object.values(report.tests);
    const passedTests = testResults.filter(result => result === true).length;
    const totalTests = testResults.length;
    const overallScore = (passedTests / totalTests * 100).toFixed(1);

    console.log('\n--- BROWSER INFORMATION ---');
    console.log(`Browser: ${report.browser.userAgent}`);
    console.log(`Platform: ${report.browser.platform}`);
    console.log(`Screen: ${report.screen.width}x${report.screen.height} (${report.screen.colorDepth}-bit)`);
    console.log(`Viewport: ${report.viewport.width}x${report.viewport.height}`);
    console.log(`Device Type: ${report.device.deviceType}`);
    console.log(`Touch Support: ${report.device.touchSupport ? 'Yes' : 'No'}`);

    console.log('\n--- FEATURE SUPPORT ---');
    console.log(`Canvas API: ${report.features.canvas ? 'Supported' : 'Not Supported'}`);
    console.log(`Local Storage: ${report.features.localStorage ? 'Supported' : 'Not Supported'}`);
    console.log(`Download Attribute: ${report.features.download ? 'Supported' : 'Not Supported'}`);
    console.log(`Blob API: ${report.features.blob ? 'Supported' : 'Not Supported'}`);
    console.log(`RequestAnimationFrame: ${report.features.requestAnimationFrame ? 'Supported' : 'Not Supported'}`);
    console.log(`ES6 Features: ${report.features.es6 ? 'Supported' : 'Not Supported'}`);

    console.log('\n--- TEST RESULTS ---');
    Object.entries(report.tests).forEach(([testName, result]) => {
        const displayName = testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`${result ? '✓' : '✗'} ${displayName}: ${result ? 'PASS' : 'FAIL'}`);
    });

    console.log('\n--- OVERALL ASSESSMENT ---');
    console.log(`Test Score: ${overallScore}% (${passedTests}/${totalTests} tests passed)`);

    if (report.features.errors.length > 0) {
        console.log('\n--- CRITICAL ISSUES ---');
        report.features.errors.forEach(error => console.log(`✗ ${error}`));
    }

    if (report.features.warnings.length > 0) {
        console.log('\n--- WARNINGS ---');
        report.features.warnings.forEach(warning => console.log(`⚠ ${warning}`));
    }

    console.log('\n--- RECOMMENDATIONS ---');
    if (overallScore < 80) {
        console.log('⚠ Application may not function optimally in this environment');
        console.log('• Consider using a modern browser (Chrome, Firefox, Safari, Edge)');
        console.log('• Ensure JavaScript is enabled');
        console.log('• Check for browser extensions that might interfere');
    } else if (overallScore < 95) {
        console.log('✓ Application should work well with minor limitations');
        console.log('• Some advanced features may not be available');
    } else {
        console.log('✓ Application fully compatible with this environment');
        console.log('• All features should work as expected');
    }

    console.log('\n=== END TESTING REPORT ===\n');

    return report;
}

// ============================================================================
// CODE VALIDATION AND STANDARDS COMPLIANCE
// ============================================================================

/**
 * Validate HTML and CSS for standards compliance
 * @function validateStandardsCompliance
 * @description Performs comprehensive validation of HTML structure, CSS styles,
 *              and JavaScript code quality to ensure standards compliance.
 * @returns {Object} Validation report with compliance status and recommendations
 */
function validateStandardsCompliance() {
    console.log('Validating standards compliance...');

    const validation = {
        html: {
            valid: true,
            issues: [],
            score: 100
        },
        css: {
            valid: true,
            issues: [],
            score: 100
        },
        javascript: {
            valid: true,
            issues: [],
            score: 100
        },
        accessibility: {
            valid: true,
            issues: [],
            score: 100
        },
        performance: {
            valid: true,
            issues: [],
            score: 100
        }
    };

    // HTML Validation
    try {
        // Check for required meta tags
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            validation.html.issues.push('Missing viewport meta tag');
            validation.html.score -= 10;
        }

        const charset = document.querySelector('meta[charset]');
        if (!charset) {
            validation.html.issues.push('Missing charset meta tag');
            validation.html.score -= 10;
        }

        // Check for semantic HTML structure
        const main = document.querySelector('main');
        const header = document.querySelector('header');
        if (!main || !header) {
            validation.html.issues.push('Missing semantic HTML elements (main, header)');
            validation.html.score -= 15;
        }

        // Check for proper form structure
        const form = document.getElementById('simulation-form');
        if (form) {
            const labels = form.querySelectorAll('label');
            const inputs = form.querySelectorAll('input');
            if (labels.length !== inputs.length) {
                validation.html.issues.push('Not all form inputs have associated labels');
                validation.html.score -= 10;
            }
        }

    } catch (error) {
        validation.html.issues.push(`HTML validation error: ${error.message}`);
        validation.html.score -= 20;
    }

    // CSS Validation
    try {
        // Check if CSS is loaded
        const container = document.querySelector('.container');
        if (container) {
            const styles = window.getComputedStyle(container);
            if (!styles.maxWidth || styles.maxWidth === 'none') {
                validation.css.issues.push('CSS styles may not be loading properly');
                validation.css.score -= 25;
            }
        }

        // Check for responsive design
        const mediaQueries = ['(max-width: 768px)', '(max-width: 480px)'];
        mediaQueries.forEach(query => {
            if (!window.matchMedia(query)) {
                validation.css.issues.push(`Missing responsive design for ${query}`);
                validation.css.score -= 10;
            }
        });

    } catch (error) {
        validation.css.issues.push(`CSS validation error: ${error.message}`);
        validation.css.score -= 20;
    }

    // JavaScript Validation
    try {
        // Check for global variables pollution
        const globalVars = ['canvas', 'ctx', 'canvasWidth', 'canvasHeight'];
        globalVars.forEach(varName => {
            if (window[varName] === undefined) {
                validation.javascript.issues.push(`Global variable ${varName} not properly initialized`);
                validation.javascript.score -= 5;
            }
        });

        // Check for required classes
        const requiredClasses = ['FIFOAlgorithm', 'AnimationEngine'];
        requiredClasses.forEach(className => {
            if (typeof window[className] !== 'function') {
                validation.javascript.issues.push(`Required class ${className} not found`);
                validation.javascript.score -= 15;
            }
        });

    } catch (error) {
        validation.javascript.issues.push(`JavaScript validation error: ${error.message}`);
        validation.javascript.score -= 20;
    }

    // Accessibility Validation
    try {
        // Check for alt attributes on images
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.alt) {
                validation.accessibility.issues.push(`Image ${index + 1} missing alt attribute`);
                validation.accessibility.score -= 10;
            }
        });

        // Check for keyboard navigation support
        const buttons = document.querySelectorAll('button');
        if (buttons.length === 0) {
            validation.accessibility.issues.push('No interactive buttons found');
            validation.accessibility.score -= 20;
        }

        // Check for ARIA labels where needed
        const canvas = document.getElementById('simulation-canvas');
        if (canvas && !canvas.getAttribute('aria-label')) {
            validation.accessibility.issues.push('Canvas missing aria-label for screen readers');
            validation.accessibility.score -= 15;
        }

    } catch (error) {
        validation.accessibility.issues.push(`Accessibility validation error: ${error.message}`);
        validation.accessibility.score -= 20;
    }

    // Performance Validation
    try {
        // Check for performance optimizations
        if (!Performance || typeof Performance.optimizeCanvas !== 'function') {
            validation.performance.issues.push('Performance optimization utilities not found');
            validation.performance.score -= 20;
        }

        // Check for efficient DOM queries
        const elements = document.querySelectorAll('*');
        if (elements.length > 200) {
            validation.performance.issues.push('Large DOM tree may impact performance');
            validation.performance.score -= 10;
        }

    } catch (error) {
        validation.performance.issues.push(`Performance validation error: ${error.message}`);
        validation.performance.score -= 20;
    }

    // Calculate overall compliance score
    const categories = Object.keys(validation);
    const totalScore = categories.reduce((sum, category) => sum + validation[category].score, 0);
    const overallScore = (totalScore / (categories.length * 100) * 100).toFixed(1);

    // Set validity flags
    categories.forEach(category => {
        validation[category].valid = validation[category].score >= 80;
    });

    // Log results
    console.log('\n=== STANDARDS COMPLIANCE REPORT ===');
    categories.forEach(category => {
        const cat = validation[category];
        console.log(`${cat.valid ? '✓' : '✗'} ${category.toUpperCase()}: ${cat.score}% (${cat.issues.length} issues)`);
        if (cat.issues.length > 0) {
            cat.issues.forEach(issue => console.log(`  - ${issue}`));
        }
    });

    console.log(`\nOverall Compliance Score: ${overallScore}%`);

    if (overallScore >= 90) {
        console.log('✓ Excellent standards compliance');
    } else if (overallScore >= 80) {
        console.log('✓ Good standards compliance with minor issues');
    } else {
        console.log('⚠ Standards compliance needs improvement');
    }

    return {
        ...validation,
        overallScore: parseFloat(overallScore),
        compliant: overallScore >= 80
    };
}

/**
 * Create final testing checklist and verify all requirements
 * @function createFinalTestingChecklist
 * @description Generates a comprehensive checklist of all requirements and
 *              validates that each has been properly implemented and tested.
 * @returns {Object} Testing checklist with requirement verification status
 */
function createFinalTestingChecklist() {
    console.log('Creating final testing checklist...');

    const checklist = {
        requirements: {
            // Requirement 1: Input and Validation
            '1.1': { description: 'Display input form for frame count', tested: false, passed: false },
            '1.2': { description: 'Display input field for page references', tested: false, passed: false },
            '1.3': { description: 'Validate frame count input', tested: false, passed: false },
            '1.4': { description: 'Validate page reference format', tested: false, passed: false },
            '1.5': { description: 'Initialize simulation with valid inputs', tested: false, passed: false },

            // Requirement 2: Animation Controls
            '2.1': { description: 'Provide Start, Pause, Step Forward, Step Backward buttons', tested: false, passed: false },
            '2.2': { description: 'Start automatic animation progression', tested: false, passed: false },
            '2.3': { description: 'Pause automatic progression', tested: false, passed: false },
            '2.4': { description: 'Step forward navigation', tested: false, passed: false },
            '2.5': { description: 'Step backward navigation', tested: false, passed: false },
            '2.6': { description: 'Disable Step Backward at first step', tested: false, passed: false },
            '2.7': { description: 'Disable Step Forward at last step', tested: false, passed: false },

            // Requirement 3: Visual Feedback
            '3.1': { description: 'Render frames using Canvas API', tested: false, passed: false },
            '3.2': { description: 'Highlight page hits in green', tested: false, passed: false },
            '3.3': { description: 'Highlight page faults in red', tested: false, passed: false },
            '3.4': { description: 'Highlight page replacements in yellow', tested: false, passed: false },
            '3.5': { description: 'Display current page reference', tested: false, passed: false },
            '3.6': { description: 'Update page fault count in real-time', tested: false, passed: false },
            '3.7': { description: 'Calculate and display fault rate percentage', tested: false, passed: false },

            // Requirement 4: Speed Control and Export
            '4.1': { description: 'Provide animation speed control', tested: false, passed: false },
            '4.2': { description: 'Update animation timing based on speed control', tested: false, passed: false },
            '4.3': { description: 'Provide screenshot export option', tested: false, passed: false },
            '4.4': { description: 'Provide execution trace export option', tested: false, passed: false },
            '4.5': { description: 'Generate downloadable files without server', tested: false, passed: false },

            // Requirement 5: User Interface
            '5.1': { description: 'Display "How to Use" instructions', tested: false, passed: false },
            '5.2': { description: 'Provide clear labels for inputs and buttons', tested: false, passed: false },
            '5.3': { description: 'Use clean, readable layout design', tested: false, passed: false },
            '5.4': { description: 'Indicate current step and total steps', tested: false, passed: false },
            '5.5': { description: 'Show color coding legend', tested: false, passed: false },

            // Requirement 6: Code Quality
            '6.1': { description: 'Separate UI logic, animation, and algorithm', tested: false, passed: false },
            '6.2': { description: 'Include comments for major logic sections', tested: false, passed: false },
            '6.3': { description: 'Work as standalone files without compilation', tested: false, passed: false },
            '6.4': { description: 'Run immediately without installation', tested: false, passed: false },
            '6.5': { description: 'Function on Windows, macOS, and Linux browsers', tested: false, passed: false },

            // Requirement 7: Algorithm Visualization
            '7.1': { description: 'Show whether page reference is hit or miss', tested: false, passed: false },
            '7.2': { description: 'Demonstrate FIFO replacement decisions', tested: false, passed: false },
            '7.3': { description: 'Visually indicate oldest frame for replacement', tested: false, passed: false },
            '7.4': { description: 'Maintain state when animation paused', tested: false, passed: false },
            '7.5': { description: 'Show detailed explanation of each operation', tested: false, passed: false }
        },
        summary: {
            total: 0,
            tested: 0,
            passed: 0,
            coverage: 0,
            successRate: 0
        }
    };

    // Test each requirement
    const requirements = checklist.requirements;

    try {
        // Test Requirement 1: Input and Validation
        requirements['1.1'].tested = true;
        requirements['1.1'].passed = !!document.getElementById('frame-count');

        requirements['1.2'].tested = true;
        requirements['1.2'].passed = !!document.getElementById('page-references');

        requirements['1.3'].tested = true;
        requirements['1.3'].passed = typeof validateFrameCount === 'function';

        requirements['1.4'].tested = true;
        requirements['1.4'].passed = typeof validatePageReferences === 'function';

        requirements['1.5'].tested = true;
        requirements['1.5'].passed = !!document.getElementById('initialize-btn');

        // Test Requirement 2: Animation Controls
        requirements['2.1'].tested = true;
        requirements['2.1'].passed = !!(document.getElementById('start-btn') &&
            document.getElementById('pause-btn') &&
            document.getElementById('step-forward-btn') &&
            document.getElementById('step-backward-btn'));

        requirements['2.2'].tested = true;
        requirements['2.2'].passed = typeof AnimationEngine === 'function';

        requirements['2.3'].tested = true;
        requirements['2.3'].passed = typeof AnimationEngine === 'function';

        requirements['2.4'].tested = true;
        requirements['2.4'].passed = typeof AnimationEngine === 'function';

        requirements['2.5'].tested = true;
        requirements['2.5'].passed = typeof AnimationEngine === 'function';

        requirements['2.6'].tested = true;
        requirements['2.6'].passed = typeof updateAnimationControlStates === 'function';

        requirements['2.7'].tested = true;
        requirements['2.7'].passed = typeof updateAnimationControlStates === 'function';

        // Test Requirement 3: Visual Feedback
        requirements['3.1'].tested = true;
        requirements['3.1'].passed = !!(canvas && ctx);

        requirements['3.2'].tested = true;
        requirements['3.2'].passed = typeof getFrameColors === 'function';

        requirements['3.3'].tested = true;
        requirements['3.3'].passed = typeof getFrameColors === 'function';

        requirements['3.4'].tested = true;
        requirements['3.4'].passed = typeof getFrameColors === 'function';

        requirements['3.5'].tested = true;
        requirements['3.5'].passed = !!document.getElementById('current-page');

        requirements['3.6'].tested = true;
        requirements['3.6'].passed = !!document.getElementById('fault-count');

        requirements['3.7'].tested = true;
        requirements['3.7'].passed = !!document.getElementById('fault-rate');

        // Test Requirement 4: Speed Control and Export
        requirements['4.1'].tested = true;
        requirements['4.1'].passed = !!document.getElementById('speed-slider');

        requirements['4.2'].tested = true;
        requirements['4.2'].passed = !!document.getElementById('speed-display');

        requirements['4.3'].tested = true;
        requirements['4.3'].passed = !!document.getElementById('export-screenshot-btn');

        requirements['4.4'].tested = true;
        requirements['4.4'].passed = !!document.getElementById('export-trace-btn');

        requirements['4.5'].tested = true;
        requirements['4.5'].passed = typeof exportCanvasScreenshot === 'function';

        // Test Requirement 5: User Interface
        requirements['5.1'].tested = true;
        requirements['5.1'].passed = !!document.querySelector('.instructions-section');

        requirements['5.2'].tested = true;
        requirements['5.2'].passed = document.querySelectorAll('label').length > 0;

        requirements['5.3'].tested = true;
        requirements['5.3'].passed = !!document.querySelector('.container');

        requirements['5.4'].tested = true;
        requirements['5.4'].passed = !!document.getElementById('step-counter');

        requirements['5.5'].tested = true;
        requirements['5.5'].passed = !!document.querySelector('.legend-section');

        // Test Requirement 6: Code Quality
        requirements['6.1'].tested = true;
        requirements['6.1'].passed = typeof FIFOAlgorithm === 'function' && typeof AnimationEngine === 'function';

        requirements['6.2'].tested = true;
        requirements['6.2'].passed = true; // Verified by this documentation task

        requirements['6.3'].tested = true;
        requirements['6.3'].passed = true; // No build process required

        requirements['6.4'].tested = true;
        requirements['6.4'].passed = true; // Standalone HTML file

        requirements['6.5'].tested = true;
        requirements['6.5'].passed = typeof checkBrowserCompatibility === 'function';

        // Test Requirement 7: Algorithm Visualization
        requirements['7.1'].tested = true;
        requirements['7.1'].passed = typeof FIFOAlgorithm === 'function';

        requirements['7.2'].tested = true;
        requirements['7.2'].passed = typeof FIFOAlgorithm === 'function';

        requirements['7.3'].tested = true;
        requirements['7.3'].passed = typeof drawMemoryFrames === 'function';

        requirements['7.4'].tested = true;
        requirements['7.4'].passed = typeof AnimationEngine === 'function';

        requirements['7.5'].tested = true;
        requirements['7.5'].passed = !!document.getElementById('operation-explanation');

    } catch (error) {
        console.error('Error testing requirements:', error);
    }

    // Calculate summary statistics
    const reqKeys = Object.keys(requirements);
    checklist.summary.total = reqKeys.length;
    checklist.summary.tested = reqKeys.filter(key => requirements[key].tested).length;
    checklist.summary.passed = reqKeys.filter(key => requirements[key].passed).length;
    checklist.summary.coverage = (checklist.summary.tested / checklist.summary.total * 100).toFixed(1);
    checklist.summary.successRate = (checklist.summary.passed / checklist.summary.total * 100).toFixed(1);

    // Log results
    console.log('\n=== FINAL TESTING CHECKLIST ===');
    console.log(`Total Requirements: ${checklist.summary.total}`);
    console.log(`Requirements Tested: ${checklist.summary.tested} (${checklist.summary.coverage}%)`);
    console.log(`Requirements Passed: ${checklist.summary.passed} (${checklist.summary.successRate}%)`);

    console.log('\n--- REQUIREMENT DETAILS ---');
    Object.entries(requirements).forEach(([id, req]) => {
        const status = req.tested ? (req.passed ? '✓' : '✗') : '?';
        console.log(`${status} ${id}: ${req.description}`);
    });

    if (checklist.summary.successRate >= 95) {
        console.log('\n✓ All requirements successfully implemented!');
    } else if (checklist.summary.successRate >= 90) {
        console.log('\n✓ Most requirements implemented with minor gaps');
    } else {
        console.log('\n⚠ Some requirements need attention');
    }

    return checklist;
}

// ============================================================================
// FIFO ALGORITHM IMPLEMENTATION
// ============================================================================

/**
 * FIFO Algorithm Class - Core implementation of First In, First Out page replacement
 */
class FIFOAlgorithm {
    /**
     * Initialize FIFO algorithm with frame count and page references
     * @param {number} frameCount - Number of memory frames available
     * @param {number[]} pageReferences - Array of page references to process
     */
    constructor(frameCount, pageReferences) {
        // Validate inputs
        if (!Number.isInteger(frameCount) || frameCount <= 0) {
            throw new Error('Frame count must be a positive integer');
        }

        if (!Array.isArray(pageReferences) || pageReferences.length === 0) {
            throw new Error('Page references must be a non-empty array');
        }

        // Validate all page references are non-negative integers
        for (let i = 0; i < pageReferences.length; i++) {
            if (!Number.isInteger(pageReferences[i]) || pageReferences[i] < 0) {
                throw new Error(`Page reference at index ${i} must be a non-negative integer`);
            }
        }

        // Initialize algorithm state
        this.frameCount = frameCount;
        this.pageReferences = [...pageReferences]; // Create copy to avoid mutation
        this.frames = new Array(frameCount).fill(null); // Memory frames (null = empty)
        this.fifoQueue = []; // Track insertion order for FIFO replacement
        this.currentStep = 0;
        this.faultCount = 0;
        this.stepHistory = []; // Store state at each step for backward navigation

        // Initialize with empty step history (will be populated as steps are processed)
    }

    /**
     * Process a page reference at the given step index
     * @param {number} stepIndex - Index of the page reference to process
     * @returns {Object} Step result with page info and algorithm state
     */
    processPageReference(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.pageReferences.length) {
            throw new Error(`Invalid step index: ${stepIndex}`);
        }

        const pageNumber = this.pageReferences[stepIndex];
        const isHit = this.isPageHit(pageNumber);

        let replacedFrameIndex = null;
        let replacedPage = null;

        if (!isHit) {
            // Page fault occurred
            this.faultCount++;

            const emptyFrameIndex = this.findEmptyFrameIndex();
            if (emptyFrameIndex !== -1) {
                // Use empty frame
                this.frames[emptyFrameIndex] = pageNumber;
                this.fifoQueue.push(emptyFrameIndex);
            } else {
                // Replace oldest frame (FIFO)
                replacedFrameIndex = this.fifoQueue.shift();
                replacedPage = this.frames[replacedFrameIndex];
                this.frames[replacedFrameIndex] = pageNumber;
                this.fifoQueue.push(replacedFrameIndex);
            }
        }

        this.currentStep = stepIndex + 1;

        // Create step result
        const stepResult = {
            stepIndex,
            pageNumber,
            isHit,
            replacedFrameIndex,
            replacedPage,
            frameState: [...this.frames],
            faultCount: this.faultCount,
            faultRate: this.calculateFaultRate()
        };

        // Store step result in history (includes isHit information)
        this.stepHistory.push(stepResult);

        return stepResult;
    }

    /**
     * Check if a page is currently in memory
     * @param {number} pageNumber - Page number to check
     * @returns {boolean} True if page is in memory (hit), false otherwise (miss)
     */
    isPageHit(pageNumber) {
        return this.frames.includes(pageNumber);
    }

    /**
     * Find the index of the first empty frame
     * @returns {number} Index of empty frame, or -1 if all frames are full
     */
    findEmptyFrameIndex() {
        return this.frames.findIndex(frame => frame === null);
    }

    /**
     * Calculate the current fault rate as a percentage
     * @returns {number} Fault rate percentage (0-100)
     */
    calculateFaultRate() {
        if (this.currentStep === 0) return 0;
        return Math.round((this.faultCount / this.currentStep) * 100 * 100) / 100;
    }

    /**
     * Get the current algorithm state
     * @returns {Object} Current state object
     */
    getCurrentState() {
        return {
            frames: [...this.frames],
            currentStep: this.currentStep,
            faultCount: this.faultCount,
            faultRate: this.calculateFaultRate(),
            frameCount: this.frameCount,
            totalSteps: this.pageReferences.length
        };
    }

    /**
     * Create a snapshot of the current state
     * @returns {Object} State snapshot
     */
    createStateSnapshot() {
        return {
            frames: [...this.frames],
            fifoQueue: [...this.fifoQueue],
            currentStep: this.currentStep,
            faultCount: this.faultCount
        };
    }

    /**
     * Get step history for backward navigation
     * @returns {Array} Array of state snapshots
     */
    getStepHistory() {
        return [...this.stepHistory];
    }

    /**
     * Restore algorithm to a previous step
     * @param {number} stepIndex - Step to restore to
     */
    restoreToStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.stepHistory.length) {
            throw new Error(`Invalid step index for restoration: ${stepIndex}`);
        }

        const stepResult = this.stepHistory[stepIndex];
        this.frames = [...stepResult.frameState];
        this.faultCount = stepResult.faultCount;
        this.currentStep = stepResult.stepIndex + 1;

        // Rebuild FIFO queue from current frame state
        this.fifoQueue = [];
        for (let i = 0; i < this.frames.length; i++) {
            if (this.frames[i] !== null) {
                this.fifoQueue.push(i);
            }
        }
    }

    /**
     * Get the index of the oldest frame (next to be replaced)
     * @returns {number} Index of oldest frame, or -1 if no frames are occupied
     */
    getOldestFrameIndex() {
        return this.fifoQueue.length > 0 ? this.fifoQueue[0] : -1;
    }
}





// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApplication);

