import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import discard from "postcss-discard";
import prefixSelector from "postcss-prefix-selector";

/** @type {import("postcss").Plugin} */
const prefix = prefixSelector({
    prefix: ":is(div[data-type='card-library-view'], div[data-radix-popper-content-wrapper], span[data-radix-focus-guard])",
    transform: (prefix, selector, prefixedSelector, _filePath, _rule) => {
        if (selector.includes(".theme-dark")) {
            return selector.replace(".theme-dark", `.theme-dark ${prefix}`);
        } else if (selector.includes(".theme-light")) {
            return selector.replace(".theme-light", `.theme-light ${prefix}`);
        } else if (selector.includes(".view-content") || selector.includes(".card-library-settings")) {
            return selector;
        } else {
            return prefixedSelector;
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
