let canvas;
let ctx;
let canvasWidth = 1200;
let canvasHeight = 400;

const Performance = {
    metrics: {
        renderTime: 0,
        animationFrames: 0,
        lastFrameTime: 0,
        averageFrameTime: 0
    },
    startMeasure(operation) {
        return performance.now();
    },
    endMeasure(operation, startTime) {
        const duration = performance.now() - startTime;
        if (duration > 16.67) {
        }
    },
    optimizeCanvas() {
        if (canvas && ctx) {
            ctx.imageSmoothingEnabled = false;
            ctx.globalCompositeOperation = 'source-over';
        }
    }
};

function initializeCanvas() {
    try {
        canvas = document.getElementById('simulation-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found in DOM');
        }
        if (typeof canvas.getContext !== 'function') {
            throw new Error('Canvas API not supported in this browser');
        }
        ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas 2D context not supported in this browser');
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        setupCanvasDefaults();
        Performance.optimizeCanvas();
        return true;
    } catch (error) {
        displayError(`Canvas initialization failed: ${error.message}. Please use a modern browser that supports HTML5 Canvas.`);
        return false;
    }
}

function setupCanvasDefaults() {
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    clearCanvas();
}

function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawRectangle(x, y, width, height, fillColor = null, strokeColor = '#000000') {
    ctx.save();
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, width, height);
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.strokeRect(x, y, width, height);
    }
    ctx.restore();
}

function drawText(text, x, y, color = '#000000', font = '14px Arial') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
    ctx.restore();
}

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
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
    ctx.restore();
}

function getCanvasDimensions() {
    return {
        width: canvasWidth,
        height: canvasHeight
    };
}

function calculateFrameLayout(frameCount) {
    const canvasDims = getCanvasDimensions();
    const margin = 50;
    const availableWidth = canvasDims.width - (2 * margin);
    const frameWidth = Math.min(140, (availableWidth - (frameCount - 1) * 60) / frameCount);
    const frameHeight = 100;
    const totalFramesWidth = (frameCount * frameWidth) + ((frameCount - 1) * 60);
    const startX = (canvasDims.width - totalFramesWidth) / 2;
    const startY = 80;
    return {
        frameWidth,
        frameHeight,
        startX,
        startY,
        spacing: 60,
        margin
    };
}

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

function drawMemoryFrames(frames, highlightInfo = {}, currentPage = null, oldestFrameIndex = -1) {
    if (!frames || frames.length === 0) {
        return;
    }
    if (frames.length > 6) {
        drawMemoryFramesGrid(frames, highlightInfo, currentPage, oldestFrameIndex);
        return;
    }
    clearCanvas();
    const layout = calculateFrameLayout(frames.length);
    drawText('Memory Frames (FIFO Order)', canvasWidth / 2, 35, '#2c3e50', '24px Arial');

    frames.forEach((frameContent, index) => {
        const x = layout.startX + (index * (layout.frameWidth + layout.spacing));
        const y = layout.startY;
        drawSingleFrame(frameContent, index, x, y, layout.frameWidth, layout.frameHeight,
            highlightInfo, oldestFrameIndex);
    });

    drawFrameLegend(layout.startY + layout.frameHeight + 60);
}

function drawFrameLegend(startY) {
    const legendItems = [
        { state: 'hit', label: 'Page Hit' },
        { state: 'miss', label: 'Page Miss' },
        { state: 'replacement', label: 'Page Replace' },
        { state: 'oldest', label: 'Next to Replace' },
        { state: 'empty', label: 'Empty Frame' }
    ];
    const itemWidth = 220;
    const totalWidth = legendItems.length * itemWidth;
    const startX = (canvasWidth - totalWidth) / 2;

    legendItems.forEach((item, index) => {
        const x = startX + (index * itemWidth);
        const colors = getFrameColors(item.state);
        const boxSize = 14;
        const boxX = x + 40;
        const boxY = startY - boxSize / 2;
        drawRoundedRectangle(boxX, boxY, boxSize, boxSize, 3, colors.fill, colors.stroke);
        drawText(item.label, boxX + boxSize + 80, startY, '#2c3e50', '22px Arial');
    });
}



function getResponsiveFrameLayout(frameCount, availableWidth) {
    const minFrameWidth = 100;
    const maxFrameWidth = 140;
    const spacing = 50;
    let frameWidth = (availableWidth - ((frameCount - 1) * spacing)) / frameCount;
    frameWidth = Math.max(minFrameWidth, Math.min(maxFrameWidth, frameWidth));
    if (frameWidth < minFrameWidth && frameCount > 6) {
        const framesPerRow = Math.floor(availableWidth / (minFrameWidth + spacing));
        const rows = Math.ceil(frameCount / framesPerRow);
        return {
            frameWidth: minFrameWidth,
            frameHeight: 80,
            framesPerRow,
            rows,
            spacing,
            layout: 'grid'
        };
    }
    return {
        frameWidth,
        frameHeight: 100,
        framesPerRow: frameCount,
        rows: 1,
        spacing,
        layout: 'horizontal'
    };
}

function drawMemoryFramesGrid(frames, highlightInfo = {}, currentPage = null, oldestFrameIndex = -1) {
    if (!frames || frames.length === 0) {
        return;
    }
    clearCanvas();
    const canvasDims = getCanvasDimensions();
    const margin = 30;
    const availableWidth = canvasDims.width - (2 * margin);
    const layout = getResponsiveFrameLayout(frames.length, availableWidth);
    drawText('Memory Frames (FIFO Order)', canvasWidth / 2, 35, '#2c3e50', '24px Arial');

    const startY = 60;
    if (layout.layout === 'grid') {
        for (let i = 0; i < frames.length; i++) {
            const row = Math.floor(i / layout.framesPerRow);
            const col = i % layout.framesPerRow;
            const x = margin + col * (layout.frameWidth + layout.spacing);
            const y = startY + row * (layout.frameHeight + layout.spacing);
            drawSingleFrame(frames[i], i, x, y, layout.frameWidth, layout.frameHeight,
                highlightInfo, oldestFrameIndex);
        }
    } else {
        const totalWidth = frames.length * layout.frameWidth + (frames.length - 1) * layout.spacing;
        const startX = (canvasDims.width - totalWidth) / 2;
        for (let i = 0; i < frames.length; i++) {
            const x = startX + i * (layout.frameWidth + layout.spacing);
            const y = startY;
            drawSingleFrame(frames[i], i, x, y, layout.frameWidth, layout.frameHeight,
                highlightInfo, oldestFrameIndex);
        }
    }

    const legendY = startY + (layout.rows * (layout.frameHeight + layout.spacing)) + 30;
    drawFrameLegend(legendY);
}

function drawSingleFrame(frameContent, frameIndex, x, y, width, height, highlightInfo, oldestFrameIndex) {
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
    const fontSize = Math.min(14, width / 8);
    drawText(`F${frameIndex}`, x + width / 2, y - 12, '#6c757d', `${fontSize}px Arial`);
    if (frameContent !== null) {
        const contentFontSize = Math.min(24, width / 4);
        drawText(`${frameContent}`, x + width / 2, y + height / 2, colors.text, `${contentFontSize}px Arial`);
    } else {
        const emptyFontSize = Math.min(16, width / 6);
        drawText('Empty', x + width / 2, y + height / 2, colors.text, `${emptyFontSize}px Arial`);
    }
    if (oldestFrameIndex === frameIndex && frameContent !== null && width > 120) {
        drawText('← Next', x + width + 20, y + height / 2, '#fd7e14', '16px Arial');
    }
}

function renderFIFOState(algorithm, animationState) {
    try {
        if (!algorithm) {
            return;
        }
        if (!canvas || !ctx) {
            return;
        }
        const currentState = algorithm.getCurrentState();
        if (!currentState) {
            return;
        }
        const frames = currentState.frames || [];
        const currentStep = animationState.currentStep || 0;
        const pageReferences = algorithm.pageReferences || [];
        const currentPage = currentStep < pageReferences.length ? pageReferences[currentStep] : null;
        const stepHistory = algorithm.getStepHistory ? algorithm.getStepHistory() : [];
        const currentStepData = stepHistory[currentStep - 1];
        let highlightInfo = {};
        if (currentStepData) {
            if (currentStepData.isHit) {
                const hitFrameIndex = frames.findIndex(frame => frame === currentPage);
                if (hitFrameIndex !== -1) {
                    highlightInfo.hitFrame = hitFrameIndex;
                }
            } else {
                if (currentStepData.replacedFrameIndex !== null && currentStepData.replacedFrameIndex !== undefined) {
                    highlightInfo.replacementFrame = currentStepData.replacedFrameIndex;
                } else {
                    const modifiedFrameIndex = frames.findIndex(frame => frame === currentPage);
                    if (modifiedFrameIndex !== -1) {
                        highlightInfo.missFrame = modifiedFrameIndex;
                    }
                }
            }
            highlightInfo.stepInfo = {
                operationType: currentStepData.isHit ? 'hit' : (currentStepData.replacedFrameIndex !== null ? 'replacement' : 'miss'),
                currentStep: currentStep,
                totalSteps: pageReferences.length,
                faultCount: currentStepData.faultCount,
                faultRate: currentStepData.faultRate
            };
        }
        const oldestFrameIndex = algorithm.getOldestFrameIndex ? algorithm.getOldestFrameIndex() : -1;
        drawMemoryFrames(frames, highlightInfo, currentPage, oldestFrameIndex);
    } catch (error) {
        try {
            clearCanvas();
            drawText('Error rendering visualization', canvasWidth / 2, canvasHeight / 2, '#e74c3c', '16px Arial');
        } catch (fallbackError) {
        }
    }
}

function exportCanvasScreenshot(filename = 'fifo-simulation.png') {
    try {
        if (!canvas) {
            throw new Error('Canvas not available for export');
        }
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAnimationStatus('Screenshot exported successfully!', 'success');
        return true;
    } catch (error) {
        showAnimationStatus(`Failed to export screenshot: ${error.message}`, 'error');
        return false;
    }
}

function generateExecutionTrace(algorithm) {
    if (!algorithm || !algorithm.getStepHistory) {
        return [];
    }
    const stepHistory = algorithm.getStepHistory();
    const traceData = [];
    stepHistory.forEach((step, index) => {
        traceData.push({
            step: index + 1,
            pageReference: step.pageNumber,
            isHit: step.isHit,
            frameState: step.frameState.join(','),
            faultCount: step.faultCount,
            faultRate: step.faultRate,
            replacedFrame: step.replacedFrameIndex,
            replacedPage: step.replacedPage
        });
    });
    return traceData;
}

function exportExecutionTraceCSV(algorithm, filename = 'fifo-execution-trace.csv') {
    try {
        const traceData = generateExecutionTrace(algorithm);
        if (traceData.length === 0) {
            throw new Error('No execution data available');
        }
        const headers = ['Step', 'Page Reference', 'Hit/Miss', 'Frame State', 'Fault Count', 'Fault Rate (%)', 'Replaced Frame', 'Replaced Page'];
        const csvContent = [
            headers.join(','),
            ...traceData.map(row => [
                row.step,
                row.pageReference,
                row.isHit ? 'Hit' : 'Miss',
                `"${row.frameState}"`,
                row.faultCount,
                row.faultRate,
                row.replacedFrame !== null ? row.replacedFrame : '',
                row.replacedPage !== null ? row.replacedPage : ''
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        showAnimationStatus('Execution trace exported successfully!', 'success');
        return true;
    } catch (error) {
        showAnimationStatus('Failed to export execution trace', 'error');
        return false;
    }
}

function exportExecutionTraceJSON(algorithm, filename = 'fifo-execution-trace.json') {
    try {
        const traceData = generateExecutionTrace(algorithm);
        if (traceData.length === 0) {
            throw new Error('No execution data available');
        }
        const exportData = {
            metadata: {
                algorithm: 'FIFO',
                frameCount: algorithm.frameCount,
                pageReferences: algorithm.pageReferences,
                totalSteps: traceData.length,
                totalFaults: traceData[traceData.length - 1].faultCount,
                finalFaultRate: traceData[traceData.length - 1].faultRate,
                exportDate: new Date().toISOString()
            },
            steps: traceData
        };
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        showAnimationStatus('Execution trace exported successfully!', 'success');
        return true;
    } catch (error) {
        showAnimationStatus('Failed to export execution trace', 'error');
        return false;
    }
}

function showExportTraceDialog(algorithm) {
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
        <div class="export-modal-content">
            <h3>Export Execution Trace</h3>
            <p>Choose the format for exporting the simulation trace:</p>
            <div class="export-options">
                <button id="export-csv" class="export-option-btn">
                    <span class="export-icon">📊</span>
                    <span class="export-label">CSV Format</span>
                    <span class="export-desc">Spreadsheet compatible</span>
                </button>
                <button id="export-json" class="export-option-btn">
                    <span class="export-icon">📄</span>
                    <span class="export-label">JSON Format</span>
                    <span class="export-desc">Structured data</span>
                </button>
            </div>
            <button id="cancel-export" class="cancel-btn">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('export-csv').addEventListener('click', () => {
        exportExecutionTraceCSV(algorithm);
        document.body.removeChild(modal);
    });
    document.getElementById('export-json').addEventListener('click', () => {
        exportExecutionTraceJSON(algorithm);
        document.body.removeChild(modal);
    });
    document.getElementById('cancel-export').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function validateInputs(frameCountInput, pageReferencesInput) {
    const errors = [];
    const frameCount = parseInt(frameCountInput, 10);
    if (isNaN(frameCount) || frameCount < 1 || frameCount > 10) {
        errors.push('Frame count must be between 1 and 10');
    }
    if (!pageReferencesInput || pageReferencesInput.trim() === '') {
        errors.push('Page references cannot be empty');
    }
    let pageReferences = [];
    if (pageReferencesInput) {
        const parts = pageReferencesInput.split(',').map(part => part.trim());
        for (let i = 0; i < parts.length; i++) {
            const pageNum = parseInt(parts[i], 10);
            if (isNaN(pageNum) || pageNum < 0) {
                errors.push(`Invalid page reference "${parts[i]}" at position ${i + 1}`);
                break;
            }
            pageReferences.push(pageNum);
        }
        if (pageReferences.length === 0 && errors.length === 0) {
            errors.push('At least one page reference is required');
        }
        if (pageReferences.length > 50) {
            errors.push('Maximum 50 page references allowed');
        }
    }
    return {
        isValid: errors.length === 0,
        errors: errors,
        frameCount: frameCount,
        pageReferences: pageReferences
    };
}

function displayError(message) {
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
        setTimeout(() => {
            errorDisplay.style.display = 'none';
        }, 5000);
    }
}

function hideError() {
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
        errorDisplay.style.display = 'none';
    }
}

function showLoadingState(message) {
    const initializeBtn = document.getElementById('initialize-btn');
    if (initializeBtn) {
        initializeBtn.disabled = true;
        initializeBtn.textContent = message;
    }
}

function hideLoadingState() {
    const initializeBtn = document.getElementById('initialize-btn');
    if (initializeBtn) {
        initializeBtn.disabled = false;
        initializeBtn.textContent = 'Initialize Simulation';
    }
}

function initializeSimulation(event) {
    event.preventDefault();
    hideError();
    const frameCountInput = document.getElementById('frame-count').value;
    const pageReferencesInput = document.getElementById('page-references').value;
    const validationResult = validateInputs(frameCountInput, pageReferencesInput);
    if (!validationResult.isValid) {
        displayError(validationResult.errors.join('. '));
        return;
    }
    showLoadingState('Initializing simulation...');
    try {
        if (!canvas) {
            throw new Error('Canvas not initialized');
        }
        const fifoAlgorithm = new FIFOAlgorithm(
            validationResult.frameCount,
            validationResult.pageReferences
        );
        const animationEngine = new AnimationEngine(null, fifoAlgorithm);
        window.currentFIFOAlgorithm = fifoAlgorithm;
        window.currentAnimationEngine = animationEngine;
        enableAnimationControls();
        updateAnimationControlStates();
        updateExportButtonStates(true, false);
        renderCurrentAnimationState();
        updateSimulationInfo();
        showSuccessMessage();
    } catch (error) {
        displayError(`Initialization failed: ${error.message}`);
    } finally {
        hideLoadingState();
    }
}

function updateSimulationInfo() {
    if (!window.currentFIFOAlgorithm || !window.currentAnimationEngine) {
        return;
    }
    const algorithmState = window.currentFIFOAlgorithm.getCurrentState();
    const animationState = window.currentAnimationEngine.getCurrentState();
    const currentPageElement = document.getElementById('current-page');
    const stepCounterElement = document.getElementById('step-counter');
    const faultCountElement = document.getElementById('fault-count');
    const faultRateElement = document.getElementById('fault-rate');
    if (currentPageElement) {
        const currentPage = animationState.currentStep > 0 && animationState.currentStep <= window.currentFIFOAlgorithm.pageReferences.length
            ? window.currentFIFOAlgorithm.pageReferences[animationState.currentStep - 1]
            : '-';
        currentPageElement.textContent = currentPage;
    }
    if (stepCounterElement) {
        stepCounterElement.textContent = `${animationState.currentStep} / ${algorithmState.totalSteps}`;
    }
    if (faultCountElement) {
        faultCountElement.textContent = algorithmState.faultCount;
    }
    if (faultRateElement) {
        faultRateElement.textContent = `${algorithmState.faultRate}%`;
    }

}

function updateOperationExplanation() {
    if (!window.currentFIFOAlgorithm || !window.currentAnimationEngine) {
        return;
    }
    const animationState = window.currentAnimationEngine.getCurrentState();
    const stepHistory = window.currentFIFOAlgorithm.getStepHistory();
    const explanationElement = document.getElementById('operation-explanation');
    const operationTypeElement = document.getElementById('operation-type');
    const modifiedFrameElement = document.getElementById('modified-frame');
    const previousValueElement = document.getElementById('previous-value');
    if (animationState.currentStep === 0) {
        if (explanationElement) {
            explanationElement.textContent = "Simulation ready. Click 'Start' or 'Step Forward' to begin processing page references and see detailed explanations of each FIFO algorithm operation.";
            explanationElement.className = "explanation-text initial";
        }
        if (operationTypeElement) operationTypeElement.textContent = '-';
        if (modifiedFrameElement) modifiedFrameElement.textContent = '-';
        if (previousValueElement) previousValueElement.textContent = '-';
        return;
    }
    const currentStepData = stepHistory[animationState.currentStep - 1];
    if (!currentStepData) {
        return;
    }
    let explanation = '';
    let operationType = '';
    let modifiedFrame = '-';
    let previousValue = '-';
    if (currentStepData.isHit) {
        operationType = 'Page Hit';
        explanation = `Page ${currentStepData.pageNumber} was found in memory. No page fault occurred, and no frames were modified. This is the most efficient outcome as no disk I/O is required.`;
        const hitFrameIndex = window.currentFIFOAlgorithm.getCurrentState().frames.findIndex(frame => frame === currentStepData.pageNumber);
        if (hitFrameIndex !== -1) {
            modifiedFrame = `Frame ${hitFrameIndex}`;
            previousValue = `${currentStepData.pageNumber} (unchanged)`;
        }
    } else {
        if (currentStepData.replacedFrameIndex !== null) {
            operationType = 'Page Replacement';
            explanation = `Page ${currentStepData.pageNumber} was not in memory, causing a page fault. All frames were full, so the oldest page (${currentStepData.replacedPage}) was replaced using the FIFO algorithm. Frame ${currentStepData.replacedFrameIndex} now contains page ${currentStepData.pageNumber}.`;
            modifiedFrame = `Frame ${currentStepData.replacedFrameIndex}`;
            previousValue = `${currentStepData.replacedPage}`;
        } else {
            operationType = 'Page Fault (Empty Frame)';
            explanation = `Page ${currentStepData.pageNumber} was not in memory, causing a page fault. An empty frame was available, so page ${currentStepData.pageNumber} was loaded without replacing any existing pages.`;
            const emptyFrameIndex = currentStepData.frameState.findIndex((frame, index) =>
                frame === currentStepData.pageNumber &&
                (stepHistory[animationState.currentStep - 2]?.frameState[index] === null || stepHistory.length === 1)
            );
            if (emptyFrameIndex !== -1) {
                modifiedFrame = `Frame ${emptyFrameIndex}`;
                previousValue = 'Empty';
            }
        }
    }
    if (explanationElement) {
        explanationElement.textContent = explanation;
        explanationElement.className = `explanation-text ${currentStepData.isHit ? 'hit' : 'fault'}`;
    }
    if (operationTypeElement) {
        operationTypeElement.textContent = operationType;
        operationTypeElement.className = `operation-badge ${currentStepData.isHit ? 'hit' : 'fault'}`;
    }
    if (modifiedFrameElement) {
        modifiedFrameElement.textContent = modifiedFrame;
    }
    if (previousValueElement) {
        previousValueElement.textContent = previousValue;
    }
}

function showSuccessMessage() {
    showAnimationStatus('Simulation initialized successfully!', 'success');
}

function updateExportButtonStates(canExportScreenshot, canExportTrace) {
    const screenshotBtn = document.getElementById('export-screenshot-btn');
    const traceBtn = document.getElementById('export-trace-btn');
    if (screenshotBtn) {
        screenshotBtn.disabled = !canExportScreenshot;
    }
    if (traceBtn) {
        traceBtn.disabled = !canExportTrace;
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



function setupEventListeners() {
    const simulationForm = document.getElementById('simulation-form');
    if (simulationForm) {
        simulationForm.addEventListener('submit', initializeSimulation);
    }
    const exportScreenshotBtn = document.getElementById('export-screenshot-btn');
    if (exportScreenshotBtn) {
        exportScreenshotBtn.addEventListener('click', () => {
            exportCanvasScreenshot();
        });
    }
    const exportTraceBtn = document.getElementById('export-trace-btn');
    if (exportTraceBtn) {
        exportTraceBtn.addEventListener('click', () => {
            if (!window.currentFIFOAlgorithm) {
                showAnimationStatus('No simulation data to export', 'error');
                return;
            }
            showExportTraceDialog(window.currentFIFOAlgorithm);
        });
    }
    const toggleInstructionsBtn = document.getElementById('toggle-instructions-btn');
    const instructionsContent = document.getElementById('instructions-content');
    if (toggleInstructionsBtn && instructionsContent) {
        toggleInstructionsBtn.addEventListener('click', () => {
            const isExpanded = instructionsContent.style.display !== 'none';
            instructionsContent.style.display = isExpanded ? 'none' : 'block';
            const icon = toggleInstructionsBtn.querySelector('.toggle-icon');
            const text = toggleInstructionsBtn.querySelector('.toggle-text');
            if (icon && text) {
                icon.textContent = isExpanded ? '▶' : '▼';
                text.textContent = isExpanded ? 'Show Instructions' : 'Hide Instructions';
            }
            toggleInstructionsBtn.setAttribute('aria-expanded', !isExpanded);
        });
    }
    const loadExampleBtns = document.querySelectorAll('.load-example-btn');
    loadExampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const frames = btn.getAttribute('data-frames');
            const references = btn.getAttribute('data-references');
            const frameCountInput = document.getElementById('frame-count');
            const pageReferencesInput = document.getElementById('page-references');
            if (frameCountInput && pageReferencesInput) {
                frameCountInput.value = frames;
                pageReferencesInput.value = references;
                showAnimationStatus('Example loaded! Click "Initialize Simulation" to start.', 'success');
            }
        });
    });
}

function initializeApplication() {
    if (!initializeCanvas()) {
        return;
    }
    setupEventListeners();
    setupAnimationControlListeners();
    setupKeyboardShortcuts();
    clearCanvas();
    drawText('Configure and initialize simulation to begin', canvasWidth / 2, canvasHeight / 2, '#6c757d', '14px Arial');
}

document.addEventListener('DOMContentLoaded', initializeApplication);