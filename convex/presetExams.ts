/* eslint-disable unicorn/filename-case */
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    themeId: v.id('themes'),
    subthemeId: v.optional(v.id('subthemes')),
    groupId: v.optional(v.id('groups')),
    questions: v.array(v.id('questions')),
    isPublic: v.boolean(),
  },
  handler: async (context, arguments_) => {
    return await context.db.insert('presetExams', {
      name: arguments_.name,
      description: arguments_.description,
      themeId: arguments_.themeId,
      subthemeId: arguments_.subthemeId,
      groupId: arguments_.groupId,
      questions: arguments_.questions,
      isPublic: arguments_.isPublic,
    });
  },
});

export const list = query({
  handler: async context => {
    return await context.db.query('presetExams').collect();
  },
});

export const addQuestion = mutation({
  args: {
    examId: v.id('presetExams'),
    questionId: v.id('questions'),
  },
  handler: async (context, arguments_) => {
    const exam = await context.db.get(arguments_.examId);
    if (!exam) throw new Error('Exam not found');

    const updatedQuestions = [...exam.questions, arguments_.questionId];
    await context.db.patch(arguments_.examId, { questions: updatedQuestions });
  },
});

export const removeQuestion = mutation({
  args: {
    examId: v.id('presetExams'),
    questionId: v.id('questions'),
  },
  handler: async (context, arguments_) => {
    const exam = await context.db.get(arguments_.examId);
    if (!exam) throw new Error('Exam not found');

    const updatedQuestions = exam.questions.filter(
      id => id !== arguments_.questionId,
    );
    await context.db.patch(arguments_.examId, { questions: updatedQuestions });
  },
});

export const updateQuestions = mutation({
  args: {
    examId: v.id('presetExams'),
    questions: v.array(v.id('questions')),
  },
  handler: async (context, arguments_) => {
    await context.db.patch(arguments_.examId, {
      questions: arguments_.questions,
    });
  },
});

export const updateExam = mutation({
  args: {
    examId: v.id('presetExams'),
    name: v.string(),
    description: v.string(),
    questions: v.array(v.id('questions')),
  },
  handler: async (context, arguments_) => {
    await context.db.patch(arguments_.examId, {
      name: arguments_.name,
      description: arguments_.description,
      questions: arguments_.questions,
    });
  },
});

export const deleteExam = mutation({
  args: {
    examId: v.id('presetExams'),
  },
  handler: async (context, arguments_) => {
    await context.db.delete(arguments_.examId);
  },
});

export const get = query({
  args: { id: v.id('presetExams') },
  handler: async (context, arguments_) => {
    return await context.db.get(arguments_.id);
  },
});

export const getWithQuestions = query({
  args: { id: v.id('presetExams') },
  handler: async (context, arguments_) => {
    const exam = await context.db.get(arguments_.id);
    if (!exam) return;

    const questions = await Promise.all(
      exam.questions.map(async id => await context.db.get(id)),
    );
    return { ...exam, questions };
  },
});
