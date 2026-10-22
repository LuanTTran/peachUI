"use client";

/**
 * PeachUI — StepperForm (block)
 * @tier block
 * @deps button, input, label, hint-text, chip, close-button, link-button, radio, radio-card, motion
 * @requires app/globals.css
 *
 * Multi-step form shell with a top progress rail, animated panels, and an
 * optional success screen. Pass your own `steps` array for production flows;
 * `StepperFormWorkspaceDemo` is the catalog-ready workspace onboarding.
 *
 * Variants:
 *   standalone — outer `rounded-card` + `shadow-card` (full block on a page).
 *   embedded   — nests inside another surface (`rounded-panel`, hairline only).
 *   Pick embedded when the stepper sits inside settings, a modal, or a thread.
 */

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Radio as AriaRadio } from "react-aria-components";
import { ChevronLeft } from "reicon-react";
import { blockEase } from "@/components/lib/block-motion";
import { Button } from "@/components/atoms/button";
import { Chip } from "@/components/atoms/chip";
import { CloseButton } from "@/components/atoms/close-button";
import { HintText } from "@/components/atoms/hint-text";
import { TickCircleFilled } from "@/components/atoms/icons";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { LinkButton } from "@/components/atoms/link-button";
import { RadioDot } from "@/components/atoms/radio";
import { RadioGroup } from "@/components/atoms/radio";
import { cx } from "@/lib/utils";

/** Wizard step slide — tuned for snappy forward/back (see transitions.dev page side-by-side). */
const PANEL_OFFSET = 12;
const PANEL_ENTER = { duration: 0.2, ease: blockEase } as const;
const PANEL_EXIT = { duration: 0.14, ease: blockEase } as const;
const SUCCESS_ENTER = { duration: 0.22, ease: blockEase } as const;
const SUCCESS_EXIT = { duration: 0.12, ease: blockEase } as const;

export type StepperFormVariant = "standalone" | "embedded";

export type StepperFormActions = {
  activeIndex: number;
  goToStep: (index: number) => void;
};

export type StepperFormStep = {
  id: string;
  /** Short name in the top rail (e.g. "Workspace"). */
  label: string;
  title: ReactNode;
  description?: ReactNode;
  content: ReactNode | ((actions: StepperFormActions) => ReactNode);
  /** Overrides the shell default for this step only. */
  continueLabel?: string;
};

export type StepperFormSuccess = {
  title: ReactNode;
  description?: ReactNode;
  resetLabel?: string;
};

export type StepperFormLabels = {
  back: string;
  continue: string;
};

export const defaultStepperFormLabels: StepperFormLabels = {
  back: "Back",
  continue: "Continue",
};

export type StepperFormProps = {
  className?: string;
  variant?: StepperFormVariant;
  steps: StepperFormStep[];
  success?: StepperFormSuccess;
  labels?: Partial<StepperFormLabels>;
  /** Primary label on the last step before success (e.g. "Create workspace"). */
  finishLabel?: string;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  /** Fires when the success screen resets to step one (e.g. "Start over"). */
  onReset?: () => void;
};

function StepperRail({
  steps,
  activeIndex,
  complete,
}: {
  steps: StepperFormStep[];
  activeIndex: number;
  complete: boolean;
}) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-3 text-caption">
      {steps.map((step, index) => {
        const done = complete || index < activeIndex;
        const active = !complete && index === activeIndex;
        return (
          <li
            key={step.id}
            className={cx(
              "inline-flex items-center gap-1 whitespace-nowrap",
              done && "text-ink-2",
              active && "font-semibold text-ink",
              !done && !active && "text-ink-3",
            )}
            aria-current={active ? "step" : undefined}
          >
            {done ? (
              <TickCircleFilled className="size-3.5 shrink-0 text-ink-2" aria-hidden />
            ) : active ? (
              <span className="tabular-nums">{index + 1}.</span>
            ) : (
              <span className="tabular-nums">{index + 1}.</span>
            )}
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StepperPanel({
  step,
  direction,
  reduced,
  actions,
}: {
  step: StepperFormStep;
  direction: number;
  reduced: boolean;
  actions: StepperFormActions;
}) {
  const enterX = direction >= 0 ? PANEL_OFFSET : -PANEL_OFFSET;
  const exitX = direction >= 0 ? -PANEL_OFFSET : PANEL_OFFSET;

  return (
    <motion.div
      key={step.id}
      className="flex min-h-0 flex-1 flex-col"
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: enterX }}
      animate={
        reduced
          ? { opacity: 1, x: 0 }
          : { opacity: 1, x: 0, transition: PANEL_ENTER }
      }
      exit={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, x: exitX, transition: PANEL_EXIT }
      }
    >
      <header className="mb-4">
        <h2 className="text-headline-medium text-balance text-ink">{step.title}</h2>
        {step.description ? (
          <p className="mt-1 text-body-regular text-pretty text-ink-2">{step.description}</p>
        ) : null}
      </header>
      <div className="min-h-0 flex-1">
        {typeof step.content === "function" ? step.content(actions) : step.content}
      </div>
    </motion.div>
  );
}

function StepperSuccessPanel({
  success,
  reduced,
}: {
  success: StepperFormSuccess;
  reduced: boolean;
}) {
  return (
    <motion.div
      key="success"
      className="flex flex-1 flex-col items-center justify-center px-2 py-10 text-center"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
      animate={
        reduced
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 1, y: 0, scale: 1, transition: SUCCESS_ENTER }
      }
      exit={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, y: -4, scale: 0.99, transition: SUCCESS_EXIT }
      }
    >
      <span
        className="mb-4 flex size-12 items-center justify-center rounded-full bg-ink text-canvas"
        aria-hidden
      >
        <TickCircleFilled className="size-6" />
      </span>
      <h2 className="text-headline-medium text-balance text-ink">{success.title}</h2>
      {success.description ? (
        <p className="mt-2 max-w-[36ch] text-body-regular text-pretty text-ink-2">{success.description}</p>
      ) : null}
    </motion.div>
  );
}

export function StepperForm({
  className,
  variant = "standalone",
  steps,
  success,
  labels: labelsProp,
  finishLabel,
  onStepChange,
  onComplete,
  onReset,
}: StepperFormProps) {
  const labels = { ...defaultStepperFormLabels, ...labelsProp };
  const reduced = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [complete, setComplete] = useState(false);

  const activeStep = steps[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === steps.length - 1;

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    onStepChange?.(index);
  };

  const handleBack = () => {
    if (isFirst || complete) return;
    goTo(activeIndex - 1);
  };

  const handleContinue = () => {
    if (complete) return;
    if (isLast) {
      setDirection(1);
      setComplete(true);
      onComplete?.();
      return;
    }
    goTo(activeIndex + 1);
  };

  const handleReset = () => {
    setDirection(-1);
    setComplete(false);
    setActiveIndex(0);
    onStepChange?.(0);
    onReset?.();
  };

  const stepActions: StepperFormActions = { activeIndex, goToStep: goTo };

  const continueLabel = complete
    ? undefined
    : isLast
      ? (finishLabel ?? activeStep?.continueLabel ?? labels.continue)
      : (activeStep?.continueLabel ?? labels.continue);

  return (
    <section
      className={cx(
        "@container/stepper flex w-full max-w-[520px] flex-col overflow-hidden",
        variant === "standalone"
          ? "rounded-card border border-line bg-canvas shadow-card"
          : "rounded-panel border border-line bg-canvas",
        className,
      )}
      aria-label="Multi-step form"
    >
      <div className="shrink-0 bg-canvas">
        <StepperRail steps={steps} activeIndex={activeIndex} complete={complete} />
      </div>

      {/* Hairline inset (~6px) between the tray edge and the inner card */}
      <div className="flex min-h-[320px] flex-1 flex-col px-1.5 pb-1.5 pt-1">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-panel border border-line-soft bg-surface shadow-hairline">
        <div
          className={cx(
            "relative grid min-h-[12rem] flex-1 px-5 pt-5 pb-4 @min-[400px]/stepper:px-6",
            "[&>*]:col-start-1 [&>*]:row-start-1 [&>*]:min-w-0",
          )}
        >
          <AnimatePresence initial={false}>
            {complete && success ? (
              <StepperSuccessPanel key="success" success={success} reduced={reduced} />
            ) : activeStep ? (
              <StepperPanel
                key={activeStep.id}
                step={activeStep}
                direction={direction}
                reduced={reduced}
                actions={stepActions}
              />
            ) : null}
          </AnimatePresence>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line-soft px-5 pb-5 pt-3 @min-[400px]/stepper:px-6">
          {complete && success ? (
            <span className="flex-1" />
          ) : (
            <LinkButton
              type="button"
              variant="secondary"
              size="small"
              leadingIcon={ChevronLeft}
              disabled={isFirst}
              onClick={handleBack}
            >
              {labels.back}
            </LinkButton>
          )}
          {complete && success ? (
            <Button type="button" variant="secondary" size="small" onClick={handleReset}>
              {success.resetLabel ?? "Start over"}
            </Button>
          ) : (
            <Button type="button" variant="primary" size="small" className="min-w-[7.5rem]" onClick={handleContinue}>
              {continueLabel}
            </Button>
          )}
        </footer>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo-only building blocks (copy with the shell or replace with your own) */
/* -------------------------------------------------------------------------- */

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function EmailTagField({
  emails,
  onChange,
  label,
  optionalHint,
  placeholder,
  helper,
}: {
  emails: string[];
  onChange: (next: string[]) => void;
  label: string;
  optionalHint?: string;
  placeholder: string;
  helper: string;
}) {
  const inputId = useId();
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    const next = draft.trim().replace(/,$/, "");
    if (!next) return;
    if (!emails.includes(next)) onChange([...emails, next]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addDraft();
    }
    if (event.key === "Backspace" && draft === "" && emails.length > 0) {
      onChange(emails.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={inputId}>{label}</Label>
        {optionalHint ? <span className="text-caption text-ink-3">{optionalHint}</span> : null}
      </div>
      <div
        className={cx(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-2lg border border-line bg-surface px-2 py-1.5",
          "transition-[box-shadow,border-color] duration-150 ease",
          "focus-within:border-line-strong focus-within:ring-2 focus-within:ring-inset focus-within:ring-line-strong",
        )}
      >
        {emails.map((email) => (
          <span
            key={email}
            className="inline-flex max-w-full items-center gap-0.5 rounded-md bg-hover-2 py-0.5 ps-2 pe-0.5 text-caption text-ink"
          >
            <span className="truncate">{email}</span>
            <CloseButton
              size="xs"
              aria-label={`Remove ${email}`}
              onClick={() => onChange(emails.filter((item) => item !== email))}
            />
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addDraft}
          placeholder={emails.length === 0 ? placeholder : "Add another"}
          className="min-w-[8rem] flex-1 border-0 bg-transparent py-1 text-body-regular text-ink outline-none placeholder:text-ink-3"
          autoComplete="off"
        />
      </div>
      <HintText>{helper}</HintText>
    </div>
  );
}

type PlanOption = {
  id: string;
  title: string;
  price: string;
  description: string;
  badge?: string;
};

function PlanOptionCard({ option }: { option: PlanOption }) {
  return (
    <AriaRadio
      value={option.id}
      className={(state) =>
        cx(
          "relative flex min-h-[9.5rem] flex-col rounded-2lg border px-3 pb-3 pt-8 text-start select-none",
          "transition-[border-color,background-color,box-shadow] duration-150 ease",
          state.isSelected
            ? "border-accent bg-accent-muted shadow-hairline"
            : "border-line bg-surface",
          state.isHovered && !state.isDisabled && !state.isSelected && "bg-hover",
          state.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )
      }
    >
      {(state) => (
        <>
          {option.badge ? (
            <Chip variant="caption" color="soft" className="absolute start-1/2 top-2 -translate-x-1/2">
              {option.badge}
            </Chip>
          ) : null}
          <RadioDot
            size="md"
            selected={state.isSelected}
            focusVisible={state.isFocusVisible}
            className="absolute end-3 top-3"
          />
          <span className="text-body-medium text-ink">{option.title}</span>
          <span className="mt-0.5 text-body-regular text-ink-2">{option.price}</span>
          <p className="mt-2 text-caption text-pretty text-ink-2">{option.description}</p>
        </>
      )}
    </AriaRadio>
  );
}

const DEMO_PLANS: PlanOption[] = [
  {
    id: "starter",
    title: "Starter",
    price: "Free",
    description: "One workspace and 10k agent steps each month for solo builds.",
  },
  {
    id: "studio",
    title: "Studio",
    price: "$89 / seat",
    description: "Shared projects, review gates, and priority model routing.",
    badge: "Popular",
  },
  {
    id: "scale",
    title: "Scale",
    price: "$149 / seat",
    description: "SSO, audit logs, and dedicated support for larger teams.",
  },
];

export type StepperFormWorkspaceDemoProps = {
  className?: string;
  variant?: StepperFormVariant;
};

/**
 * Interactive catalog demo: workspace onboarding in four steps plus success.
 * Replace the step bodies or pass a custom `steps` array to `StepperForm` for
 * your own flow.
 */
export function StepperFormWorkspaceDemo({ className, variant = "standalone" }: StepperFormWorkspaceDemoProps) {
  const [workspaceName, setWorkspaceName] = useState("Peach Studio");
  const [slug, setSlug] = useState("peach-studio");
  const [slugTouched, setSlugTouched] = useState(false);
  const [emails, setEmails] = useState<string[]>(["maya@example.com", "devon@example.com"]);
  const [plan, setPlan] = useState("studio");
  const [resetSeed, setResetSeed] = useState(0);

  const displaySlug = slugTouched ? slug : slugify(workspaceName) || "your-workspace";
  const planMeta = DEMO_PLANS.find((item) => item.id === plan) ?? DEMO_PLANS[1];

  const steps: StepperFormStep[] = [
    {
      id: "workspace",
      label: "Workspace",
      title: "Name your workspace",
      description: "This is where your team keeps prompts, runs, and files.",
      content: (
        <div className="flex flex-col gap-4">
          <Input
            label="Workspace name"
            value={workspaceName}
            onChange={(value) => {
              setWorkspaceName(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
            placeholder="Peach Studio"
          />
          <Input
            label="Workspace URL"
            value={slugTouched ? slug : displaySlug}
            onChange={(value) => {
              setSlugTouched(true);
              setSlug(value);
            }}
            leadingAddon={
              <span className="shrink-0 ps-2 text-body-regular text-ink-3">peach.app/</span>
            }
            hint="Use lowercase letters, numbers, and dashes."
          />
        </div>
      ),
    },
    {
      id: "team",
      label: "Team",
      title: "Invite teammates",
      description: "Add emails now or skip and invite from settings later.",
      content: (
        <EmailTagField
          label="Email addresses"
          optionalHint="Optional"
          emails={emails}
          onChange={setEmails}
          placeholder="name@example.com"
          helper="Press Enter or comma to add an address."
        />
      ),
    },
    {
      id: "plan",
      label: "Plan",
      title: "Choose a plan",
      description: "Change or cancel any time in billing settings.",
      content: (
        <RadioGroup
          value={plan}
          onChange={setPlan}
          aria-label="Workspace plan"
          className="grid grid-cols-1 gap-2 @min-[28rem]/stepper:grid-cols-3"
        >
          {DEMO_PLANS.map((option) => (
            <PlanOptionCard key={option.id} option={option} />
          ))}
        </RadioGroup>
      ),
    },
    {
      id: "review",
      label: "Review",
      title: "Review and create",
      description: "You can change any of this later in settings.",
      content: ({ goToStep }) => (
        <ReviewSummary
          workspaceName={workspaceName}
          slug={displaySlug}
          emails={emails}
          planTitle={planMeta.title}
          planPrice={planMeta.price}
          onEditWorkspace={() => goToStep(0)}
          onEditTeam={() => goToStep(1)}
          onEditPlan={() => goToStep(2)}
        />
      ),
    },
  ];

  return (
    <StepperForm
      key={resetSeed}
      className={className}
      variant={variant}
      steps={steps}
      finishLabel="Create workspace"
      success={{
        title: `${workspaceName.trim() || "Your workspace"} is ready`,
        description:
          emails.length > 0
            ? `Invites are on the way to ${emails.length} ${emails.length === 1 ? "teammate" : "teammates"}. Your ${planMeta.title} trial starts today.`
            : `Your ${planMeta.title} trial starts today. Invite teammates any time from settings.`,
        resetLabel: "Start over",
      }}
      onReset={() => {
        setWorkspaceName("Peach Studio");
        setSlug("peach-studio");
        setSlugTouched(false);
        setEmails(["maya@example.com", "devon@example.com"]);
        setPlan("studio");
        setResetSeed((seed) => seed + 1);
      }}
    />
  );
}

function ReviewSummary({
  workspaceName,
  slug,
  emails,
  planTitle,
  planPrice,
  onEditWorkspace,
  onEditTeam,
  onEditPlan,
}: {
  workspaceName: string;
  slug: string;
  emails: string[];
  planTitle: string;
  planPrice: string;
  onEditWorkspace: () => void;
  onEditTeam: () => void;
  onEditPlan: () => void;
}) {
  const inviteLine =
    emails.length === 0
      ? "No invites yet"
      : emails.length === 1
        ? "1 invite"
        : `${emails.length} invites`;

  return (
    <div className="overflow-hidden rounded-2lg border border-line">
      <ReviewRow
        label="Workspace"
        primary={workspaceName.trim() || "Untitled workspace"}
        secondary={`peach.app/${slug || "your-workspace"}`}
        onEdit={onEditWorkspace}
      />
      <ReviewRow
        label="Teammates"
        primary={inviteLine}
        secondary={emails.length > 0 ? emails.join(", ") : "Invite from settings later"}
        onEdit={onEditTeam}
      />
      <ReviewRow
        label="Plan"
        primary={`${planTitle} · ${planPrice}`}
        onEdit={onEditPlan}
      />
    </div>
  );
}

function ReviewRow({
  label,
  primary,
  secondary,
  onEdit,
}: {
  label: string;
  primary: string;
  secondary?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-line-soft px-3 py-3 last:border-b-0 @min-[400px]/stepper:items-center">
      <span className="w-20 shrink-0 pt-0.5 text-caption text-ink-3 @min-[400px]/stepper:pt-0">{label}</span>
      <div className="min-w-0 flex-1">
        <p className="text-body-medium text-ink">{primary}</p>
        {secondary ? <p className="mt-0.5 truncate text-caption text-ink-2">{secondary}</p> : null}
      </div>
      <LinkButton type="button" variant="secondary" size="xs" onClick={onEdit}>
        Edit
      </LinkButton>
    </div>
  );
}
