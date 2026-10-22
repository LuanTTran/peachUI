"use client";

import { Drop, Health, Plus, Stethoscope, User } from "reicon-react";
import type { ComponentType } from "react";
import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { cx } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

type Detail = { icon: IconComponent; label: string; value: string };

const DETAILS: Detail[] = [
  { icon: Health, label: "Date of Birth", value: "28 July, 1997" },
  { icon: User, label: "Gender", value: "Male" },
  { icon: Drop, label: "Blood type", value: "A rh+" },
  { icon: Stethoscope, label: "GP Doctor", value: "Mattheus Clarkson" },
];

export function PatientInfoCard({ className }: { className?: string } = {}) {
  return (
    <section
      className={cx(
        "flex h-[330px] w-full min-w-0 flex-col items-center gap-[15px] rounded-[20px] bg-canvas px-2.5 pt-6 pb-2.5",
        className,
      )}
    >
      <div className="relative">
        <Avatar size="lg" initials="M" className="size-[66px] text-[24.75px]" />
        <Button
          variant="secondary"
          size="xs"
          iconOnly
          leadingIcon={Plus}
          aria-label="Add profile photo"
          className="absolute -top-0.5 -end-0.5 rounded-full"
        />
      </div>
      <p className="text-title-2-medium whitespace-nowrap text-ink">Alex Morgan</p>
      <div className="flex w-full flex-1 flex-col gap-2.5">
        {DETAILS.map((detail) => (
          <div
            key={detail.label}
            className="flex w-full items-center justify-between rounded-2lg bg-surface px-2.5 py-2"
          >
            <div className="flex items-center gap-1.5">
              <detail.icon className="size-4 shrink-0 text-ink-2" aria-hidden />
              <span className="text-body-regular whitespace-nowrap text-ink-2">
                {detail.label}
              </span>
            </div>
            <span className="text-body-medium whitespace-nowrap text-ink">{detail.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
