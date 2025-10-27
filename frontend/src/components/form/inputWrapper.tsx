import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

export default function InputWrapper({
    children,
    title,
    name,
}: {
    children: ReactNode;
    title: string;
    name: string;
}) {
    const {
        formState: { errors },
    } = useFormContext();

    const error = errors[name] === undefined ? null : errors[name].message;

    return (
        <div>
            <p className="mb-1">{title}</p>
            {children}
            {error !== null && <p className="mt-1 text-red-600">{error}</p>}
        </div>
    );
}
