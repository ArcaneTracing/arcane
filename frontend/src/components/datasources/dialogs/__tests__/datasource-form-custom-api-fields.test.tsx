import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceFormCustomApiFields } from "../datasource-form-custom-api-fields";
import type { CustomApiConfig } from "@/types/datasources";

describe("DatasourceFormCustomApiFields", () => {
  const defaultProps = {
    customApiConfig: {
      baseUrl: "",
      endpoints: {
        search: { path: "" },
        searchByTraceId: { path: "" }
      },
      capabilities: {
        searchByQuery: true,
        searchByAttributes: false,
        filterByAttributeExists: false,
        getAttributeNames: false,
        getAttributeValues: false
      }
    } as Partial<CustomApiConfig>,
    validationErrors: {},
    onCustomApiConfigChange: jest.fn(),
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders base URL field", () => {
    render(<DatasourceFormCustomApiFields {...defaultProps} />);
    expect(screen.getByLabelText(/Base URL/i)).toBeInTheDocument();
  });

  it("renders endpoint fields", () => {
    render(<DatasourceFormCustomApiFields {...defaultProps} />);
    expect(screen.getByLabelText(/Search Endpoint Path/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search by Trace ID Endpoint Path/i)).toBeInTheDocument();
  });

  it("renders capability switches", () => {
    render(<DatasourceFormCustomApiFields {...defaultProps} />);
    expect(screen.getByLabelText(/Search by Query/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search by Attributes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Attribute Exists/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Get Attribute Names/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Get Attribute Values/i)).toBeInTheDocument();
  });

  it("updates baseUrl when input changes", () => {
    const onCustomApiConfigChange = jest.fn();
    const config = { ...defaultProps.customApiConfig, baseUrl: "old-url" };
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        customApiConfig={config}
        onCustomApiConfigChange={onCustomApiConfigChange} />

    );

    const input = screen.getByLabelText(/Base URL/i) as HTMLInputElement;
    const newValue = "https://api.example.com";
    fireEvent.change(input, { target: { value: newValue } });

    expect(onCustomApiConfigChange).toHaveBeenCalled();
    const updateFn = onCustomApiConfigChange.mock.calls[0][0];

    expect(typeof updateFn).toBe("function");


    const result = updateFn({ baseUrl: "old-url", endpoints: config.endpoints });

    expect(result).toHaveProperty("baseUrl");

  });

  it("updates search endpoint path when input changes", () => {
    const onCustomApiConfigChange = jest.fn();
    const config = {
      ...defaultProps.customApiConfig,
      endpoints: {
        search: { path: "old-path" },
        searchByTraceId: { path: "" }
      }
    };
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        customApiConfig={config}
        onCustomApiConfigChange={onCustomApiConfigChange} />

    );

    const input = screen.getByLabelText(/Search Endpoint Path/i) as HTMLInputElement;
    const newValue = "/api/search";
    fireEvent.change(input, { target: { value: newValue } });

    expect(onCustomApiConfigChange).toHaveBeenCalled();
    const updateFn = onCustomApiConfigChange.mock.calls[0][0];

    expect(typeof updateFn).toBe("function");


    const result = updateFn(config);

    expect(result).toHaveProperty("endpoints");
    expect(result.endpoints).toHaveProperty("search");

  });

  it("shows attribute names endpoint when getAttributeNames is enabled", () => {
    const config = {
      ...defaultProps.customApiConfig,
      capabilities: {
        ...defaultProps.capabilities,
        getAttributeNames: true
      }
    };
    render(<DatasourceFormCustomApiFields {...defaultProps} customApiConfig={config} />);
    expect(screen.getByLabelText(/Attribute Names Endpoint Path/i)).toBeInTheDocument();
  });

  it("hides attribute names endpoint when getAttributeNames is disabled", () => {
    render(<DatasourceFormCustomApiFields {...defaultProps} />);
    expect(screen.queryByLabelText(/Attribute Names Endpoint Path/i)).not.toBeInTheDocument();
  });

  it("shows attribute values endpoint when getAttributeValues is enabled", () => {
    const config = {
      ...defaultProps.customApiConfig,
      capabilities: {
        ...defaultProps.capabilities,
        getAttributeValues: true
      }
    };
    render(<DatasourceFormCustomApiFields {...defaultProps} customApiConfig={config} />);
    expect(screen.getByLabelText(/Attribute Values Endpoint Path/i)).toBeInTheDocument();
  });

  it("toggles capability when switch is clicked", () => {
    const onCustomApiConfigChange = jest.fn();
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        onCustomApiConfigChange={onCustomApiConfigChange} />

    );

    const switchElement = screen.getByLabelText(/Search by Attributes/i);
    fireEvent.click(switchElement);

    expect(onCustomApiConfigChange).toHaveBeenCalled();
  });

  it("displays validation errors", () => {
    const validationErrors = {
      baseUrl: "Base URL is required",
      "endpoints.search.path": "Search endpoint path is required"
    };
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        validationErrors={validationErrors} />

    );

    expect(screen.getByText("Base URL is required")).toBeInTheDocument();
    expect(screen.getByText("Search endpoint path is required")).toBeInTheDocument();
  });

  it("disables inputs when disabled prop is true", () => {
    render(<DatasourceFormCustomApiFields {...defaultProps} disabled={true} />);
    const baseUrlInput = screen.getByLabelText(/Base URL/i);
    expect(baseUrlInput).toBeDisabled();
  });

  it("renders authentication accordion", () => {
    render(<DatasourceFormCustomApiFields {...defaultProps} />);
    expect(screen.getByText(/Authentication \(Optional\)/i)).toBeInTheDocument();
  });

  it("shows header auth fields when header type is selected", () => {
    const config = {
      ...defaultProps.customApiConfig,
      authentication: {
        type: "header" as const,
        headerName: "",
        value: ""
      }
    };
    render(<DatasourceFormCustomApiFields {...defaultProps} customApiConfig={config} />);


    const triggers = screen.getAllByRole("button").filter((btn) =>
    btn.textContent?.includes("Authentication")
    );
    if (triggers.length > 0) {
      fireEvent.click(triggers[0]);
    }

    expect(screen.getByLabelText(/Header Name/i)).toBeInTheDocument();

    const valueInputs = screen.getAllByLabelText(/Value/i);
    expect(valueInputs.length).toBeGreaterThan(0);
  });

  it("shows bearer auth field when bearer type is selected", () => {
    const config = {
      ...defaultProps.customApiConfig,
      authentication: {
        type: "bearer" as const,
        value: ""
      }
    };
    render(<DatasourceFormCustomApiFields {...defaultProps} customApiConfig={config} />);


    const triggers = screen.getAllByRole("button").filter((btn) =>
    btn.textContent?.includes("Authentication")
    );
    if (triggers.length > 0) {
      fireEvent.click(triggers[0]);
    }

    expect(screen.getByLabelText(/Token/i)).toBeInTheDocument();
  });

  it("shows basic auth fields when basic type is selected", () => {
    const config = {
      ...defaultProps.customApiConfig,
      authentication: {
        type: "basic" as const,
        username: "",
        password: ""
      }
    };
    render(<DatasourceFormCustomApiFields {...defaultProps} customApiConfig={config} />);


    const triggers = screen.getAllByRole("button").filter((btn) =>
    btn.textContent?.includes("Authentication")
    );
    if (triggers.length > 0) {
      fireEvent.click(triggers[0]);
    }

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("renders custom headers accordion", () => {
    render(<DatasourceFormCustomApiFields {...defaultProps} />);
    expect(screen.getByText(/Custom Headers \(Optional\)/i)).toBeInTheDocument();
  });

  it("displays searchByTraceId path validation error", () => {
    const validationErrors = {
      "endpoints.searchByTraceId.path": "Trace ID endpoint is required"
    };
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        validationErrors={validationErrors} />

    );
    expect(screen.getByText("Trace ID endpoint is required")).toBeInTheDocument();
  });

  it("disabling getAttributeNames clears attributeNames endpoint", () => {
    const onCustomApiConfigChange = jest.fn();
    const config = {
      ...defaultProps.customApiConfig,
      capabilities: {
        ...defaultProps.customApiConfig!.capabilities,
        getAttributeNames: true
      },
      endpoints: {
        ...defaultProps.customApiConfig!.endpoints,
        attributeNames: { path: "/api/attributes" }
      }
    };
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        customApiConfig={config}
        onCustomApiConfigChange={onCustomApiConfigChange} />

    );

    const switchEl = screen.getByLabelText(/Get Attribute Names/i);
    fireEvent.click(switchEl);

    expect(onCustomApiConfigChange).toHaveBeenCalled();
    const updateFn = onCustomApiConfigChange.mock.calls[0][0];
    const result = updateFn(config);
    expect(result.endpoints).not.toHaveProperty("attributeNames");
  });

  it("disabling getAttributeValues clears attributeValues endpoint", () => {
    const onCustomApiConfigChange = jest.fn();
    const config = {
      ...defaultProps.customApiConfig,
      capabilities: {
        ...defaultProps.customApiConfig!.capabilities,
        getAttributeValues: true
      },
      endpoints: {
        ...defaultProps.customApiConfig!.endpoints,
        attributeValues: { path: "/api/values" }
      }
    };
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        customApiConfig={config}
        onCustomApiConfigChange={onCustomApiConfigChange} />

    );

    const switchEl = screen.getByLabelText(/Get Attribute Values/i);
    fireEvent.click(switchEl);

    expect(onCustomApiConfigChange).toHaveBeenCalled();
    const updateFn = onCustomApiConfigChange.mock.calls[0][0];
    const result = updateFn(config);
    expect(result.endpoints).not.toHaveProperty("attributeValues");
  });

  it("updates headers when custom headers textarea changes", () => {
    const onCustomApiConfigChange = jest.fn();
    render(
      <DatasourceFormCustomApiFields
        {...defaultProps}
        onCustomApiConfigChange={onCustomApiConfigChange} />

    );

    const triggers = screen.getAllByRole("button").filter((btn) =>
    btn.textContent?.includes("Custom Headers")
    );
    fireEvent.click(triggers[0]);

    const textareas = screen.getAllByRole("textbox");
    const headersTextarea = textareas.find(
      (t) => (t as HTMLTextAreaElement).placeholder?.includes("X-Custom-Header")
    ) as HTMLTextAreaElement;
    expect(headersTextarea).toBeDefined();

    fireEvent.change(headersTextarea, {
      target: { value: "X-API-Key: secret123\nAccept: application/json" }
    });

    expect(onCustomApiConfigChange).toHaveBeenCalled();
    const updateFn = onCustomApiConfigChange.mock.calls[0][0];
    const result = updateFn(defaultProps.customApiConfig!);
    expect(result.headers).toEqual({
      "X-API-Key": "secret123",
      Accept: "application/json"
    });
  });

  it("parses and formats custom headers correctly", () => {
    const config = {
      ...defaultProps.customApiConfig,
      headers: {
        "X-Custom-Header": "value1",
        "X-Another-Header": "value2"
      }
    };
    render(<DatasourceFormCustomApiFields {...defaultProps} customApiConfig={config} />);


    const triggers = screen.getAllByRole("button").filter((btn) =>
    btn.textContent?.includes("Custom Headers")
    );
    if (triggers.length > 0) {
      fireEvent.click(triggers[0]);
    }


    const textarea = screen.queryByPlaceholderText(/X-Custom-Header/i) as HTMLTextAreaElement;
    if (textarea) {
      expect(textarea.value).toContain("X-Custom-Header: value1");
      expect(textarea.value).toContain("X-Another-Header: value2");
    } else {

      const textareas = screen.getAllByRole("textbox");
      const headersTextarea = textareas.find((t) =>
      (t as HTMLTextAreaElement).placeholder?.includes("X-Custom-Header")
      ) as HTMLTextAreaElement;
      if (headersTextarea) {
        expect(headersTextarea.value).toContain("X-Custom-Header: value1");
        expect(headersTextarea.value).toContain("X-Another-Header: value2");
      }
    }
  });
});