import { describe, expect, it } from 'vitest';
import type { Task } from '@/services/beeyieldService';
import {
    buildAuditNotes,
    getUrgency,
    isInspectionTask,
    parseAuditMetrics,
} from './YardOperations';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    title: 'Inspection required',
    description: 'Run a colony strength audit',
    status: 'pending',
    priority: 'Medium',
    type: 'Inspection',
    category: 'Inspection',
    is_completed: false,
    ...overrides,
});

describe('YardOperations helpers', () => {
    it('round-trips audit notes for saved inspection metrics', () => {
        const notes = buildAuditNotes(7, 5, 'Run a colony strength audit');

        expect(notes).toContain('YARD_OPS_AUDIT');
        expect(parseAuditMetrics(notes)).toEqual({ fob: 7, fobr: 5 });
    });

    it('treats inspection tasks as persistable yard operations items', () => {
        expect(isInspectionTask(makeTask({ hive_id: 'hive-1' }))).toBe(true);
        expect(isInspectionTask(makeTask({ hive_id: 'hive-1', category: 'General', type: 'Other' }))).toBe(false);
        expect(isInspectionTask(makeTask({ hive_id: '' }))).toBe(false);
    });

    it('escalates urgent inspection wording to critical', () => {
        expect(getUrgency(makeTask({ description: 'Critical colony collapse risk', priority: 'Low' }))).toBe('critical');
        expect(getUrgency(makeTask({ priority: 'High' }))).toBe('high');
        expect(getUrgency(makeTask({ priority: 'Low' }))).toBe('low');
    });
});
