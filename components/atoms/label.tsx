"use client";

import type { ReactNode, Ref } from "react";
import { InfoCircleFilled } from "@/components/atoms/icons";
import type { LabelProps as AriaLabelProps } from "react-aria-components";
import { Label as AriaLabel } from "react-aria-components";
import { cx } from "@/lib/utils";

export interface LabelProps extends AriaLabelProps {
  children: ReactNode;
  isRequired?: boolean;
  isInvalid?: boolean;
  tooltip?: boolean | string;
  ref?: Ref<HTMLLabelElement>;
}

export function Label({
  isRequired = false,
  isInvalid: _isInvalid,
  tooltip,
  className,
  children,
  ...props
}: LabelProps) {
  void _isInvalid;
  return (
    <AriaLabel
      data-label="true"
      {...props}
      className={cx(
        "flex cursor-default items-center gap-0.5",
        "text-body-medium text-ink",
        className,
      )}
    >
      {children}
      {isRequired && (
        <span
          aria-hidden="true"
          className="text-body-medium text-red"
        >
          *
        </span>
      )}
      {tooltip && (
        <InfoCircleFilled
          className="size-4 shrink-0 text-line-strong"
          aria-hidden
        />
      )}
    </AriaLabel>
  );
}
