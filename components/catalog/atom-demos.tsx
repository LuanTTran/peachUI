"use client";

import { useState } from "react";
import { parseDate } from "@internationalized/date";
import {
  ChevronRight,
  Envelope,
  FileText,
  Folder,
  Home,
  Logout,
  Plus,
  Search,
  Setting,
  Trash,
  User,
} from "reicon-react";
import { Announcement } from "@/components/atoms/announcement";
import { StreamText } from "@/components/atoms/stream-text";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { Button } from "@/components/atoms/button";
import { ButtonGroup, ButtonGroupItem } from "@/components/atoms/button-group";
import { Carousel, CarouselItem } from "@/components/atoms/carousel";
import { Checkbox } from "@/components/atoms/checkbox";
import { CheckboxCard } from "@/components/atoms/checkbox-card";
import { Chip } from "@/components/atoms/chip";
import { CloseButton } from "@/components/atoms/close-button";
import { DatePicker } from "@/components/atoms/date-picker";
import { DateRangePicker } from "@/components/atoms/date-range-picker";
import { Divider } from "@/components/atoms/divider";
import {
  Dropdown,
  DropdownDivider,
  DropdownGroup,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/atoms/dropdown";
import { FileUpload } from "@/components/atoms/file-upload";
import { IconButton } from "@/components/atoms/icon-button";
import { Input } from "@/components/atoms/input";
import { InputOtp } from "@/components/atoms/input-otp";
import { Kbd } from "@/components/atoms/kbd";
import { LinkButton } from "@/components/atoms/link-button";
import { MeetingScheduler } from "@/components/atoms/meeting-scheduler";
import { Notification } from "@/components/atoms/notification";
import { Pagination } from "@/components/atoms/pagination";
import { PillTab, PillTabList } from "@/components/atoms/pill-tab";
import { Radio, RadioGroup } from "@/components/atoms/radio";
import { RadioCard } from "@/components/atoms/radio-card";
import { SegmentedControl, SegmentedControlItem } from "@/components/atoms/segmented-control";
import { Select, SelectItem } from "@/components/atoms/select";
import { Slider, RangeSlider } from "@/components/atoms/slider";
import { SocialButton } from "@/components/atoms/social-button";
import { StatusDot } from "@/components/atoms/status-dot";
import { Switch } from "@/components/atoms/switch";
import { SwitchCard } from "@/components/atoms/switch-card";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@/components/atoms/table";
import { Tab, TabList, Tabs } from "@/components/atoms/tabs";
import { Textarea } from "@/components/atoms/textarea";
import { Tooltip, TooltipTrigger } from "@/components/atoms/tooltip";
import { TreeView, TreeViewItem } from "@/components/atoms/tree-view";

function Stack({ children, className = "items-start" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-3 ${className}`}>{children}</div>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function AnnouncementDemo() {
  return (
    <div className="max-w-[260px]">
      <Announcement
        title="Two new components"
        description="Carousel and Input OTP are ready to copy into your app."
        actionLabel="See what's new"
        dismissible
      />
    </div>
  );
}

export function AvatarDemo() {
  return (
    <Row>
      <Avatar size="lg" color="neutral" art="orbit" alt="Rina Okonkwo" />
      <Avatar size="lg" color="blue" art="ridge" alt="Priya Nandakumar" />
      <Avatar size="lg" color="neutral" art="stack" alt="Elias Mercer" />
      <Avatar size="lg" color="blue" art="loop" alt="Imani Sato" />
      <Avatar size="lg" color="pink" art="wave" alt="Sable Osei" />
    </Row>
  );
}

export function BadgeDemo() {
  return (
    <Row>
      <Badge color="primary">New</Badge>
      <Badge>12</Badge>
      <span className="inline-flex items-center gap-1 text-body-regular text-ink-2">
        Search <Kbd>⌘K</Kbd>
      </span>
    </Row>
  );
}

export function BreadcrumbDemo() {
  return (
    <Stack>
      <Breadcrumb>
        <BreadcrumbItem href="#">Home</BreadcrumbItem>
        <BreadcrumbItem href="#">Team</BreadcrumbItem>
        <BreadcrumbItem current>Billing</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem href="#" icon={Home}>Home</BreadcrumbItem>
        <BreadcrumbItem href="#" icon={Setting}>Settings</BreadcrumbItem>
        <BreadcrumbItem current icon={User}>Profile</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb>
        <BreadcrumbItem href="#" icon={Folder}>Files</BreadcrumbItem>
        <BreadcrumbItem href="#" icon={Folder}>Design</BreadcrumbItem>
        <BreadcrumbItem current icon={FileText}>Brief</BreadcrumbItem>
      </Breadcrumb>
    </Stack>
  );
}

export function ButtonDemo() {
  return (
    <Stack>
      <Row>
        <Button leadingIcon={Plus}>New project</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">Preview</Button>
        <Button variant="danger" leadingIcon={Trash}>Delete project</Button>
      </Row>
      <Row>
        <Button size="small">Save draft</Button>
        <Button size="small" variant="secondary">Export</Button>
        <Button size="small" disabled>Publish</Button>
      </Row>
    </Stack>
  );
}

export function ButtonGroupDemo() {
  return (
    <ButtonGroup aria-label="Range">
      <ButtonGroupItem>Day</ButtonGroupItem>
      <ButtonGroupItem selected>Week</ButtonGroupItem>
      <ButtonGroupItem>Month</ButtonGroupItem>
    </ButtonGroup>
  );
}

const CAROUSEL_SLIDES = [
  { name: "Accent", bg: "bg-accent-muted", text: "text-accent-ink", token: "bg-accent-muted" },
  { name: "Schedule", bg: "bg-schedule-muted", text: "text-schedule", token: "bg-schedule-muted" },
  { name: "Green", bg: "bg-green-muted", text: "text-green", token: "bg-green-muted" },
  { name: "Warning", bg: "bg-warning-muted", text: "text-warning", token: "bg-warning-muted" },
  { name: "Violet", bg: "bg-violet-muted", text: "text-violet", token: "bg-violet-muted" },
];

export function CarouselDemo() {
  return (
    <div className="w-full max-w-[320px]">
      <Carousel aria-label="Gallery">
        {CAROUSEL_SLIDES.map((slide) => (
          <CarouselItem key={slide.token}>
            <div
              className={`flex h-[160px] w-full flex-col items-center justify-center gap-1 rounded-2lg media-outline ${slide.bg}`}
            >
              <span className={`text-headline-medium ${slide.text}`}>{slide.name}</span>
              <span className={`text-caption-1-medium ${slide.text}`}>{slide.token}</span>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
}

export function CheckboxDemo() {
  return (
    <Stack>
      <Checkbox defaultSelected>Email notifications</Checkbox>
      <Checkbox>Product updates</Checkbox>
      <Checkbox isIndeterminate>Select all</Checkbox>
    </Stack>
  );
}

export function CheckboxCardDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <CheckboxCard defaultSelected title="Weekly digest" description="A summary of activity every Monday." />
      <CheckboxCard title="Mentions" description="When someone mentions you in a thread." />
    </div>
  );
}

export function ChipDemo() {
  return (
    <div className="flex max-w-[280px] flex-wrap items-center gap-1.5">
      <Chip color="lime">Completed</Chip>
      <Chip color="yellow" variant="subtle">Waiting</Chip>
      <Chip color="purple">+14.8%</Chip>
      <Chip color="cyan" variant="caption">Confirmed</Chip>
      <Chip color="rose">Failed</Chip>
      <Chip color="blue" variant="subtle">In review</Chip>
      <Chip color="gray" variant="caption">v2.4.0</Chip>
      <Chip color="neutral">Draft</Chip>
      <Chip color="soft" variant="subtle">Archived</Chip>
    </div>
  );
}

export function CloseButtonDemo() {
  return (
    <Row>
      <CloseButton size="xs" aria-label="Close" />
      <CloseButton size="sm" aria-label="Close" />
      <CloseButton size="md" aria-label="Close" />
    </Row>
  );
}

export function DatePickerDemo() {
  return (
    <Row>
      <DatePicker aria-label="Due date" defaultValue={parseDate("2026-10-14")} />
      <DateRangePicker aria-label="Report range" />
    </Row>
  );
}

export function MeetingSchedulerDemo() {
  return <MeetingScheduler />;
}

export function DividerDemo() {
  return (
    <div className="flex w-full max-w-[260px] flex-col gap-5">
      <Divider />
      <Divider>or</Divider>
    </div>
  );
}

export function DropdownDemo() {
  const [view, setView] = useState("list");
  return (
    <Dropdown>
      <DropdownTrigger className="rounded-2lg border border-line bg-surface px-3 py-1.5 text-body-medium text-ink shadow-xs">
        Options
      </DropdownTrigger>
      <DropdownPopover aria-label="Options">
        <DropdownGroup label="View">
          <DropdownItem selected={view === "list"} onSelect={() => setView("list")}>List</DropdownItem>
          <DropdownItem selected={view === "board"} onSelect={() => setView("board")}>Board</DropdownItem>
        </DropdownGroup>
        <DropdownDivider />
        <DropdownGroup>
          <DropdownItem>
            <Setting className="size-5 text-ink-2" aria-hidden />
            Settings
          </DropdownItem>
          <DropdownItem>
            <Logout className="size-5 text-ink-2" aria-hidden />
            Sign out
          </DropdownItem>
        </DropdownGroup>
      </DropdownPopover>
    </Dropdown>
  );
}

export function FileUploadDemo() {
  return (
    <div className="w-full max-w-[280px]">
      <FileUpload />
    </div>
  );
}

export function IconButtonDemo() {
  return (
    <Row>
      <IconButton icon={Plus} aria-label="Add" />
      <IconButton icon={Search} aria-label="Search" />
      <IconButton icon={Trash} aria-label="Delete" />
    </Row>
  );
}

export function InputDemo() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-4">
      <Input label="Email" placeholder="name@example.com" leadingIcon={Envelope} hint="Used for sign-in and receipts." />
      <Input label="Search" placeholder="Search components" leadingIcon={Search} />
      <Input label="Workspace" defaultValue="peach studio" isInvalid hint="Use only lowercase letters and hyphens." />
    </div>
  );
}

export function InputOtpDemo() {
  const [value, setValue] = useState("2049");
  return <InputOtp value={value} onChange={setValue} aria-label="Verification code" />;
}

export function LinkButtonDemo() {
  return (
    <Stack>
      <LinkButton>Read the docs</LinkButton>
      <LinkButton trailingIcon={ChevronRight}>Browse components</LinkButton>
    </Stack>
  );
}

export function NotificationDemo() {
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-3">
      <Notification
        status="success"
        title="Deployment finished"
        description="docs.peach-ui.dev is live on production."
        timestamp="2m ago"
      />
      <Notification
        status="error"
        title="Build failed"
        description="Fix the type error in button.tsx, then push again."
        timestamp="Just now"
      />
    </div>
  );
}

export function PaginationDemo() {
  const [page, setPage] = useState(3);
  return (
    <div className="w-full max-w-md">
      <Pagination page={page} totalPages={10} onChange={setPage} />
    </div>
  );
}

export function PillTabDemo() {
  const [tab, setTab] = useState("all");
  return (
    <PillTabList aria-label="Filter">
      {["all", "unread", "mentions"].map((id) => (
        <PillTab key={id} isSelected={tab === id} onSelect={() => setTab(id)}>
          {id === "all" ? "All" : id === "unread" ? "Unread" : "Mentions"}
        </PillTab>
      ))}
    </PillTabList>
  );
}

export function RadioDemo() {
  return (
    <RadioGroup defaultValue="weekly" aria-label="Frequency" className="flex flex-col gap-3">
      <Radio value="weekly">Weekly</Radio>
      <Radio value="monthly">Monthly</Radio>
      <Radio value="yearly">Yearly</Radio>
    </RadioGroup>
  );
}

export function RadioCardDemo() {
  return (
    <RadioGroup defaultValue="team" aria-label="Plan" className="flex w-full max-w-sm flex-col gap-2">
      <RadioCard value="solo" title="Solo" description="One seat, unlimited projects." />
      <RadioCard value="team" title="Team" description="Up to 20 seats with shared billing." />
    </RadioGroup>
  );
}

export function SegmentedControlDemo() {
  return (
    <SegmentedControl defaultSelectedKeys={["weekly"]} aria-label="Period">
      <SegmentedControlItem id="weekly">Weekly</SegmentedControlItem>
      <SegmentedControlItem id="monthly">Monthly</SegmentedControlItem>
      <SegmentedControlItem id="yearly">Yearly</SegmentedControlItem>
    </SegmentedControl>
  );
}

export function SelectDemo() {
  return (
    <div className="w-full max-w-[200px]">
      <Select aria-label="Framework" defaultSelectedKey="react">
        <SelectItem id="react">React</SelectItem>
        <SelectItem id="vue">Vue</SelectItem>
        <SelectItem id="svelte">Svelte</SelectItem>
      </Select>
    </div>
  );
}

export function SliderDemo() {
  return (
    <div className="flex w-full max-w-[260px] flex-col gap-8">
      <Slider defaultValue={62} thumbLabel="Volume" />
      <RangeSlider defaultValue={[20, 80]} />
    </div>
  );
}

export function SocialButtonDemo() {
  return (
    <div className="flex w-full max-w-[260px] flex-col gap-2">
      <SocialButton brand="google" appearance="white" fullWidth />
      <SocialButton brand="apple" appearance="black" fullWidth />
      <SocialButton brand="github" appearance="white" fullWidth />
    </div>
  );
}

export function StatusDotDemo() {
  return (
    <Stack>
      <span className="inline-flex items-center gap-2 text-body-regular text-ink"><StatusDot color="green" />Operational</span>
      <span className="inline-flex items-center gap-2 text-body-regular text-ink"><StatusDot color="yellow" />Degraded</span>
      <span className="inline-flex items-center gap-2 text-body-regular text-ink"><StatusDot color="indigo" />Scheduled</span>
    </Stack>
  );
}

export function SwitchDemo() {
  return (
    <Stack>
      <Switch defaultSelected aria-label="Send read receipts" />
      <Switch aria-label="Show previews" />
      <Switch size="lg" defaultSelected aria-label="Sync calendar" />
    </Stack>
  );
}

export function SwitchCardDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <SwitchCard defaultSelected title="Send read receipts" description="Let others see when you've read a message." />
      <SwitchCard title="Show link previews" description="Expand links into cards in conversations." />
    </div>
  );
}

const PEOPLE = [
  { id: "1", name: "Olivia Rhye", role: "Product designer", status: "Active" },
  { id: "2", name: "Phoenix Baker", role: "Engineer", status: "Active" },
  { id: "3", name: "Lana Steiner", role: "Design lead", status: "Invited" },
  { id: "4", name: "Demi Wilkinson", role: "Frontend engineer", status: "Active" },
];

export function TableDemo() {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface">
      <Table aria-label="Team members">
        <TableHeader>
          <TableColumn id="name" isRowHeader>Name</TableColumn>
          <TableColumn id="role">Role</TableColumn>
          <TableColumn id="status">Status</TableColumn>
        </TableHeader>
        <TableBody>
          {PEOPLE.map((person) => (
            <TableRow key={person.id} id={person.id}>
              <TableCell>{person.name}</TableCell>
              <TableCell>{person.role}</TableCell>
              <TableCell>{person.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TabsDemo() {
  return (
    <Tabs defaultSelectedKey="components">
      <TabList aria-label="Sections">
        <Tab id="components" count={48}>Components</Tab>
        <Tab id="blocks" count={6}>Blocks</Tab>
        <Tab id="charts">Charts</Tab>
      </TabList>
    </Tabs>
  );
}

export function TextareaDemo() {
  return (
    <div className="w-full max-w-[300px]">
      <Textarea
        label="Note"
        placeholder="Ship the release notes before Friday"
        autoResize
        rows={2}
        maxRows={5}
        maxLength={120}
        showCount
      />
    </div>
  );
}

export function TooltipDemo() {
  return (
    <Row>
      {(["top", "bottom", "start", "end"] as const).map((placement) => (
        <TooltipTrigger key={placement}>
          <Button variant="secondary" size="small">{placement[0].toUpperCase() + placement.slice(1)}</Button>
          <Tooltip placement={placement}>Copy source</Tooltip>
        </TooltipTrigger>
      ))}
    </Row>
  );
}

export function TreeViewDemo() {
  return (
    <TreeView
      aria-label="Project files"
      defaultExpandedKeys={["src", "components"]}
      defaultSelectedKeys={["components"]}
      className="w-full max-w-sm"
    >
      <TreeViewItem id="src" label="src">
        <TreeViewItem id="components" label="components">
          <TreeViewItem id="button" label="button.tsx" iconClassName="text-accent-700" />
          <TreeViewItem id="input" label="input.tsx" iconClassName="text-accent-700" />
        </TreeViewItem>
        <TreeViewItem id="hooks" label="hooks">
          <TreeViewItem id="use-theme" label="use-theme.ts" iconClassName="text-accent-700" />
        </TreeViewItem>
        <TreeViewItem id="page" label="page.tsx" iconClassName="text-accent-700" />
      </TreeViewItem>
      <TreeViewItem id="public" label="public">
        <TreeViewItem id="logo" label="peach.webp" iconClassName="text-violet" />
      </TreeViewItem>
      <TreeViewItem id="readme" label="README.md" iconClassName="text-chart-1-active" />
      <TreeViewItem id="package" label="package.json" />
    </TreeView>
  );
}

export function StreamTextDemo() {
  return (
    <p className="max-w-md text-body text-ink">
      <StreamText text="The launch meeting settled October 21 as the send date. The reply draft is ready for review." />
    </p>
  );
}
