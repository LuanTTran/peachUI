"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Select, SelectItem } from "@/components/atoms/select";
import { Switch } from "@/components/atoms/switch";
import { PlanArtHairline } from "@/components/blocks/settings/plan-art-hairline";
import {
  SettingsCard,
  SettingsRow,
  SettingsSectionLabel,
} from "@/components/blocks/settings/settings-rows";

/**
 * Figma source: "Settings/General" (node 4079:13037), the right
 * pane of the settings modal. Taller than the 614px modal, so the pane
 * scrolls within the shell.
 *
 * Sections, 24px apart:
 *   plan          "Current plan" chip, Ultra $149/mo, upgrade button, and the
 *                 artwork bleeding off the right edge under a radial fade
 *                 into the card background.
 *   limits        single row with a "Manage limits" button.
 *   pull requests two select rows (Review provider / PR destination).
 *   notifications four toggle rows, only "Critical requests" on by default.
 */

/** Compact white select trigger (h 32, radius/lg) per the Figma rows. */
const SELECT_TRIGGER = "h-8 w-auto gap-1 rounded-lg px-2 py-1.5";

export function SettingsGeneral() {
  const [toggles, setToggles] = useState({
    critical: true,
    system: false,
    sound: false,
    dispatch: false,
  });

  const setToggle = (key: keyof typeof toggles) => (value: boolean) =>
    setToggles((t) => ({ ...t, [key]: value }));

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Current plan */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-canvas">
        {/* Artwork bleeding off the right edge, fading into the card bg (Hairline plan-tiers). */}
        <div aria-hidden className="pointer-events-none absolute -top-[11px] start-[328px] size-[277px]">
          <PlanArtHairline className="size-full" intensity={0.55} />
          {/* Fades into the card, whatever colour that is: the stops mix the
              card's own token rather than a hardcoded #f7f7f7, which stayed
              white and haloed the artwork in dark mode. Mixing toward 0% of
              the token instead of `transparent` also avoids the grey fringe
              sRGB interpolation gives when a colour fades to rgba(0,0,0,0). */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(closest-side at center,
                color-mix(in srgb, var(--canvas) 0%, transparent) 13%,
                color-mix(in srgb, var(--canvas) 13%, transparent) 37%,
                color-mix(in srgb, var(--canvas) 85%, transparent) 86%,
                var(--canvas) 100%)`,
            }}
          />
        </div>

        <div className="relative flex flex-col gap-2.5 py-3 pe-2.5 ps-3">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center rounded-md bg-hover-2 px-1.5 py-0.5 text-body-2-medium text-ink-2">
              Your plan
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-headline-medium text-ink">Studio · $89/mo</p>
              <p className="text-body-2-regular text-ink-2">
                Includes 5 seats and 200k agent steps each month.
              </p>
            </div>
          </div>
          <Button variant="primary" size="small" className="w-fit shrink-0">
            Compare plans
          </Button>
        </div>
      </div>

      {/* Limits */}
      <SettingsCard>
        <SettingsRow label="Usage caps" description="You have used 62% of this month’s agent steps.">
          <Button variant="secondary" size="small" className="shrink-0">
            View usage
          </Button>
        </SettingsRow>
      </SettingsCard>

      {/* Pull Requests */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel>Code review</SettingsSectionLabel>
        <SettingsCard>
          <SettingsRow
            label="Review host"
            description="Where automated review comments are posted"
          >
            <Select
              aria-label="Review host"
              defaultSelectedKey="github"
              triggerClassName={SELECT_TRIGGER}
            >
              <SelectItem id="github">GitHub</SelectItem>
              <SelectItem id="gitlab">GitLab</SelectItem>
              <SelectItem id="bitbucket">Bitbucket</SelectItem>
            </Select>
          </SettingsRow>
          <SettingsRow
            label="Open reviews in"
            description="Choose where diff links open when you tap a notification"
          >
            <Select
              aria-label="Open reviews in"
              defaultSelectedKey="inside"
              triggerClassName={SELECT_TRIGGER}
            >
              <SelectItem id="inside">This app</SelectItem>
              <SelectItem id="browser">Default browser</SelectItem>
            </Select>
          </SettingsRow>
        </SettingsCard>
      </div>

      {/* Notifications */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel>Notifications</SettingsSectionLabel>
        <SettingsCard>
          <SettingsRow
            label="Pause before destructive actions"
            description="Ask for confirmation before deletes, merges, or sends"
          >
            <Switch
              aria-label="Pause before destructive actions"
              isSelected={toggles.critical}
              onChange={setToggle("critical")}
            />
          </SettingsRow>
          <SettingsRow
            label="Task finished alerts"
            description="Show a banner when a background job completes"
          >
            <Switch
              aria-label="Task finished alerts"
              isSelected={toggles.system}
              onChange={setToggle("system")}
            />
          </SettingsRow>
          <SettingsRow
            label="Play completion sound"
            description="Short tone when a run succeeds"
          >
            <Switch
              aria-label="Play completion sound"
              isSelected={toggles.sound}
              onChange={setToggle("sound")}
            />
          </SettingsRow>
          <SettingsRow
            label="Mobile push"
            description="Send pushes for mentions and failed deploys"
          >
            <Switch
              aria-label="Mobile push"
              isSelected={toggles.dispatch}
              onChange={setToggle("dispatch")}
            />
          </SettingsRow>
        </SettingsCard>
      </div>
    </div>
  );
}
