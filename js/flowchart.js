'use strict';

class FlowchartConnector {
    constructor(canvasId, flowchartId, connectionType = 'default') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.flowchart = document.getElementById(flowchartId);
        this.connectionType = connectionType;
        this.lineColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        this.lineWidth = 3;
        this.arrowSize = 8;
        this.init();
    }

    resolveColor(color) {
        if (color.startsWith('var(')) {
            const varName = color.match(/var\((--[^)]+)\)/)[1];
            return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        }
        return color;
    }

    init() {
        this.resizeCanvas();
        this.drawConnections();
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => { this.resizeCanvas(); this.drawConnections(); }, 100);
        });
    }

    resizeCanvas() {
        const rect = this.flowchart.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * pixelRatio;
        this.canvas.height = rect.height * pixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(pixelRatio, pixelRatio);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    getElementBottom(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return null;
        const fr = this.flowchart.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        return { x: er.left + er.width / 2 - fr.left, y: er.bottom - fr.top };
    }

    getElementTop(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return null;
        const fr = this.flowchart.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        return { x: er.left + er.width / 2 - fr.left, y: er.top - fr.top };
    }

    drawArrow(fromX, fromY, toX, toY, color = this.lineColor, dashed = false) {
        const resolvedColor = this.resolveColor(color);
        this.ctx.strokeStyle = resolvedColor;
        this.ctx.fillStyle = resolvedColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash(dashed ? [7, 5] : []);
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        const angle = Math.atan2(toY - fromY, toX - fromX);
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - this.arrowSize * Math.cos(angle - Math.PI / 6), toY - this.arrowSize * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(toX - this.arrowSize * Math.cos(angle + Math.PI / 6), toY - this.arrowSize * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawConnection(fromId, toId, color = this.lineColor, dashed = false) {
        const fromPos = this.getElementBottom(fromId);
        const toPos = this.getElementTop(toId);
        if (!fromPos || !toPos) return;
        this.drawArrow(fromPos.x, fromPos.y, toPos.x, toPos.y, color, dashed);
    }

    drawConnections() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.connectionType === 'muktzeh') {
            const green  = 'var(--category-gradient-start)';
            const red    = 'var(--category-error-start)';
            const dashed = '#888888';
            [
                // Q1
                ['muktzeh-q1',      'muktzeh-q1-yes',  green,  false],
                ['muktzeh-q1',      'muktzeh-q1-no',   red,    false],
                ['muktzeh-q1-next', 'muktzeh-q2',      dashed, true ],
                // Q2
                ['muktzeh-q2',      'muktzeh-q2-yes',  green,  false],
                ['muktzeh-q2',      'muktzeh-q2-no',   red,    false],
                ['muktzeh-q2-next', 'muktzeh-q3',      dashed, true ],
                // Q3
                ['muktzeh-q3',      'muktzeh-q3-yes',  green,  false],
                ['muktzeh-q3',      'muktzeh-q3-no',   red,    false],
                ['muktzeh-q3-next', 'muktzeh-q4',      dashed, true ],
                // Q4
                ['muktzeh-q4',      'muktzeh-q4-yes',  green,  false],
                ['muktzeh-q4',      'muktzeh-q4-no',   red,    false],
                ['muktzeh-q4-next', 'muktzeh-q4b',     dashed, true ],
                // Q4b (מחמת מצווה)
                ['muktzeh-q4b',      'muktzeh-q4b-yes', green,  false],
                ['muktzeh-q4b',      'muktzeh-q4b-no',  red,    false],
                ['muktzeh-q4b-next', 'muktzeh-q5',      dashed, true ],
                // Q5
                ['muktzeh-q5',      'muktzeh-q5-yes',  green,  false],
                ['muktzeh-q5',      'muktzeh-q5-no',   red,    false],
                ['muktzeh-q5-next', 'muktzeh-q6',      dashed, true ],
                // Q6
                ['muktzeh-q6',      'muktzeh-q6-yes',  green,  false],
                ['muktzeh-q6',      'muktzeh-q6-no',   red,    false],
            ].forEach(([f, t, c, d]) => this.drawConnection(f, t, c, d));
        }
    }
}

let muktzehFlowchartInstance = null;

function initMuktzehFlowchart() {
    setTimeout(() => {
        muktzehFlowchartInstance = new FlowchartConnector('connectionCanvasMuktzeh', 'flowchart-muktzeh', 'muktzeh');
    }, 150);
}

function redrawMuktzehFlowchart() {
    if (muktzehFlowchartInstance) {
        muktzehFlowchartInstance.lineColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        muktzehFlowchartInstance.resizeCanvas();
        muktzehFlowchartInstance.drawConnections();
    }
}

(function () {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('slide') && target.classList.contains('active')) {
                    if (target.querySelector('#flowchart-muktzeh')) initMuktzehFlowchart();
                }
            }
        });
    });

    function startObserving() {
        const container = document.getElementById('slideshow-container');
        if (container) observer.observe(container, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }

    function hookThemeChanges() {
        const ot = window.changeTheme;
        if (typeof ot === 'function') window.changeTheme = function(t) { ot(t); setTimeout(redrawMuktzehFlowchart, 200); };
        const om = window.changeMode;
        if (typeof om === 'function') window.changeMode = function(m) { om(m); setTimeout(redrawMuktzehFlowchart, 200); };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { startObserving(); setTimeout(hookThemeChanges, 500); });
    } else {
        startObserving();
        setTimeout(hookThemeChanges, 500);
    }
})();
