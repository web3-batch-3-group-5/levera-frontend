export class LiquidationCalculator {
  private ltp: bigint | undefined;

  constructor(ltp: bigint | undefined) {
    this.ltp = ltp;
  }

  getLiquidationPrice(effectiveCollateral: number, borrowAmount: number): number {
    return (borrowAmount * 100) / (effectiveCollateral * Number(this.ltp));
  }

  getHealth(effectiveCollateralPrice: number, borrowAmount: number): number {
    return (effectiveCollateralPrice * Number(this.ltp)) / (borrowAmount * 100);
  }

  getLTV(effectiveCollateralPrice: number, borrowAmount: number): number {
    return borrowAmount / effectiveCollateralPrice;
  }
}
