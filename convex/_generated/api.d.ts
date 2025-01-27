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
import type * as constants from "../constants.js";
import type * as exams from "../exams.js";
import type * as http from "../http.js";
import type * as model_exams from "../model/exams.js";
import type * as model_questions from "../model/questions.js";
import type * as model_users from "../model/users.js";
import type * as questions from "../questions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  constants: typeof constants;
  exams: typeof exams;
  http: typeof http;
  "model/exams": typeof model_exams;
  "model/questions": typeof model_questions;
  "model/users": typeof model_users;
  questions: typeof questions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
