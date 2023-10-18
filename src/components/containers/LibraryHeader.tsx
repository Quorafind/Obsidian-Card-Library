import { cva } from "class-variance-authority";

const headerVariants = cva(
    "rounded-xl border bg-card text-card-foreground shadow",
    {
        variants: {
            size: {
                default: "w-[196px]",
                wide: "w-[240px]",
                narrow: "w-[168px]",
                fix: 'w-1/4',
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);
