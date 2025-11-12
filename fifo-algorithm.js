class FIFOAlgorithm {
    constructor(frameCount, pageReferences) {
        if (!Number.isInteger(frameCount) || frameCount <= 0) {
            throw new Error('Frame count must be a positive integer');
        }
        if (!Array.isArray(pageReferences) || pageReferences.length === 0) {
            throw new Error('Page references must be a non-empty array');
        }
        for (let i = 0; i < pageReferences.length; i++) {
            if (!Number.isInteger(pageReferences[i]) || pageReferences[i] < 0) {
                throw new Error(`Page reference at index ${i} must be a non-negative integer`);
            }
        }
        this.frameCount = frameCount;
        this.pageReferences = [...pageReferences];
        this.frames = new Array(frameCount).fill(null);
        this.fifoQueue = [];
        this.currentStep = 0;
        this.faultCount = 0;
        this.stepHistory = [];
    }

    processPageReference(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.pageReferences.length) {
            throw new Error(`Invalid step index: ${stepIndex}`);
        }
        const pageNumber = this.pageReferences[stepIndex];
        const isHit = this.isPageHit(pageNumber);
        let replacedFrameIndex = null;
        let replacedPage = null;
        if (!isHit) {
            this.faultCount++;
            const emptyFrameIndex = this.findEmptyFrameIndex();
            if (emptyFrameIndex !== -1) {
                this.frames[emptyFrameIndex] = pageNumber;
                this.fifoQueue.push(emptyFrameIndex);
            } else {
                replacedFrameIndex = this.fifoQueue.shift();
                replacedPage = this.frames[replacedFrameIndex];
                this.frames[replacedFrameIndex] = pageNumber;
                this.fifoQueue.push(replacedFrameIndex);
            }
        }
        this.currentStep = stepIndex + 1;
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
        this.stepHistory.push(stepResult);
        return stepResult;
    }

    isPageHit(pageNumber) {
        return this.frames.includes(pageNumber);
    }

    findEmptyFrameIndex() {
        return this.frames.findIndex(frame => frame === null);
    }

    calculateFaultRate() {
        if (this.currentStep === 0) return 0;
        return Math.round((this.faultCount / this.currentStep) * 100 * 100) / 100;
    }

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

    createStateSnapshot() {
        return {
            frames: [...this.frames],
            fifoQueue: [...this.fifoQueue],
            currentStep: this.currentStep,
            faultCount: this.faultCount
        };
    }

    getStepHistory() {
        return [...this.stepHistory];
    }

    restoreToStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.stepHistory.length) {
            throw new Error(`Invalid step index for restoration: ${stepIndex}`);
        }
        const stepResult = this.stepHistory[stepIndex];
        this.frames = [...stepResult.frameState];
        this.faultCount = stepResult.faultCount;
        this.currentStep = stepResult.stepIndex + 1;
        this.fifoQueue = [];
        for (let i = 0; i < this.frames.length; i++) {
            if (this.frames[i] !== null) {
                this.fifoQueue.push(i);
            }
        }
    }

    getOldestFrameIndex() {
        return this.fifoQueue.length > 0 ? this.fifoQueue[0] : -1;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FIFOAlgorithm;
} else if (typeof window !== 'undefined') {
    window.FIFOAlgorithm = FIFOAlgorithm;
}