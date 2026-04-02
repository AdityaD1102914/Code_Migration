// Input type: flat list of files
export interface ProjectFile {
  name: string; // e.g. "src/app/store.ts"
  content: string;
  error?: string;

}

// Virtual node for rendering (not stored in state)
export type VirtualNode =
  | { type: "file"; name: string; path: string; content: string }
  | {
      type: "folder";
      name: string;
      path: string;
      children: Record<string, VirtualNode>;
    };

export interface TreeNodeProps {
  node: VirtualNode;
  level: number;
  onSelect: (path: string, content?: string) => void;
  selectedPath: string;
  onToggle?: () => void;
}

export interface FileExplorerProps {
  files: ProjectFile[];
}
