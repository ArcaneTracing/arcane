import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceFormBasicFields } from "../datasource-form-basic-fields";
import { DatasourceSource } from "@/types/enums";
import { render as customRender } from "@/__tests__/test-utils";

describe("DatasourceFormBasicFields", () => {
  const onNameChange = jest.fn();
  const onDescriptionChange = jest.fn();
  const onSourceChange = jest.fn();

  const defaultProps = {
    name: "",
    description: "",
    source: "" as DatasourceSource | "",
    onNameChange,
    onDescriptionChange,
    onSourceChange,
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Name, Description, and Source fields", () => {
    customRender(<DatasourceFormBasicFields {...defaultProps} />);
    expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Description$/i)).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
  });

  it("displays name and description values", () => {
    customRender(
      <DatasourceFormBasicFields
        {...defaultProps}
        name="My Source"
        description="A test" />

    );
    expect((screen.getByLabelText(/^Name$/i) as HTMLInputElement).value).toBe("My Source");
    expect((screen.getByLabelText(/^Description$/i) as HTMLTextAreaElement).value).toBe("A test");
  });

  it("calls onNameChange when name input changes", () => {
    customRender(<DatasourceFormBasicFields {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: "x" } });
    expect(onNameChange).toHaveBeenCalledWith("x");
  });

  it("calls onDescriptionChange when description changes", () => {
    customRender(<DatasourceFormBasicFields {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/^Description$/i), { target: { value: "desc" } });
    expect(onDescriptionChange).toHaveBeenCalledWith("desc");
  });

  it("renders Source select with placeholder and options when opened", () => {
    customRender(<DatasourceFormBasicFields {...defaultProps} />);
    const trigger = screen.getByLabelText(/^Source$/i);
    fireEvent.click(trigger);
    expect(screen.getByText("Tempo")).toBeInTheDocument();
    expect(screen.getByText("Jaeger")).toBeInTheDocument();
    expect(screen.getByText("ClickHouse")).toBeInTheDocument();
  });

  it("allows selecting a source option", () => {
    customRender(<DatasourceFormBasicFields {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/^Source$/i));
    const tempo = screen.getByText("Tempo");
    expect(tempo).toBeInTheDocument();
    fireEvent.click(tempo);

  });

  it("disables inputs when disabled is true", () => {
    customRender(<DatasourceFormBasicFields {...defaultProps} disabled />);
    expect(screen.getByLabelText(/^Name$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Description$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^Source$/i)).toBeDisabled();
  });

  it("name input has required attribute", () => {
    customRender(<DatasourceFormBasicFields {...defaultProps} />);
    expect(screen.getByLabelText(/^Name$/i)).toBeRequired();
  });
});