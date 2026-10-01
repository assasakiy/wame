import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "@/shared/components/button-styles";

interface Props extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({ variant, size, className, ...props }: Props) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
