"use client";

import type { ComponentType, HTMLAttributes, ReactNode, Ref } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShieldStarFilled } from "@/components/atoms/icons";
import { Button } from "@/components/atoms/button";
import { CloseButton } from "@/components/atoms/close-button";
import { cx, sortCx } from "@/lib/utils";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface AnnouncementProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
  > {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconComponent;
  actionLabel?: ReactNode;
  onAction?: () => void;
  dismissible?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  introDelay?: number;
  ref?: Ref<HTMLDivElement>;
}

const styles = sortCx({
  card: [
    "relative flex w-full flex-col items-start gap-3 p-3",
    "rounded-xl border border-line bg-surface",
  ].join(" "),
  content: "flex w-full flex-col items-start gap-1",
  icon: "size-5 shrink-0 text-ink-2",
  close: "absolute end-3 top-3",
  text: "flex w-full flex-col items-start gap-0.5",
  title: "w-full text-body-medium text-ink",
  description: "w-full text-body-2-medium text-ink-2",
});

export function Announcement({
  title,
  description,
  icon: Icon = ShieldStarFilled,
  actionLabel,
  onAction,
  dismissible = false,
  onClose,
  closeLabel = "Dismiss",
  introDelay,
  className,
  ref,
  ...props
}: AnnouncementProps) {
  const [dismissed, setDismissed] = useState(false);
  const hasIntro = introDelay !== undefined;

  return (
    <AnimatePresence onExitComplete={onClose}>
      {!dismissed && (
        <motion.div
          ref={ref}
          initial={hasIntro ? { opacity: 0, y: 15, scale: 0.85, filter: "blur(6px)" } : false}
          animate={
            hasIntro
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: { duration: 0.25, ease: "easeOut", delay: introDelay },
                }
              : undefined
          }
          exit={{
            opacity: 0,
            scale: 0.85,
            filter: "blur(6px)",
            transition: { duration: 0.25, ease: "easeInOut" },
          }}
          className={cx(styles.card, className)}
          {...props}
        >
          <div className={styles.content}>
            <Icon className={styles.icon} aria-hidden />

            {dismissible ? (
              <CloseButton
                size="xs"
                aria-label={closeLabel}
                onClick={() => setDismissed(true)}
                className={styles.close}
              />
            ) : null}

            <div className={styles.text}>
              <p className={styles.title}>{title}</p>
              {description ? <p className={styles.description}>{description}</p> : null}
            </div>
          </div>

          {actionLabel ? (
            <Button
              variant="secondary"
              size="small"
              onClick={onAction}
              className="w-full"
            >
              {actionLabel}
            </Button>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
