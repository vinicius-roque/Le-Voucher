import { jest } from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";

describe("create Voucher test suite", () => {
  jest
    .spyOn(voucherRepository, "createVoucher")
    .mockImplementation((): any => { });

  it("should not create a voucher if code already exists", async () => {
    const voucher = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce({ ...voucher, used: false, id: 1 });

    const promise = voucherService.createVoucher(voucher.code, voucher.discount);

    expect(promise).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict",
    });
  });

  it("should create a voucher if there is no voucher with that code yet", async () => {
    const voucher = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(undefined);

    const promise = voucherService.createVoucher(voucher.code, voucher.discount);

    expect(promise).resolves.toBeUndefined();
  });
});

describe("apply Voucher test suite", () => {
  it("should not apply discount in a invalid voucher", async () => {
    const code = "aaa";
    const amount = 100;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(undefined);

    const promise = voucherService.applyVoucher(code, amount);

    expect(promise).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict",
    });
  });

  it("should not apply discount in used vouchers", async () => {
    const code = "aaa";
    const amount = 100;
    const discount = 10;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce({ id: 1, code, discount, used: true });

    const promise = await voucherService.applyVoucher(code, amount);

    expect(promise.amount).toBe(amount);
    expect(promise.discount).toBe(discount);
    expect(promise.finalAmount).toBe(amount);
    expect(promise.applied).toBe(false);
  });

  it("should not apply discount for values under 100", async () => {
    const code = "aaa";
    const amount = 99;
    const discount = 10;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce({ id: 1, code, discount, used: false });

    const promise = await voucherService.applyVoucher(code, amount);

    expect(promise.amount).toBe(amount);
    expect(promise.discount).toBe(discount);
    expect(promise.finalAmount).toBe(amount);
    expect(promise.applied).toBe(false);
  });
});