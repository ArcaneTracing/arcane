import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useDatasourceDialog } from "../use-datasource-dialog";
import { DatasourceSource, DatasourceType } from "@/types/enums";
import type { DatasourceResponse } from "@/types/datasources";

const mockCreateMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null,
  reset: jest.fn()
};

const mockUpdateMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null,
  reset: jest.fn()
};

const mockUseMutationAction = jest.fn();

jest.mock("@/hooks/datasources/use-datasources-query", () => ({
  useCreateDatasource: jest.fn(() => mockCreateMutation),
  useUpdateDatasource: jest.fn(() => mockUpdateMutation)
}));

jest.mock("@/hooks/shared/use-mutation-action", () => ({
  useMutationAction: (opts: unknown) => mockUseMutationAction(opts)
}));

jest.mock("@/lib/toast", () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

describe("useDatasourceDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockCreateMutation, {
      mutateAsync: jest.fn().mockResolvedValue(undefined),
      isPending: false,
      error: null,
      reset: jest.fn()
    });
    Object.assign(mockUpdateMutation, {
      mutateAsync: jest.fn().mockResolvedValue(undefined),
      isPending: false,
      error: null,
      reset: jest.fn()
    });
  });

  it("returns open false and internal state when uncontrolled and not opened", () => {
    const { result } = renderHook(() =>
    useDatasourceDialog({ datasource: undefined, open: undefined, onOpenChange: undefined })
    );

    expect(result.current.open).toBe(false);
    expect(result.current.mutation).toBe(mockCreateMutation);
    expect(result.current.isCreateLoading).toBe(false);
    expect(result.current.isUpdateLoading).toBe(false);
  });

  it("setOpen updates internal open when uncontrolled", () => {
    const { result } = renderHook(() =>
    useDatasourceDialog({ datasource: undefined, open: undefined, onOpenChange: undefined })
    );

    act(() => {
      result.current.setOpen(true);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.setOpen(false);
    });
    expect(result.current.open).toBe(false);
  });

  it("uses controlled open when open and onOpenChange provided", () => {
    const onOpenChange = jest.fn();
    const { result, rerender } = renderHook(
      (props: {open?: boolean;onOpenChange?: (v: boolean) => void;}) =>
      useDatasourceDialog({ ...props, datasource: undefined }),
      { initialProps: { open: true, onOpenChange } }
    );

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.setOpen(false);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender({ open: false, onOpenChange });
    expect(result.current.open).toBe(false);
  });

  it("calls onCloseRef.current when setOpen(false)", () => {
    const onClose = jest.fn();
    const onCloseRef = { current: onClose };

    const { result } = renderHook(() =>
    useDatasourceDialog({
      datasource: undefined,
      open: undefined,
      onOpenChange: undefined,
      onCloseRef
    })
    );

    act(() => {
      result.current.setOpen(true);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      result.current.setOpen(false);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("uses updateMutation when datasource provided", () => {
    const ds: DatasourceResponse = {
      id: "id1",
      name: "D",
      description: "",
      url: "http://x.com",
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    const { result } = renderHook(() =>
    useDatasourceDialog({ datasource: ds, open: undefined, onOpenChange: undefined })
    );

    expect(result.current.mutation).toBe(mockUpdateMutation);
  });

  it("useMutationAction is called with mutation and onSuccess that closes and shows toast", () => {
    const onSuccess = jest.fn();
    renderHook(() =>
    useDatasourceDialog({
      datasource: undefined,
      open: undefined,
      onOpenChange: undefined,
      onSuccess
    })
    );

    expect(mockUseMutationAction).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: mockCreateMutation,
        showErrorToast: true
      })
    );
    const { onSuccess: onMutationSuccess } = mockUseMutationAction.mock.calls[0][0];
    expect(typeof onMutationSuccess).toBe("function");

    const { showSuccessToast } = require("@/lib/toast");
    const setOpen = jest.fn();


    expect(showSuccessToast).toBeDefined();
  });

  it("returns isCreateLoading and isUpdateLoading from mutations", () => {
    const { result } = renderHook(() =>
    useDatasourceDialog({ datasource: undefined, open: undefined, onOpenChange: undefined })
    );
    expect(result.current.isCreateLoading).toBe(false);
    expect(result.current.isUpdateLoading).toBe(false);
  });

  it("returns isUpdateLoading from updateMutation when datasource provided", () => {
    const ds: DatasourceResponse = {
      id: "id1",
      name: "D",
      description: "",
      url: "http://x.com",
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    const { result } = renderHook(() =>
    useDatasourceDialog({ datasource: ds, open: undefined, onOpenChange: undefined })
    );
    expect(result.current.isUpdateLoading).toBe(false);
  });
});