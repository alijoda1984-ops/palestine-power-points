import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { ProjectForm, emptyDetails } from "@/components/ProjectForm";
import { WorkLineForm } from "@/components/WorkLineForm";

afterEach(cleanup);
describe("phone entry rules", () => {
  it("new projects use goods and the user's project price", () => {
    const onSubmit = vi.fn();
    render(<ProjectForm initial={emptyDetails()} submitLabel="save" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("اسم المشروع / الزبون *"), { target: { value: "test" } });
    fireEvent.change(screen.getByLabelText("سعر النقطة (شيكل) *"), { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ mode: "goods", pricePerPoint: 25 });
  });
  it("editing a previously saved manufacturing project preserves its mode", () => {
    const onSubmit = vi.fn();
    render(<ProjectForm initial={{ ...emptyDetails(), name: "old", pricePerPoint: 20, mode: "manufacturing" }} submitLabel="save" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(onSubmit.mock.calls[0]?.[0].mode).toBe("manufacturing");
  });
  it("editing test-data lines never removes their test flag", () => {
    const onAdd = vi.fn();
    render(<WorkLineForm initial={{ id: "test", catalogItemId: "t", name: "test", code: "", section: "", pointsPerItem: 2, quantity: 3, isTest: true }} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button", { name: "إضافة البند" }));
    expect(onAdd.mock.calls[0]?.[0]).toMatchObject({ isTest: true, quantity: 3, pointsPerItem: 2 });
  });
});