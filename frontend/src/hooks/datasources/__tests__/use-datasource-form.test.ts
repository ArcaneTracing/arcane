import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDatasourceForm } from "../use-datasource-form";
import { DatasourceSource, DatasourceType } from "@/types/enums";
import type { DatasourceResponse } from "@/types/datasources";

describe("useDatasourceForm", () => {
  const noop = async () => {};

  it("returns default form state when isOpen is true and no datasource", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    expect(result.current.name).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.url).toBe("");
    expect(result.current.source).toBe("");
    expect(result.current.clickhouseConfig.host).toBe("");
    expect(result.current.clickhouseConfig.port).toBe(8123);
    expect(result.current.customApiConfig.baseUrl).toBe("");
    expect(result.current.customApiConfig.endpoints?.search?.path).toBe("");
    expect(result.current.customApiConfig.endpoints?.searchByTraceId?.path).toBe("");
    expect(result.current.customApiConfig.capabilities?.searchByQuery).toBe(true);
    expect(result.current.validationErrors).toEqual({});
    expect(result.current.isEditMode).toBe(false);
  });

  it("initializes from datasource when isOpen is true and datasource provided", () => {
    const ds: DatasourceResponse = {
      id: "id1",
      name: "My Source",
      description: "A desc",
      url: "http://example.com",
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: ds, isOpen: true, onSubmit: noop })
    );

    expect(result.current.name).toBe("My Source");
    expect(result.current.description).toBe("A desc");
    expect(result.current.url).toBe("http://example.com");
    expect(result.current.source).toBe(DatasourceSource.TEMPO);
    expect(result.current.isEditMode).toBe(true);
  });

  it("initializes ClickHouse config when datasource has ClickHouse source", () => {
    const ds: DatasourceResponse = {
      id: "id1",
      name: "CH",
      description: "",
      url: "",
      type: DatasourceType.TRACES,
      source: DatasourceSource.CLICKHOUSE,
      config: {
        clickhouse: {
          host: "localhost",
          port: 9000,
          database: "mydb",
          tableName: "traces",
          protocol: "https",
          username: "u",
          password: "p"
        }
      }
    };

    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: ds, isOpen: true, onSubmit: noop })
    );

    expect(result.current.source).toBe(DatasourceSource.CLICKHOUSE);
    expect(result.current.clickhouseConfig.host).toBe("localhost");
    expect(result.current.clickhouseConfig.port).toBe(9000);
    expect(result.current.clickhouseConfig.database).toBe("mydb");
    expect(result.current.clickhouseConfig.tableName).toBe("traces");
    expect(result.current.clickhouseConfig.protocol).toBe("https");
    expect(result.current.clickhouseConfig.username).toBe("u");
    expect(result.current.clickhouseConfig.password).toBe("p");
  });

  it("validateForm returns false and sets errors when source is TEMPO and url is empty", async () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.TEMPO);
    });
    await waitFor(() => expect(result.current.source).toBe(DatasourceSource.TEMPO));

    let valid: boolean;
    act(() => {
      valid = result.current.validateForm();
    });
    expect(valid!).toBe(false);
    expect(result.current.validationErrors.url).toBe("URL is required");
  });

  it("validateForm returns true when source is TEMPO and url is set", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.TEMPO);
      result.current.setUrl("http://localhost:9090");
    });

    expect(result.current.validateForm()).toBe(true);
    expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
  });

  it("validateForm returns false when source is CLICKHOUSE and neither config nor url", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CLICKHOUSE);
    });
    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors.url).toBeDefined();
    expect(result.current.validationErrors.config).toBeDefined();
  });

  it("validateForm returns true when source is CLICKHOUSE and host, database, tableName set", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CLICKHOUSE);
      result.current.setClickhouseConfig((c) => ({
        ...c,
        host: "h",
        database: "d",
        tableName: "t"
      }));
    });

    expect(result.current.validateForm()).toBe(true);
  });

  it("handleSubmit calls onSubmit with built payload when valid", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit })
    );

    act(() => {
      result.current.setName("N");
      result.current.setDescription("D");
      result.current.setSource(DatasourceSource.TEMPO);
      result.current.setUrl("http://x.com");
    });

    const form = document.createElement("form");
    form.appendChild(document.createElement("input"));
    const preventDefault = jest.fn();
    const e = { preventDefault } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(e);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [payload] = onSubmit.mock.calls[0];
    expect(payload).toMatchObject({
      name: "N",
      description: "D",
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO,
      url: "http://x.com"
    });
  });

  it("handleSubmit does not call onSubmit when validation fails", async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit })
    );

    act(() => {
      result.current.setSource(DatasourceSource.TEMPO);

    });

    const e = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(e);
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("setSource clears validation errors", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.TEMPO);
    });
    act(() => {
      result.current.validateForm();
    });
    expect(Object.keys(result.current.validationErrors).length).toBeGreaterThan(0);

    act(() => {
      result.current.setSource(DatasourceSource.JAEGER);
    });
    expect(Object.keys(result.current.validationErrors)).toHaveLength(0);
  });

  it("clearValidation clears validation errors", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.TEMPO);
    });
    act(() => {
      result.current.validateForm();
    });
    expect(Object.keys(result.current.validationErrors).length).toBeGreaterThan(0);

    act(() => {
      result.current.clearValidation();
    });
    expect(result.current.validationErrors).toEqual({});
  });

  it("isSubmitting is true during handleSubmit and false after", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit })
    );

    act(() => {
      result.current.setName("N");
      result.current.setSource(DatasourceSource.TEMPO);
      result.current.setUrl("http://x.com");
    });

    expect(result.current.isSubmitting).toBe(false);

    const e = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
    await act(async () => {
      await result.current.handleSubmit(e);
    });

    expect(result.current.isSubmitting).toBe(false);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("re-initializes when isOpen goes false then true for create", () => {
    const { result, rerender } = renderHook(
      (props: {isOpen: boolean;datasource?: DatasourceResponse | null;onSubmit: () => Promise<void>;}) =>
      useDatasourceForm({ isOpen: props.isOpen, datasource: props.datasource, onSubmit: props.onSubmit }),
      { initialProps: { isOpen: true, datasource: undefined, onSubmit: noop } }
    );

    act(() => {
      result.current.setName("X");
      result.current.setSource(DatasourceSource.TEMPO);
    });
    expect(result.current.name).toBe("X");

    rerender({ isOpen: false, datasource: undefined, onSubmit: noop });
    rerender({ isOpen: true, datasource: undefined, onSubmit: noop });

    expect(result.current.name).toBe("");
    expect(result.current.source).toBe("");
  });


  it("initializes Custom API config when datasource has Custom API source", () => {
    const ds: DatasourceResponse = {
      id: "id1",
      name: "Custom API",
      description: "",
      url: "",
      type: DatasourceType.TRACES,
      source: DatasourceSource.CUSTOM_API,
      config: {
        customApi: {
          baseUrl: "https://api.example.com",
          endpoints: {
            search: { path: "/api/traces/search" },
            searchByTraceId: { path: "/api/traces/{traceId}" },
            attributeNames: { path: "/api/attributes" },
            attributeValues: { path: "/api/attributes/{attributeName}/values" }
          },
          capabilities: {
            searchByQuery: true,
            searchByAttributes: true,
            filterByAttributeExists: true,
            getAttributeNames: true,
            getAttributeValues: true
          },
          authentication: {
            type: "header",
            headerName: "X-API-Key",
            value: "secret-key"
          },
          headers: {
            "X-Custom-Header": "value1"
          }
        }
      }
    };

    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: ds, isOpen: true, onSubmit: noop })
    );

    expect(result.current.source).toBe(DatasourceSource.CUSTOM_API);
    expect(result.current.customApiConfig.baseUrl).toBe("https://api.example.com");
    expect(result.current.customApiConfig.endpoints?.search?.path).toBe("/api/traces/search");
    expect(result.current.customApiConfig.endpoints?.searchByTraceId?.path).toBe("/api/traces/{traceId}");
    expect(result.current.customApiConfig.endpoints?.attributeNames?.path).toBe("/api/attributes");
    expect(result.current.customApiConfig.endpoints?.attributeValues?.path).toBe("/api/attributes/{attributeName}/values");
    expect(result.current.customApiConfig.capabilities?.searchByQuery).toBe(true);
    expect(result.current.customApiConfig.capabilities?.searchByAttributes).toBe(true);
    expect(result.current.customApiConfig.authentication?.type).toBe("header");
    expect(result.current.customApiConfig.authentication?.headerName).toBe("X-API-Key");
    expect(result.current.customApiConfig.authentication?.value).toBe("secret-key");
    expect(result.current.customApiConfig.headers?.["X-Custom-Header"]).toBe("value1");
  });

  it("validateForm returns false when Custom API baseUrl is empty", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors.baseUrl).toBe("Base URL is required");
  });

  it("validateForm returns false when Custom API baseUrl is invalid", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "invalid-url",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" }
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors.baseUrl).toBe("Base URL must be a valid HTTP or HTTPS URL");
  });

  it("validateForm returns false when Custom API search endpoint path is missing", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "" },
          searchByTraceId: { path: "/api/{traceId}" }
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors["endpoints.search.path"]).toBe("Search endpoint path is required");
  });

  it("validateForm returns false when Custom API searchByTraceId path missing {traceId}", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/trace" }
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors["endpoints.searchByTraceId.path"]).toBe(
      "Search by Trace ID endpoint path must contain {traceId} placeholder"
    );
  });

  it("validateForm returns false when getAttributeNames enabled but endpoint missing", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" }
        },
        capabilities: {
          getAttributeNames: true
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors["endpoints.attributeNames.path"]).toBe(
      "Attribute Names endpoint path is required when Get Attribute Names capability is enabled"
    );
  });

  it("validateForm returns false when getAttributeValues enabled but endpoint missing {attributeName}", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" },
          attributeValues: { path: "/api/values" }
        },
        capabilities: {
          getAttributeValues: true
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors["endpoints.attributeValues.path"]).toBe(
      "Attribute Values endpoint path must contain {attributeName} placeholder"
    );
  });

  it("validateForm returns false when header auth type missing headerName", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" }
        },
        authentication: {
          type: "header",
          value: "secret"
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors["authentication.headerName"]).toBe(
      "Header name is required for header authentication"
    );
  });

  it("validateForm returns false when bearer auth type missing value", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" }
        },
        authentication: {
          type: "bearer"
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors["authentication.value"]).toBe(
      "Token value is required for bearer authentication"
    );
  });

  it("validateForm returns false when basic auth missing username", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" }
        },
        authentication: {
          type: "basic",
          password: "pass"
        }
      }));
    });

    act(() => {
      result.current.validateForm();
    });
    expect(result.current.validateForm()).toBe(false);
    expect(result.current.validationErrors["authentication.username"]).toBe(
      "Username is required for basic authentication"
    );
  });

  it("validateForm returns true when Custom API config is valid", () => {
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit: noop })
    );

    act(() => {
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" }
        }
      }));
    });

    expect(result.current.validateForm()).toBe(true);
  });

  it("handleSubmit builds Custom API payload correctly", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit })
    );

    act(() => {
      result.current.setName("Custom API Source");
      result.current.setDescription("Test");
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" },
          attributeNames: { path: "/api/attributes" }
        },
        capabilities: {
          searchByQuery: true,
          searchByAttributes: true,
          getAttributeNames: true
        },
        authentication: {
          type: "bearer",
          value: "token123"
        },
        headers: {
          "X-Custom": "value"
        }
      }));
    });

    const e = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(e);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [payload] = onSubmit.mock.calls[0];
    expect(payload).toMatchObject({
      name: "Custom API Source",
      description: "Test",
      type: DatasourceType.TRACES,
      source: DatasourceSource.CUSTOM_API,
      config: {
        customApi: {
          baseUrl: "https://api.example.com",
          endpoints: {
            search: { path: "/api/search" },
            searchByTraceId: { path: "/api/{traceId}" },
            attributeNames: { path: "/api/attributes" }
          },
          capabilities: {
            searchByQuery: true,
            searchByAttributes: true,
            getAttributeNames: true
          },
          authentication: {
            type: "bearer",
            value: "token123"
          },
          headers: {
            "X-Custom": "value"
          }
        }
      }
    });
  });

  it("handleSubmit removes trailing slashes from baseUrl", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
    useDatasourceForm({ datasource: undefined, isOpen: true, onSubmit })
    );

    act(() => {
      result.current.setName("Test");
      result.current.setSource(DatasourceSource.CUSTOM_API);
      result.current.setCustomApiConfig((c) => ({
        ...c,
        baseUrl: "https://api.example.com/",
        endpoints: {
          search: { path: "/api/search" },
          searchByTraceId: { path: "/api/{traceId}" }
        }
      }));
    });

    const e = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(e);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [payload] = onSubmit.mock.calls[0];
    expect(payload.config.customApi.baseUrl).toBe("https://api.example.com");
  });
});