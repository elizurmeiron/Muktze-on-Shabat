'use strict';

/**
 * FlowchartConnector for muktzeh presentation
 * Based on the shared FlowchartConnector pattern from flowcharts.js
 * Handles drawing connections between flowchart elements on canvas
 */
class FlowchartConnector {
    constructor(canvasId, flowchartId, connectionType = 'default') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.flowchart = document.getElementById(flowchartId);
        this.connectionType = connectionType;

        // Color and style settings - reading actual value from CSS
        this.lineColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        this.lineWidth = 3;
        this.arrowSize = 8;

        this.init();
    }

    /**
     * Convert CSS variables to actual color values
     */
    resolveColor(color) {
        if (color.startsWith('var(')) {
            const varName = color.match(/var\((--[^)]+)\)/)[1];
            return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        }
        return color;
    }

    /**
     * Initialize the connector
     */
    init() {
        this.resizeCanvas();
        this.drawConnections();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.drawConnections();
            }, 100);
        });
    }

    /**
     * Resize canvas to match flowchart dimensions
     */
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

    /**
     * Get bottom center position of an element
     */
    getElementBottom(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const flowchartRect = this.flowchart.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        return {
            x: elementRect.left + elementRect.width / 2 - flowchartRect.left,
            y: elementRect.bottom - flowchartRect.top
        };
    }

    /**
     * Get top center position of an element
     */
    getElementTop(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const flowchartRect = this.flowchart.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        return {
            x: elementRect.left + elementRect.width / 2 - flowchartRect.left,
            y: elementRect.top - flowchartRect.top
        };
    }

    /**
     * Draw an arrow from one point to another
     */
    drawArrow(fromX, fromY, toX, toY, color = this.lineColor) {
        const resolvedColor = this.resolveColor(color);
        this.ctx.strokeStyle = resolvedColor;
        this.ctx.fillStyle = resolvedColor;
        this.ctx.lineWidth = this.lineWidth;

        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        // Calculate arrow angle
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Draw arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - this.arrowSize * Math.cos(angle - Math.PI / 6),
            toY - this.arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            toX - this.arrowSize * Math.cos(angle + Math.PI / 6),
            toY - this.arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Draw connection line between two elements
     */
    drawConnection(fromElementId, toElementId, color = this.lineColor) {
        const fromPos = this.getElementBottom(fromElementId);
        const toPos = this.getElementTop(toElementId);

        if (!fromPos || !toPos) return;

        this.drawArrow(fromPos.x, fromPos.y, toPos.x, toPos.y, color);
    }

    /**
     * Draw all connections based on flowchart type
     */
    drawConnections() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.connectionType === 'muktzeh') {
            const connections = [
                // Q1: כלי שמלאכתו להיתר / אוכל / ספר
                { from: 'muktzeh-q1', to: 'muktzeh-q1-yes', color: 'var(--category-gradient-start)' },
                { from: 'muktzeh-q1', to: 'muktzeh-q1-no', color: 'var(--category-error-start)' },

                // Q2: כלי שמלאכתו לאיסור
                { from: 'muktzeh-q2', to: 'muktzeh-q2-yes', color: 'var(--category-gradient-start)' },
                { from: 'muktzeh-q2', to: 'muktzeh-q2-no', color: 'var(--category-error-start)' },

                // Q3: מוקצה מחמת גופו
                { from: 'muktzeh-q3', to: 'muktzeh-q3-yes', color: 'var(--category-gradient-start)' },
                { from: 'muktzeh-q3', to: 'muktzeh-q3-no', color: 'var(--category-error-start)' },

                // Q4: מוקצה מחמת חסרון כיס
                { from: 'muktzeh-q4', to: 'muktzeh-q4-yes', color: 'var(--category-gradient-start)' },
                { from: 'muktzeh-q4', to: 'muktzeh-q4-no', color: 'var(--category-error-start)' },

                // Q5: בסיס לדבר האסור
                { from: 'muktzeh-q5', to: 'muktzeh-q5-yes', color: 'var(--category-gradient-start)' },
                { from: 'muktzeh-q5', to: 'muktzeh-q5-no', color: 'var(--category-error-start)' },

                // Q6: גרף של רעי
                { from: 'muktzeh-q6', to: 'muktzeh-q6-yes', color: 'var(--category-gradient-start)' },
                { from: 'muktzeh-q6', to: 'muktzeh-q6-no', color: 'var(--category-error-start)' }
            ];

            connections.forEach(conn => {
                this.drawConnection(conn.from, conn.to, conn.color);
            });
        }
    }
}

/**
 * Initialize the muktzeh flowchart when its slide becomes visible
 */
let muktzehFlowchartInstance = null;

function initMuktzehFlowchart() {
    // Small delay to ensure layout is complete
    setTimeout(() => {
        muktzehFlowchartInstance = new FlowchartConnector(
            'connectionCanvasMuktzeh',
            'flowchart-muktzeh',
            'muktzeh'
        );
    }, 150);
}

/**
 * Redraw muktzeh flowchart (called on theme/mode changes)
 */
function redrawMuktzehFlowchart() {
    if (muktzehFlowchartInstance) {
        muktzehFlowchartInstance.lineColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim();
        muktzehFlowchartInstance.resizeCanvas();
        muktzehFlowchartInstance.drawConnections();
    }
}

/**
 * Watch for slide changes and initialize flowchart when slide 18 becomes active.
 * Also hooks into theme/mode changes to redraw with correct colors.
 */
(function () {
    // Find the muktzeh slide index
    function getMuktzehSlideIndex() {
        const slides = document.querySelectorAll('.slide');
        for (let i = 0; i < slides.length; i++) {
            if (slides[i].querySelector('#flowchart-muktzeh')) {
                return i;
            }
        }
        return -1;
    }

    // Observe slide changes via class mutations
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('slide') && target.classList.contains('active')) {
                    if (target.querySelector('#flowchart-muktzeh')) {
                        initMuktzehFlowchart();
                    }
                }
            }
        });
    });

    // Start observing once DOM is ready
    function startObserving() {
        const container = document.getElementById('slideshow-container');
        if (container) {
            observer.observe(container, {
                attributes: true,
                subtree: true,
                attributeFilter: ['class']
            });
        }
    }

    // Hook into theme/mode changes to redraw flowchart
    function hookThemeChanges() {
        // Override changeTheme if it exists
        const originalChangeTheme = window.changeTheme;
        if (typeof originalChangeTheme === 'function') {
            window.changeTheme = function (theme) {
                originalChangeTheme(theme);
                setTimeout(redrawMuktzehFlowchart, 200);
            };
        }

        // Override changeMode if it exists
        const originalChangeMode = window.changeMode;
        if (typeof originalChangeMode === 'function') {
            window.changeMode = function (mode) {
                originalChangeMode(mode);
                setTimeout(redrawMuktzehFlowchart, 200);
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            startObserving();
            // Delay hooking so main.js has time to define functions
            setTimeout(hookThemeChanges, 500);
        });
    } else {
        startObserving();
        setTimeout(hookThemeChanges, 500);
    }
})();
