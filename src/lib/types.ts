export interface DiagramNode {
  title: string;
  category: string;
  badge?: string;
  summary: string;
  details: string;
  searchTerms?: string[];
  architectureRole?: string;
}

export type DiagramNodesMap = Record<string, DiagramNode>;

export type ItemType = "diagram" | "doc" | "guide";

export interface HubItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  subfolder?: string;
  type: ItemType;
  description?: string;
  url: string;
  meta?: {
    nodesCount?: number;
    wordCount?: number;
    readingTime?: string;
  };
}

export interface SubfolderGroup {
  name: string;
  slug: string;
  items: HubItem[];
}

export interface CategoryGroup {
  name: string;
  slug: string;
  totalCount: number;
  directItems: HubItem[];
  subfolders: SubfolderGroup[];
}
