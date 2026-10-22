"use client";

import { forwardRef } from "react";
import type { IconComponent, IconProps } from "reicon-react/createIcon";
import { ArrowDownCircle, ArrowUpCircle, Basket, Bell, Body, Coins, HeartPulse, InfoCircle, MinusCircle, MoneyChange, Moon, Pill, Plus, Setting4, ShieldStar, Sidebar, TestTube, TickCircle, Users, Warning } from "reicon-react";

function filledIcon(Icon: IconComponent, displayName: string) {
  const Filled = forwardRef<SVGSVGElement, IconProps>((props, ref) => <Icon ref={ref} weight="Filled" {...props} />);
  Filled.displayName = displayName;
  return Filled;
}

export const ArrowDownCircleFilled = filledIcon(ArrowDownCircle, "ArrowDownCircleFilled");
export const ArrowUpCircleFilled = filledIcon(ArrowUpCircle, "ArrowUpCircleFilled");
export const BasketFilled = filledIcon(Basket, "BasketFilled");
export const BellFilled = filledIcon(Bell, "BellFilled");
export const BodyFilled = filledIcon(Body, "BodyFilled");
export const CoinsFilled = filledIcon(Coins, "CoinsFilled");
export const HeartPulseFilled = filledIcon(HeartPulse, "HeartPulseFilled");
export const InfoCircleFilled = filledIcon(InfoCircle, "InfoCircleFilled");
export const MinusCircleFilled = filledIcon(MinusCircle, "MinusCircleFilled");
export const MoneyChangeFilled = filledIcon(MoneyChange, "MoneyChangeFilled");
export const MoonFilled = filledIcon(Moon, "MoonFilled");
export const PillFilled = filledIcon(Pill, "PillFilled");
export const PlusFilled = filledIcon(Plus, "PlusFilled");
export const Setting4Filled = filledIcon(Setting4, "Setting4Filled");
export const ShieldStarFilled = filledIcon(ShieldStar, "ShieldStarFilled");
export const SidebarFilled = filledIcon(Sidebar, "SidebarFilled");
export const TestTubeFilled = filledIcon(TestTube, "TestTubeFilled");
export const TickCircleFilled = filledIcon(TickCircle, "TickCircleFilled");
export const UsersFilled = filledIcon(Users, "UsersFilled");
export const WarningFilled = filledIcon(Warning, "WarningFilled");
