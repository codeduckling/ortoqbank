/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bookmark from "../bookmark.js";
import type * as customQuizzes from "../customQuizzes.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as presetQuizzes from "../presetQuizzes.js";
import type * as questions from "../questions.js";
import type * as quiz from "../quiz.js";
import type * as quizSessions from "../quizSessions.js";
import type * as subthemes from "../subthemes.js";
import type * as tags from "../tags.js";
import type * as themes from "../themes.js";
import type * as users from "../users.js";
import type * as userStats from "../userStats.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bookmark: typeof bookmark;
  customQuizzes: typeof customQuizzes;
  groups: typeof groups;
  http: typeof http;
  presetQuizzes: typeof presetQuizzes;
  questions: typeof questions;
  quiz: typeof quiz;
  quizSessions: typeof quizSessions;
  subthemes: typeof subthemes;
  tags: typeof tags;
  themes: typeof themes;
  users: typeof users;
  userStats: typeof userStats;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
