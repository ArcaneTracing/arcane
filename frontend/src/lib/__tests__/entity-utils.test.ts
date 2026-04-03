import React from 'react';
import { render } from '@testing-library/react';
import {
  getEntityIconColor,
  getEntityBorderColor,
  getEntityIcon,
  getEntityTypeName,
  getPatternMatchTypeLabel,
  matchSpanToEntity,
  findMatchingEntity } from
'../entity-utils';
import { EntityResponse, EntityType, MatchPatternType } from '@/types';

describe('getEntityIconColor', () => {
  it('should return correct color for MODEL entity type', () => {
    expect(getEntityIconColor(EntityType.MODEL)).toBe(
      'text-blue-600 dark:text-blue-400'
    );
  });

  it('should return correct color for TOOL entity type', () => {
    expect(getEntityIconColor(EntityType.TOOL)).toBe(
      'text-orange-600 dark:text-orange-400'
    );
  });

  it('should return correct color for EMBEDDING entity type', () => {
    expect(getEntityIconColor(EntityType.EMBEDDING)).toBe(
      'text-purple-600 dark:text-purple-400'
    );
  });

  it('should return correct color for RETRIEVER entity type', () => {
    expect(getEntityIconColor(EntityType.RETRIEVER)).toBe(
      'text-green-600 dark:text-green-400'
    );
  });

  it('should return correct color for GUARDRAIL entity type', () => {
    expect(getEntityIconColor(EntityType.GUARDRAIL)).toBe(
      'text-red-600 dark:text-red-400'
    );
  });

  it('should return correct color for AGENT entity type', () => {
    expect(getEntityIconColor(EntityType.AGENT)).toBe(
      'text-teal-600 dark:text-teal-400'
    );
  });

  it('should return correct color for EVALUATOR entity type', () => {
    expect(getEntityIconColor(EntityType.EVALUATOR)).toBe(
      'text-green-600 dark:text-green-400'
    );
  });

  it('should return empty string for unknown entity type', () => {
    expect(getEntityIconColor('UNKNOWN' as EntityType)).toBe('');
  });
});

describe('getEntityIcon', () => {
  it('returns element for MODEL', () => {
    const icon = getEntityIcon(EntityType.MODEL);
    const { container } = render(icon);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('returns element for TOOL', () => {
    const icon = getEntityIcon(EntityType.TOOL);
    const { container } = render(icon);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('returns element for EMBEDDING', () => {
    const icon = getEntityIcon(EntityType.EMBEDDING);
    const { container } = render(icon);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('returns element for RETRIEVER', () => {
    const icon = getEntityIcon(EntityType.RETRIEVER);
    const { container } = render(icon);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('returns element for GUARDRAIL', () => {
    const icon = getEntityIcon(EntityType.GUARDRAIL);
    const { container } = render(icon);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('returns element for EVALUATOR', () => {
    const icon = getEntityIcon(EntityType.EVALUATOR);
    const { container } = render(icon);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('returns element for AGENT', () => {
    const icon = getEntityIcon(EntityType.AGENT);
    const { container } = render(icon);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('returns Fragment for unknown type', () => {
    const icon = getEntityIcon('UNKNOWN' as EntityType);
    expect(React.isValidElement(icon)).toBe(true);
    expect(icon.type).toBe(React.Fragment);
    const { container } = render(icon);
    expect(container).toBeInTheDocument();
  });
});

describe('getEntityBorderColor', () => {
  it('should return correct border color for MODEL entity type', () => {
    expect(getEntityBorderColor(EntityType.MODEL)).toBe(
      'border-blue-300 dark:border-blue-700'
    );
  });

  it('should return correct border color for TOOL entity type', () => {
    expect(getEntityBorderColor(EntityType.TOOL)).toBe(
      'border-orange-300 dark:border-orange-700'
    );
  });

  it('should return correct border color for EMBEDDING entity type', () => {
    expect(getEntityBorderColor(EntityType.EMBEDDING)).toBe(
      'border-purple-300 dark:border-purple-700'
    );
  });

  it('should return correct border color for RETRIEVER entity type', () => {
    expect(getEntityBorderColor(EntityType.RETRIEVER)).toBe(
      'border-green-300 dark:border-green-700'
    );
  });

  it('should return correct border color for GUARDRAIL entity type', () => {
    expect(getEntityBorderColor(EntityType.GUARDRAIL)).toBe(
      'border-red-300 dark:border-red-700'
    );
  });

  it('should return correct border color for EVALUATOR entity type', () => {
    expect(getEntityBorderColor(EntityType.EVALUATOR)).toBe(
      'border-green-300 dark:border-green-700'
    );
  });

  it('should return correct border color for AGENT entity type', () => {
    expect(getEntityBorderColor(EntityType.AGENT)).toBe(
      'border-teal-300 dark:border-teal-700'
    );
  });

  it('should return empty string for unknown entity type', () => {
    expect(getEntityBorderColor('UNKNOWN' as EntityType)).toBe('');
  });
});

describe('getEntityTypeName', () => {
  it('should return correct name for MODEL entity type', () => {
    expect(getEntityTypeName(EntityType.MODEL)).toBe('Model');
  });

  it('should return correct name for TOOL entity type', () => {
    expect(getEntityTypeName(EntityType.TOOL)).toBe('Tool');
  });

  it('should return correct name for EMBEDDING entity type', () => {
    expect(getEntityTypeName(EntityType.EMBEDDING)).toBe('Embedding');
  });

  it('should return correct name for RETRIEVER entity type', () => {
    expect(getEntityTypeName(EntityType.RETRIEVER)).toBe('Retriever');
  });

  it('should return correct name for GUARDRAIL entity type', () => {
    expect(getEntityTypeName(EntityType.GUARDRAIL)).toBe('Guardrail');
  });

  it('should return correct name for EVALUATOR entity type', () => {
    expect(getEntityTypeName(EntityType.EVALUATOR)).toBe('Evaluator');
  });

  it('should return correct name for AGENT entity type', () => {
    expect(getEntityTypeName(EntityType.AGENT)).toBe('Agent');
  });

  it('should return "Custom" for CUSTOM entity type without customType', () => {
    expect(getEntityTypeName(EntityType.CUSTOM)).toBe('Custom');
  });

  it('should return custom type for CUSTOM entity type with customType', () => {
    expect(getEntityTypeName(EntityType.CUSTOM, 'prod-env')).toBe('prod-env');
  });

  it('should return default name for unknown entity type', () => {
    expect(getEntityTypeName('UNKNOWN' as EntityType)).toBe('Model');
  });
});

describe('getPatternMatchTypeLabel', () => {
  it('should return "value" for VALUE pattern type', () => {
    expect(getPatternMatchTypeLabel(MatchPatternType.VALUE)).toBe('value');
  });

  it('should return "regex" for REGEX pattern type', () => {
    expect(getPatternMatchTypeLabel(MatchPatternType.REGEX)).toBe('regex');
  });

  it('should return default "value" for unknown pattern type', () => {
    expect(getPatternMatchTypeLabel('UNKNOWN' as MatchPatternType)).toBe('value');
  });
});

describe('matchSpanToEntity', () => {
  const createEntity = (
  attributeName: string,
  patternType: MatchPatternType,
  value: string,
  pattern?: string)
  : EntityResponse => ({
    id: '1',
    name: 'Test Entity',
    entityType: EntityType.MODEL,
    matchingAttributeName: attributeName,
    matchingPatternType: patternType,
    matchingValue: value,
    matchingPattern: pattern
  }) as EntityResponse;

  it('should match span with exact value', () => {
    const entity = createEntity('name', MatchPatternType.VALUE, 'test-model');
    const span = {
      attributes: [
      { key: 'name', value: 'test-model' },
      { key: 'other', value: 'other-value' }]

    };

    expect(matchSpanToEntity(span, entity)).toBe(true);
  });

  it('should not match span with different value', () => {
    const entity = createEntity('name', MatchPatternType.VALUE, 'test-model');
    const span = {
      attributes: [
      { key: 'name', value: 'different-model' }]

    };

    expect(matchSpanToEntity(span, entity)).toBe(false);
  });

  it('should match span with regex pattern', () => {
    const entity = createEntity(
      'name',
      MatchPatternType.REGEX,
      '',
      '^test-.*'
    );
    const span = {
      attributes: [
      { key: 'name', value: 'test-model-123' }]

    };

    expect(matchSpanToEntity(span, entity)).toBe(true);
  });

  it('should not match span that does not match regex pattern', () => {
    const entity = createEntity(
      'name',
      MatchPatternType.REGEX,
      '',
      '^test-.*'
    );
    const span = {
      attributes: [
      { key: 'name', value: 'other-model' }]

    };

    expect(matchSpanToEntity(span, entity)).toBe(false);
  });

  it('should return false for span without attributes', () => {
    const entity = createEntity('name', MatchPatternType.VALUE, 'test-model');
    const span = {};

    expect(matchSpanToEntity(span, entity)).toBe(false);
  });

  it('should return false for span without matching attribute', () => {
    const entity = createEntity('name', MatchPatternType.VALUE, 'test-model');
    const span = {
      attributes: [
      { key: 'other', value: 'test-model' }]

    };

    expect(matchSpanToEntity(span, entity)).toBe(false);
  });

  it('should handle null attribute value', () => {
    const entity = createEntity('name', MatchPatternType.VALUE, 'test-model');
    const span = {
      attributes: [
      { key: 'name', value: null }]

    };

    expect(matchSpanToEntity(span, entity)).toBe(false);
  });

  it('should handle invalid regex pattern gracefully', () => {
    const entity = createEntity(
      'name',
      MatchPatternType.REGEX,
      '',
      '[invalid-regex'
    );
    const span = {
      attributes: [
      { key: 'name', value: 'test-model' }]

    };


    expect(matchSpanToEntity(span, entity)).toBe(false);
  });

  it('should handle string pattern type values', () => {
    const entity = {
      ...createEntity('name', MatchPatternType.VALUE, 'test-model'),
      matchingPatternType: 'value' as any
    };
    const span = {
      attributes: [
      { key: 'name', value: 'test-model' }]

    };

    expect(matchSpanToEntity(span, entity)).toBe(true);
  });
});

describe('findMatchingEntity', () => {
  const createEntity = (
  id: string,
  attributeName: string,
  value: string)
  : EntityResponse => ({
    id,
    name: `Entity ${id}`,
    entityType: EntityType.MODEL,
    matchingAttributeName: attributeName,
    matchingPatternType: MatchPatternType.VALUE,
    matchingValue: value
  }) as Entity;

  it('should return first matching entity', () => {
    const entities = [
    createEntity('1', 'name', 'model-1'),
    createEntity('2', 'name', 'model-2'),
    createEntity('3', 'name', 'model-1')];

    const span = {
      attributes: [
      { key: 'name', value: 'model-1' }]

    };

    const result = findMatchingEntity(span, entities);
    expect(result).toBe(entities[0]);
  });

  it('should return null when no entities match', () => {
    const entities = [
    createEntity('1', 'name', 'model-1'),
    createEntity('2', 'name', 'model-2')];

    const span = {
      attributes: [
      { key: 'name', value: 'model-3' }]

    };

    const result = findMatchingEntity(span, entities);
    expect(result).toBeNull();
  });

  it('should return null for empty entities array', () => {
    const span = {
      attributes: [
      { key: 'name', value: 'model-1' }]

    };

    const result = findMatchingEntity(span, []);
    expect(result).toBeNull();
  });

  it('should return null for null entities', () => {
    const span = {
      attributes: [
      { key: 'name', value: 'model-1' }]

    };

    const result = findMatchingEntity(span, null as any);
    expect(result).toBeNull();
  });
});