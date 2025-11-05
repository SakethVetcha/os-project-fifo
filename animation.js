/**
 * ============================================================================
 * FIFO Page Replacement Algorithm Simulator - Animation Module
 * ============================================================================
 * 
 * This module contains all animation-related functionality including:
 * - AnimationEngine class for controlling simulation flow
 * - Animation control event listeners and state management
 * - Canvas rendering integration for animations
 * - Smooth transitions and visual feedback
 * - Performance optimization for animations
 * 
 * @author     FIFO Simulator Development Team
 * @version    1.0.0
 * @created    2024
 * 
 * ============================================================================
 */

// ============================================================================
// ANIMATION ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Animation Engine Class - Controls simulation flow and timing
 */
class AnimationEngine {
    /**
     * Initialize animation engine with FIFO algorithm
     * @param {Object} canvasRenderer - Canvas renderer instance (can be null)
     * @param {FIFOAlgorithm} algorithm - FIFO algorithm instance
     */
    constructor(canvasRenderer, algorithm) {
        if (!algorithm || typeof algorithm.processPageReference !== 'function') {
            throw new Error('Valid FIFOAlgorithm instance is required');
        }

        this.canvasRenderer = canvasRenderer;
        this.algorithm = algorithm;
        this.isPlaying = false;
        this.currentStep = 0;
        this.totalSteps = algorithm.pageReferences.length;
        this.speed = 1000; // Default speed in milliseconds
        this.animationTimer = null;
        this.stepHistory = [];
    }

    /**
     * Start automatic animation
     * @returns {boolean} True if started successfully
     */
    start() {
        if (this.isPlaying) {
            return false; // Already playing
        }

        if (this.currentStep >= this.totalSteps) {
            return false; // Animation complete
        }

        this.isPlaying = true;
        this.scheduleNextStep();
        return true;
    }

    /**
     * Pause automatic animation
     * @returns {boolean} True if paused successfully
     */
    pause() {
        if (!this.isPlaying) {
            return false; // Already paused
        }

        this.isPlaying = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
        return true;
    }

    /**
     * Step forward to next page reference
     * @returns {Object|null} Step result or null if cannot advance
     */
    stepForward() {
        if (this.currentStep >= this.totalSteps) {
            return null; // Cannot step forward
        }

        try {
            const stepResult = this.algorithm.processPageReference(this.currentStep);
            this.currentStep++;
            this.stepHistory.push(stepResult);

            // Trigger canvas rendering update
            if (typeof renderCurrentAnimationState === 'function') {
                renderCurrentAnimationState();
            }

            return stepResult;
        } catch (error) {
            console.error('Error stepping forward:', error);
            this.pause();
            return null;
        }
    }

    /**
     * Step backward to previous page reference
     * @returns {boolean} True if stepped backward successfully
     */
    stepBackward() {
        if (this.currentStep <= 0) {
            return false; // Cannot step backward
        }

        try {
            this.currentStep--;
            this.algorithm.restoreToStep(this.currentStep);

            // Trigger canvas rendering update
            if (typeof renderCurrentAnimationState === 'function') {
                renderCurrentAnimationState();
            }

            return true;
        } catch (error) {
            console.error('Error stepping backward:', error);
            return false;
        }
    }

    /**
     * Set animation speed
     * @param {number} speed - Speed in milliseconds between steps
     */
    setSpeed(speed) {
        if (speed > 0) {
            this.speed = speed;
        }
    }

    /**
     * Get current animation state
     * @returns {Object} Current state
     */
    getCurrentState() {
        return {
            isPlaying: this.isPlaying,
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            speed: this.speed,
            canStepForward: this.currentStep < this.totalSteps,
            canStepBackward: this.currentStep > 0,
            isComplete: this.currentStep >= this.totalSteps,
            algorithmState: this.algorithm.getCurrentState()
        };
    }

    /**
     * Check if can step forward
     * @returns {boolean} True if can step forward
     */
    canStepForward() {
        return this.currentStep < this.totalSteps;
    }

    /**
     * Check if can step backward
     * @returns {boolean} True if can step backward
     */
    canStepBackward() {
        return this.currentStep > 0;
    }

    /**
     * Schedule the next animation step
     */
    scheduleNextStep() {
        if (!this.isPlaying) {
            return;
        }

        this.animationTimer = setTimeout(() => {
            if (this.isPlaying && this.currentStep < this.totalSteps) {
                const stepResult = this.stepForward();

                // Update UI controls after each step
                if (typeof updateAnimationControlStates === 'function') {
                    updateAnimationControlStates();
                }

                if (stepResult && this.currentStep < this.totalSteps) {
                    this.scheduleNextStep();
                } else {
                    this.isPlaying = false;
                    // Update UI controls when animation completes
                    if (typeof updateAnimationControlStates === 'function') {
                        updateAnimationControlStates();
                    }
                }
            }
        }, this.speed);
    }

    /**
     * Render current state (if renderer available)
     */
    render() {
        if (this.canvasRenderer && typeof this.canvasRenderer.render === 'function') {
            this.canvasRenderer.render(this.algorithm.getCurrentState());
        }
    }
}

// ============================================================================
// ANIMATION CONTROL FUNCTIONS
// ============================================================================

/**
 * Enable animation control buttons
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
                    renderCurrentAnimationStateWithTransition();
                }
            }
        });
        console.log('Step backward button event listener added');
    }

    // Speed control with real-time feedback
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
                window.currentAnimationEngine.setSpeed(speed);
            }
            updateSpeedDisplay(speed);
        });

        console.log('Speed control event listeners added');
    }

    console.log('Animation control event listeners setup complete');
}

/**
 * Update speed display with current value
 * @param {number} speed - Speed value in milliseconds
 */
function updateSpeedDisplay(speed) {
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) {
        speedDisplay.textContent = `${speed}ms`;
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
    if (typeof updateExportButtonStates === 'function') {
        updateExportButtonStates(true, hasStepData);
    }
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

// ============================================================================
// ANIMATION RENDERING FUNCTIONS
// ============================================================================

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
            canvas.style.opacity = '0.8';

            setTimeout(() => {
                renderFIFOState(window.currentFIFOAlgorithm, window.currentAnimationEngine.getCurrentState());
                canvas.style.opacity = '1';
            }, 100);
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
 * Show animation status message with type-based styling
 * @param {string} message - Message to display
 * @param {string} type - Message type ('info', 'success', 'error', 'warning')
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

// ============================================================================
// ANIMATION TRANSITION EFFECTS
// ============================================================================

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

// ============================================================================
// KEYBOARD SHORTCUTS FOR ANIMATION CONTROLS
// ============================================================================

/**
 * Set up keyboard shortcuts for animation controls
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Only handle shortcuts when not typing in input fields
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Prevent default behavior for handled keys
        const handledKeys = ['Space', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
        if (handledKeys.includes(event.code)) {
            event.preventDefault();
        }

        if (!window.currentAnimationEngine) {
            return;
        }

        switch (event.code) {
            case 'Space': // Spacebar - Toggle start/pause
                event.preventDefault();
                const state = window.currentAnimationEngine.getCurrentState();
                if (state.isPlaying) {
                    window.currentAnimationEngine.pause();
                } else if (!state.isComplete) {
                    window.currentAnimationEngine.start();
                }
                updateAnimationControlStates();
                renderCurrentAnimationState();
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
                    while (window.currentAnimationEngine.canStepBackward()) {
                        window.currentAnimationEngine.stepBackward();
                    }
                    updateAnimationControlStates();
                    renderCurrentAnimationState();
                }
                break;

            case 'End': // End key - Jump to end
                event.preventDefault();
                if (!window.currentAnimationEngine.getCurrentState().isPlaying) {
                    while (window.currentAnimationEngine.canStepForward()) {
                        window.currentAnimationEngine.stepForward();
                    }
                    updateAnimationControlStates();
                    renderCurrentAnimationState();
                }
                break;
        }
    });

    console.log('Keyboard shortcuts for animation controls initialized');
}

// ============================================================================
// ANIMATION PERFORMANCE MONITORING
// ============================================================================

/**
 * Monitor animation performance and provide feedback
 */
function monitorAnimationPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();

    function measureFrame() {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) { // Every second
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

            if (fps < 30) {
                console.warn(`Animation performance warning: ${fps} FPS`);
            }

            frameCount = 0;
            lastTime = currentTime;
        }

        requestAnimationFrame(measureFrame);
    }

    requestAnimationFrame(measureFrame);
}

// Initialize performance monitoring in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    monitorAnimationPerformance();
}

console.log('Animation module loaded successfully');