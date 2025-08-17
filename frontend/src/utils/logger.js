export const logger = {
    log: (...args) => {
        if (import.meta.env.DEV) {
            console.log(...args);
        }
    },

    warn: (...args) => {
        if (import.meta.env.DEV) {
            console.warn(...args);
        }
    },

    error: (...args) => {
        // 에러는 항상 출력 (프로덕션에서도 중요)
        console.error(...args);
    },

    debug: (...args) => {
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MODE === 'true') {
            console.debug(...args);
        }
    }
};
