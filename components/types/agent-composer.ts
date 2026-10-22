export type AgentComposerCommand = {
  key: string;
  name: string;
  desc: string;
};

export type AgentComposerModel = {
  key: string;
  name: string;
  tag: string;
};

export type AgentComposerSource = {
  key: string;
  name: string;
  desc: string;
  glyph?: string;
  brand?: string;
  attach?: boolean;
  connect?: boolean;
};

export type AgentComposerCatalog = {
  sources: AgentComposerSource[];
  commands: AgentComposerCommand[];
  models: AgentComposerModel[];
  attachFileNames: string[];
  dictationSample: string;
};

export type AgentComposerMenuRow = {
  key: string;
  name: string;
  desc: string;
  person?: boolean;
};

export type AgentComposerPerson = {
  id: string;
  name: string;
  subtitle?: string | null;
};

/** @deprecated Use AgentComposerPerson */
export type PromptBarPerson = AgentComposerPerson;
