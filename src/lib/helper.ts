import { moment } from "obsidian";

namespace utils {
    export function getNowTimeStamp(): number {
        return parseInt(moment().format('x'));
    }

    export function getDateString(t: number | string): string {
        return moment(t, 'x').format('YYYY/MM/DD HH:mm:ss');
    }

    export function dedupe<T>(data: T[]): T[] {
        return Array.from(new Set(data));
    }

    export function dedupeObjectWithId<T extends {
        id: string
    }>(data: T[]): T[] {
        const idSet = new Set<string>();
        const result = [];

        for (const d of data) {
            if (!idSet.has(d.id)) {
                idSet.add(d.id);
                result.push(d);
            }
        }

        return result;
    }

    export async function copyTextToClipboard(text: string) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
            } catch (error: unknown) {
                console.warn('Copy to clipboard failed.', error);
            }
        } else {
            console.warn('Copy to clipboard failed, methods not supports.');
        }
    }

    export function getImageSize(src: string): Promise<{
        width: number;
        height: number
    }> {
        return new Promise((resolve) => {
            const imgEl = new Image();

            imgEl.onload = () => {
                const {width, height} = imgEl;

                if (width > 0 && height > 0) {
                    resolve({width, height});
                } else {
                    resolve({width: 0, height: 0});
                }
            };

            imgEl.onerror = () => {
                resolve({width: 0, height: 0});
            };

            imgEl.className = 'hidden';
            imgEl.src = src;
            document.body.appendChild(imgEl);
            imgEl.remove();
        });
    }

    export function randomId(e: number): string {
        const t = [];
        let n = 0;
        for (; n < e; n++) t.push(((16 * Math.random()) | 0).toString(16));
        return t.join('');
    }

    export function countWords(text: string): number {
        const strippedText = text.replace(/[\p{P}\p{Z}\p{S}]/gu, '');
        return strippedText.length;
    }
}

export default utils;
