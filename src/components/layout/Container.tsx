import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-[var(--container-max)] px-5 md:px-10 lg:px-20",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
