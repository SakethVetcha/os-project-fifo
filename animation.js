class AnimationEngine {
    constructor(canvasRenderer, algorithm) {
        if (!algorithm || typeof algorithm.processPageReference !== 'function') {
            throw new Error('Valid FIFOAlgorithm instance is required');
        }
        this.canvasRenderer = canvasRenderer;
        this.algorithm = algorithm;
        this.isPlaying = false;
        this.currentStep = 0;
        this.totalSteps = algorithm.pageReferences.length;
        this.speed = 1000;
        this.animationTimer = null;
        this.stepHistory = [];
    }

    start() {
        if (this.isPlaying) {
            return false;
        }
        if (this.currentStep >= this.totalSteps) {
            return false;
        }
        this.isPlaying = true;
        this.scheduleNextStep();
        return true;
    }

    pause() {
        if (!this.isPlaying) {
            return false;
        }
        this.isPlaying = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
        return true;
    }

    stepForward() {
        if (this.currentStep >= this.totalSteps) {
            return null;
        }
        try {
            const stepResult = this.algorithm.processPageReference(this.currentStep);
            this.currentStep++;
            this.stepHistory.push(stepResult);
            if (typeof renderCurrentAnimationState === 'function') {
                renderCurrentAnimationState();
            }
            if (typeof updateSimulationInfo === 'function') {
                updateSimulationInfo();
            }
            return stepResult;
        } catch (error) {
            this.pause();
            return null;
        }
    }

    stepBackward() {
        if (this.currentStep <= 0) {
            return false;
        }
        try {
            this.currentStep--;
            this.algorithm.restoreToStep(this.currentStep);
            if (typeof renderCurrentAnimationState === 'function') {
                renderCurrentAnimationState();
            }
            if (typeof updateSimulationInfo === 'function') {
                updateSimulationInfo();
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    setSpeed(speed) {
        if (speed > 0) {
            this.speed = speed;
        }
    }

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

    canStepForward() {
        return this.currentStep < this.totalSteps;
    }

    canStepBackward() {
        return this.currentStep > 0;
    }

    scheduleNextStep() {
        if (!this.isPlaying) {
            return;
        }
        this.animationTimer = setTimeout(() => {
            if (this.isPlaying && this.currentStep < this.totalSteps) {
                const stepResult = this.stepForward();
                if (typeof updateAnimationControlStates === 'function') {
                    updateAnimationControlStates();
                }
                if (typeof updateSimulationInfo === 'function') {
                    updateSimulationInfo();
                }
                if (stepResult && this.currentStep < this.totalSteps) {
                    this.scheduleNextStep();
                } else {
                    this.isPlaying = false;
                    if (typeof updateAnimationControlStates === 'function') {
                        updateAnimationControlStates();
                    }
                    if (typeof updateSimulationInfo === 'function') {
                        updateSimulationInfo();
                    }
                }
            }
        }, this.speed);
    }

    render() {
        if (this.canvasRenderer && typeof this.canvasRenderer.render === 'function') {
            this.canvasRenderer.render(this.algorithm.getCurrentState());
        }
    }
}

function enableAnimationControls() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const stepBackwardBtn = document.getElementById('step-backward-btn');
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (stepForwardBtn) stepForwardBtn.disabled = false;
    if (stepBackwardBtn) stepBackwardBtn.disabled = true;
}

function disableAnimationControls() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const stepBackwardBtn = document.getElementById('step-backward-btn');
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = true;
    if (stepForwardBtn) stepForwardBtn.disabled = true;
    if (stepBackwardBtn) stepBackwardBtn.disabled = true;
}

function setupAnimationControlListeners() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stepForwardBtn = document.getElementById('step-forward-btn');
    const stepBackwardBtn = document.getElementById('step-backward-btn');
    const speedSlider = document.getElementById('speed-slider');
    const speedDisplay = document.getElementById('speed-display');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const success = window.currentAnimationEngine.start();
                if (success) {
                    updateAnimationControlStates();
                    renderCurrentAnimationState();
                    updateSimulationInfo();
                }
            }
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const success = window.currentAnimationEngine.pause();
                if (success) {
                    updateAnimationControlStates();
                    renderCurrentAnimationState();
                    updateSimulationInfo();
                }
            }
        });
    }

    if (stepForwardBtn) {
        stepForwardBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const stepResult = window.currentAnimationEngine.stepForward();
                if (stepResult) {
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                    updateSimulationInfo();
                }
            }
        });
    }

    if (stepBackwardBtn) {
        stepBackwardBtn.addEventListener('click', () => {
            if (window.currentAnimationEngine) {
                const success = window.currentAnimationEngine.stepBackward();
                if (success) {
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                    updateSimulationInfo();
                }
            }
        });
    }

    if (speedSlider && speedDisplay) {
        speedSlider.addEventListener('input', (event) => {
            const speed = parseInt(event.target.value, 10);
            updateSpeedDisplay(speed);
        });
        speedSlider.addEventListener('change', (event) => {
            const speed = parseInt(event.target.value, 10);
            if (window.currentAnimationEngine) {
                window.currentAnimationEngine.setSpeed(speed);
            }
            updateSpeedDisplay(speed);
        });
    }
}

function updateSpeedDisplay(speed) {
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) {
        speedDisplay.textContent = `${speed}ms`;
    }
}

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

    if (startBtn) {
        startBtn.disabled = state.isPlaying || state.isComplete;
        startBtn.textContent = state.isComplete ? 'Complete' : 'Start';
    }
    if (pauseBtn) {
        pauseBtn.disabled = !state.isPlaying;
    }
    if (stepForwardBtn) {
        stepForwardBtn.disabled = state.isPlaying || !state.canStepForward;
    }
    if (stepBackwardBtn) {
        stepBackwardBtn.disabled = state.isPlaying || !state.canStepBackward;
    }
    updateButtonVisualStates(state);
    const hasStepData = state.currentStep > 0;
    if (typeof updateExportButtonStates === 'function') {
        updateExportButtonStates(true, hasStepData);
    }
}

function updateButtonVisualStates(state) {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    if (startBtn) {
        startBtn.classList.toggle('active', state.isPlaying);
    }
    if (pauseBtn) {
        pauseBtn.classList.toggle('active', state.isPlaying);
    }
}

function renderCurrentAnimationState() {
    if (!window.currentAnimationEngine || !window.currentFIFOAlgorithm) {
        return;
    }
    try {
        renderFIFOState(window.currentFIFOAlgorithm, window.currentAnimationEngine.getCurrentState());
    } catch (error) {
    }
}

function renderCurrentAnimationStateWithTransition() {
    if (!window.currentAnimationEngine || !window.currentFIFOAlgorithm) {
        return;
    }
    try {
        const canvas = document.getElementById('simulation-canvas');
        if (canvas) {
            canvas.style.opacity = '0.8';
            setTimeout(() => {
                renderFIFOState(window.currentFIFOAlgorithm, window.currentAnimationEngine.getCurrentState());
                canvas.style.opacity = '1';
            }, 100);
        } else {
            renderCurrentAnimationState();
        }
    } catch (error) {
        renderCurrentAnimationState();
    }
}

function showAnimationStatus(message, type = 'info', duration = 2000) {
    const statusElement = document.getElementById('animation-status');
    if (!statusElement) return;
    if (statusElement.hideTimeout) {
        clearTimeout(statusElement.hideTimeout);
    }
    statusElement.textContent = message;
    statusElement.className = `show ${type}`;
    const actualDuration = type === 'error' ? duration * 2 : duration;
    statusElement.hideTimeout = setTimeout(() => {
        statusElement.className = '';
    }, actualDuration);
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        const handledKeys = ['Space', 'ArrowRight', 'ArrowLeft', 'Home', 'End'];
        if (handledKeys.includes(event.code)) {
            event.preventDefault();
        }
        if (!window.currentAnimationEngine) {
            return;
        }
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                const state = window.currentAnimationEngine.getCurrentState();
                if (state.isPlaying) {
                    window.currentAnimationEngine.pause();
                } else if (!state.isComplete) {
                    window.currentAnimationEngine.start();
                }
                updateAnimationControlStates();
                renderCurrentAnimationState();
                updateSimulationInfo();
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (window.currentAnimationEngine.canStepForward() &&
                    !window.currentAnimationEngine.getCurrentState().isPlaying) {
                    window.currentAnimationEngine.stepForward();
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                    updateSimulationInfo();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (window.currentAnimationEngine.canStepBackward() &&
                    !window.currentAnimationEngine.getCurrentState().isPlaying) {
                    window.currentAnimationEngine.stepBackward();
                    updateAnimationControlStates();
                    renderCurrentAnimationStateWithTransition();
                    updateSimulationInfo();
                }
                break;
            case 'Home':
                event.preventDefault();
                if (!window.currentAnimationEngine.getCurrentState().isPlaying) {
                    while (window.currentAnimationEngine.canStepBackward()) {
                        window.currentAnimationEngine.stepBackward();
                    }
                    updateAnimationControlStates();
                    renderCurrentAnimationState();
                    updateSimulationInfo();
                }
                break;
            case 'End':
                event.preventDefault();
                if (!window.currentAnimationEngine.getCurrentState().isPlaying) {
                    while (window.currentAnimationEngine.canStepForward()) {
                        window.currentAnimationEngine.stepForward();
                    }
                    updateAnimationControlStates();
                    renderCurrentAnimationState();
                    updateSimulationInfo();
                }
                break;
        }
    });
}