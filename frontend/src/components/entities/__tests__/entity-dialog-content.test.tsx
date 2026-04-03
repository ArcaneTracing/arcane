import React from 'react';
import { render, screen } from '@testing-library/react';
import { EntityDialogContent } from '../entity-dialog-content';
import { EntityType, MatchPatternType, MessageMatchingType } from '@/types';
import { FormData } from '@/hooks/entity/use-entity-form';

jest.mock('../forms/entity-type-step', () => ({
  EntityTypeStep: ({ entityType, onEntityTypeChange }: any) =>
  <div data-testid="entity-type-step">
      <span>Entity Type: {entityType}</span>
      <button onClick={() => onEntityTypeChange(EntityType.TOOL)}>Change Type</button>
    </div>

}));

jest.mock('../forms/basic-info-step', () => ({
  BasicInfoStep: ({ name, description }: any) =>
  <div data-testid="basic-info-step">
      <span>Name: {name}</span>
      <span>Description: {description}</span>
    </div>

}));

jest.mock('../forms/matching-step', () => ({
  MatchingStep: ({ attributeName, matchPatternType }: any) =>
  <div data-testid="matching-step">
      <span>Attribute: {attributeName}</span>
      <span>Pattern Type: {matchPatternType}</span>
    </div>

}));

jest.mock('../forms/entity-specific-step', () => ({
  EntitySpecificStep: ({ entityType }: any) =>
  <div data-testid="entity-specific-step">
      <span>Entity Type: {entityType}</span>
    </div>

}));

jest.mock('../forms/message-matching-step', () => ({
  MessageMatchingStep: ({ messageMatching }: any) =>
  <div data-testid="message-matching-step">
      <span>Message Matching Type: {messageMatching?.type || 'undefined'}</span>
    </div>

}));

describe('EntityDialogContent', () => {
  const defaultFormData: FormData = {
    name: 'Test Entity',
    description: 'Test Description',
    attributeName: 'test.attribute',
    matchPatternType: MatchPatternType.VALUE,
    matchValue: 'test-value',
    entityType: EntityType.MODEL,
    entityHighlights: [],
    messageMatching: {
      type: MessageMatchingType.CANONICAL,
      canonicalMessageMatchingConfiguration: {
        inputAttributeKey: '',
        outputAttributeKey: ''
      },
      flatMessageMatchingConfiguration: {
        flatInputMessageMatchingKeys: {
          rolePattern: '',
          contentPattern: '',
          namePattern: '',
          toolMessageCallIdPattern: '',
          toolCallFunctionNamePattern: '',
          toolCallIdPattern: '',
          toolCallFunctionArgumentPattern: ''
        },
        flatOutputMessageMatchingKeys: {
          rolePattern: '',
          contentPattern: '',
          namePattern: '',
          toolMessageCallIdPattern: '',
          toolCallFunctionNamePattern: '',
          toolCallIdPattern: '',
          toolCallFunctionArgumentPattern: ''
        }
      }
    }
  };

  const defaultProps = {
    currentStep: 1,
    formData: defaultFormData,
    isLoading: false,
    totalSteps: 4,
    onFieldChange: jest.fn(),
    onAttributesChange: jest.fn(),
    onMessageMatchingChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render step 1 (Entity Type and Basic Info)', () => {
    render(<EntityDialogContent {...defaultProps} currentStep={1} />);
    expect(screen.getByTestId('entity-type-step')).toBeInTheDocument();
    expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
  });

  it('should render step 2 (Matching)', () => {
    render(<EntityDialogContent {...defaultProps} currentStep={2} />);
    expect(screen.getByTestId('matching-step')).toBeInTheDocument();
  });

  it('should render step 3 (Entity Specific)', () => {
    render(<EntityDialogContent {...defaultProps} currentStep={3} />);
    expect(screen.getByTestId('entity-specific-step')).toBeInTheDocument();
  });

  it('should render step 4 (Message Matching) for MODEL entity type', () => {
    render(<EntityDialogContent {...defaultProps} currentStep={4} />);
    expect(screen.getByTestId('message-matching-step')).toBeInTheDocument();
  });

  it('should not render step 4 for non-MODEL entity types', () => {
    const nonModelFormData = {
      ...defaultFormData,
      entityType: EntityType.TOOL
    };
    render(
      <EntityDialogContent
        {...defaultProps}
        formData={nonModelFormData}
        currentStep={4} />

    );
    expect(screen.queryByTestId('message-matching-step')).not.toBeInTheDocument();
  });

  it('should return null for invalid step', () => {
    const { container } = render(
      <EntityDialogContent {...defaultProps} currentStep={99} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should pass form data to step components', () => {
    render(<EntityDialogContent {...defaultProps} currentStep={1} />);
    expect(screen.getByText(/Name: Test Entity/i)).toBeInTheDocument();
    expect(screen.getByText(/Description: Test Description/i)).toBeInTheDocument();
  });

  it('should pass entity type to EntityTypeStep', () => {
    render(<EntityDialogContent {...defaultProps} currentStep={1} />);
    expect(screen.getByText(/Entity Type: model/i)).toBeInTheDocument();
  });


  it('should handle null formData fields', () => {
    const formDataWithNulls = {
      ...defaultFormData,
      name: null as any,
      description: null as any
    };
    render(
      <EntityDialogContent
        {...defaultProps}
        formData={formDataWithNulls}
        currentStep={1} />

    );

    expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
  });

  it('should handle undefined formData fields', () => {
    const formDataWithUndefined = {
      ...defaultFormData,
      name: undefined as any,
      description: undefined as any
    };
    render(
      <EntityDialogContent
        {...defaultProps}
        formData={formDataWithUndefined}
        currentStep={1} />

    );

    expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
  });

  it('should handle empty formData', () => {
    const emptyFormData = {
      name: '',
      description: '',
      attributeName: '',
      matchPatternType: MatchPatternType.VALUE,
      matchValue: '',
      entityType: EntityType.MODEL,
      entityHighlights: [],
      messageMatching: defaultFormData.messageMatching
    };
    render(
      <EntityDialogContent
        {...defaultProps}
        formData={emptyFormData}
        currentStep={1} />

    );

    expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
  });

  it('should handle currentStep being 0', () => {
    const { container } = render(
      <EntityDialogContent {...defaultProps} currentStep={0} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle currentStep being negative', () => {
    const { container } = render(
      <EntityDialogContent {...defaultProps} currentStep={-1} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle currentStep exceeding totalSteps', () => {
    const { container } = render(
      <EntityDialogContent {...defaultProps} currentStep={10} totalSteps={4} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle null entityHighlights', () => {
    const formDataWithNullHighlights = {
      ...defaultFormData,
      entityHighlights: null as any
    };
    render(
      <EntityDialogContent
        {...defaultProps}
        formData={formDataWithNullHighlights}
        currentStep={3} />

    );

    expect(screen.getByTestId('entity-specific-step')).toBeInTheDocument();
  });

  it('should handle undefined messageMatching', () => {
    const formDataWithUndefinedMatching = {
      ...defaultFormData,
      messageMatching: undefined as any
    };

    render(
      <EntityDialogContent
        {...defaultProps}
        formData={formDataWithUndefinedMatching}
        currentStep={4} />

    );
    expect(screen.getByTestId('message-matching-step')).toBeInTheDocument();
  });

  it('should handle missing callbacks', () => {
    const propsWithoutCallbacks = {
      ...defaultProps,
      onFieldChange: undefined as any,
      onAttributesChange: undefined as any,
      onMessageMatchingChange: undefined as any
    };

    const { container } = render(
      <EntityDialogContent {...propsWithoutCallbacks} currentStep={1} />
    );
    expect(container).toBeInTheDocument();
  });

  it('should handle null entityType', () => {
    const formDataWithNullType = {
      ...defaultFormData,
      entityType: null as any
    };
    render(
      <EntityDialogContent
        {...defaultProps}
        formData={formDataWithNullType}
        currentStep={1} />

    );

    expect(screen.getByTestId('entity-type-step')).toBeInTheDocument();
  });

  it('should handle invalid entityType', () => {
    const formDataWithInvalidType = {
      ...defaultFormData,
      entityType: 'INVALID_TYPE' as any
    };
    render(
      <EntityDialogContent
        {...defaultProps}
        formData={formDataWithInvalidType}
        currentStep={3} />

    );

    expect(screen.getByTestId('entity-specific-step')).toBeInTheDocument();
  });

  it('should handle totalSteps being 0', () => {
    const { container } = render(
      <EntityDialogContent {...defaultProps} currentStep={1} totalSteps={0} />
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle totalSteps being negative', () => {
    const { container } = render(
      <EntityDialogContent {...defaultProps} currentStep={1} totalSteps={-1} />
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle very large step numbers', () => {
    const { container } = render(
      <EntityDialogContent {...defaultProps} currentStep={999} totalSteps={1000} />
    );

    expect(container.firstChild).toBeNull();
  });
});