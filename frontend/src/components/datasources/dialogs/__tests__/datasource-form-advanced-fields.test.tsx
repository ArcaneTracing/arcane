import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceFormAdvancedFields } from "../datasource-form-advanced-fields";
import { DatasourceSource } from "@/types/enums";
import { render as customRender } from "@/__tests__/test-utils";

describe("DatasourceFormAdvancedFields", () => {
  const onUrlChange = jest.fn();
  const onClickhouseConfigChange = jest.fn();
  const onCustomApiConfigChange = jest.fn();

  const defaultProps = {
    source: "" as DatasourceSource | "",
    url: "",
    clickhouseConfig: {},
    customApiConfig: {},
    tempoJaegerAuthConfig: {},
    validationErrors: {} as Record<string, string>,
    onUrlChange,
    onClickhouseConfigChange,
    onCustomApiConfigChange,
    onTempoJaegerAuthConfigChange: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when source is empty", () => {
    const { container } = customRender(<DatasourceFormAdvancedFields {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders URL field when source is TEMPO", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.TEMPO} />
    );
    expect(screen.getByLabelText(/^URL\s*\*?$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("http://localhost:9090")).toBeInTheDocument();
  });

  it("renders URL field when source is JAEGER", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.JAEGER} />
    );
    expect(screen.getByLabelText(/^URL\s*\*?$/i)).toBeInTheDocument();
  });

  it("calls onUrlChange when URL changes for TEMPO", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.TEMPO} />
    );
    fireEvent.change(screen.getByLabelText(/^URL\s*\*?$/i), { target: { value: "http://x" } });
    expect(onUrlChange).toHaveBeenCalledWith("http://x");
  });

  it("renders ClickHouse fields when source is CLICKHOUSE", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.CLICKHOUSE} />
    );
    expect(screen.getByLabelText(/^Host \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Port$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Database \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Protocol$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Table Name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^URL \(Alternative\)$/i)).toBeInTheDocument();
  });

  it("displays clickhouse config and url when CLICKHOUSE", () => {
    customRender(
      <DatasourceFormAdvancedFields
        {...defaultProps}
        source={DatasourceSource.CLICKHOUSE}
        url="http://ch:8123"
        clickhouseConfig={{ host: "localhost", database: "db1", tableName: "t1" }} />

    );
    expect((screen.getByLabelText(/^Host \*$/i) as HTMLInputElement).value).toBe("localhost");
    expect((screen.getByLabelText(/^Database \*$/i) as HTMLInputElement).value).toBe("db1");
    expect((screen.getByLabelText(/^Table Name \*$/i) as HTMLInputElement).value).toBe("t1");
    expect((screen.getByLabelText(/^URL \(Alternative\)$/i) as HTMLInputElement).value).toBe(
      "http://ch:8123"
    );
  });

  it("calls onClickhouseConfigChange when host changes", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.CLICKHOUSE} />
    );
    const hostInput = screen.getByLabelText(/^Host \*$/i);
    fireEvent.change(hostInput, { target: { value: "h1" } });
    expect(onClickhouseConfigChange).toHaveBeenCalled();
    const updater = onClickhouseConfigChange.mock.calls[0][0];
    expect(typeof updater).toBe("function");

    expect(updater({})).toHaveProperty("host");
  });

  it("calls onUrlChange when URL (Alternative) changes for CLICKHOUSE", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.CLICKHOUSE} />
    );
    fireEvent.change(screen.getByLabelText(/^URL \(Alternative\)$/i), {
      target: { value: "http://alt" }
    });
    expect(onUrlChange).toHaveBeenCalledWith("http://alt");
  });

  it("shows validation error for host when present", () => {
    customRender(
      <DatasourceFormAdvancedFields
        {...defaultProps}
        source={DatasourceSource.CLICKHOUSE}
        validationErrors={{ host: "Host is required" }} />

    );
    expect(screen.getByText("Host is required")).toBeInTheDocument();
  });

  it("disables inputs when disabled", () => {
    customRender(
      <DatasourceFormAdvancedFields
        {...defaultProps}
        source={DatasourceSource.CLICKHOUSE}
        disabled />

    );
    expect(screen.getByLabelText(/^Host \*$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^URL \(Alternative\)$/i)).toBeDisabled();
  });

  it("URL field is required when source is TEMPO", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.TEMPO} />
    );
    expect(screen.getByLabelText(/^URL\s*\*?$/i)).toBeRequired();
  });

  it("renders Custom API fields when source is CUSTOM_API", () => {
    customRender(
      <DatasourceFormAdvancedFields {...defaultProps} source={DatasourceSource.CUSTOM_API} />
    );
    expect(screen.getByLabelText(/Base URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search Endpoint Path/i)).toBeInTheDocument();
  });
});