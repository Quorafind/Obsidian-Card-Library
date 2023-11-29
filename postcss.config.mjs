import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import discard from "postcss-discard";
import prefixSelector from "postcss-prefix-selector";

const prefixList = [
    'div[data-type="card-library-view"]',
    'div[data-radix-popper-content-wrapper]',
    'span[data-radix-focus-guard]',
    'div[role="dialog"]',
    'div[data-state="open"].dialog-background',
]

const dialogPrefix = ['div[role="dialog"]', 'div[data-state="open"].dialog-background']

function processSelector(selector, lightOrDark) {
    let newSelector = '';
    if(lightOrDark) {
        const tempSelector = selector.replace(lightOrDark, '');
        for(let i = 0; i < prefixList.length; i++) {
            newSelector += lightOrDark + ' ' + prefixList[i] + ' ' + tempSelector + ', ';
        }
        for(let i = 0; i < dialogPrefix.length; i++) {
            newSelector +=  `body${lightOrDark}` + ' > ' + dialogPrefix[i] + (tempSelector.trim().startsWith('.') ? tempSelector : ' ' + tempSelector) + (i === dialogPrefix.length - 1 ? '' : ', ');
        }
    } else {
        for(let i = 0; i < prefixList.length; i++) {
            newSelector += prefixList[i] + ' ' + selector + ', ';
        }
        for(let i = 0; i < dialogPrefix.length; i++) {
            newSelector += 'body > ' + dialogPrefix[i] + (selector.trim().startsWith('.') ? selector : ' ' + selector) + (i === dialogPrefix.length - 1 ? '' : ', ');
        }
    }
    return newSelector;
}

/** @type {import("postcss").Plugin} */
const prefix = prefixSelector({
    prefix: ":is(div[data-type='card-library-view'], div[data-radix-popper-content-wrapper], div[role='dialog'], span[data-radix-focus-guard])",
    transform: (prefix, selector, prefixedSelector, _filePath, _rule) => {
        if (selector.includes(".theme-dark")) {
            return processSelector(selector, ".theme-dark");
        } else if (selector.includes(".theme-light")) {
            return processSelector(selector, ".theme-light");
        } else if (selector.includes(".view-content") || selector.includes(".card-library-settings")) {
            return selector;
        } else {
            return processSelector(selector);
        }
    },
});

export default {
    plugins: [
        tailwindcss(),
        autoprefixer({}),
        prefix,
        discard({
            rule: ["html", "body"],
        }),
    ],
};
