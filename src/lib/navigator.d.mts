import type { KnowledgePassage } from "./ask-types";
export interface NavigationAction { id: string; question: string; passages: string[] }
export interface Topic extends NavigationAction { label: string; icon: string }
export interface Match { passage: KnowledgePassage; score: number }
export const TOPICS: Topic[];
export const FOLLOWUPS: Record<string, NavigationAction[]>;
export function sourceKey(id: string): string;
export function sourceTemplateId(key: string): string;
export function followupsFor(key: string): NavigationAction[];
export function selectPassages(selection: NavigationAction, passages: KnowledgePassage[]): Match[];
export function groupMatches(matches: Match[]): { key: string; matches: Match[] }[];
export function validateNavigator(passages: KnowledgePassage[], sources: { key: string }[]): void;
