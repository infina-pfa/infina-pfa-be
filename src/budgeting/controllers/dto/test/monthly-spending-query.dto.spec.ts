import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MonthlySpendingQueryDto } from '../monthly-spending-query.dto';

describe('MonthlySpendingQueryDto', () => {
  describe('Validation', () => {
    describe('Month Field', () => {
      describe('Valid Values', () => {
        it('should accept valid month values (1-12)', async () => {
          const validMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

          for (const month of validMonths) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: month.toString(),
              year: '2024',
            });

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
            expect(dto.month).toBe(month);
          }
        });

        it('should accept month as string and transform to integer', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: '6',
            year: '2024',
          });

          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
          expect(dto.month).toBe(6);
          expect(typeof dto.month).toBe('number');
        });

        it('should accept month as integer', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: 8,
            year: 2024,
          });

          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
          expect(dto.month).toBe(8);
          expect(typeof dto.month).toBe('number');
        });

        it('should handle edge months (1 and 12)', async () => {
          const edgeMonths = [1, 12];

          for (const month of edgeMonths) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: month.toString(),
              year: '2024',
            });

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
            expect(dto.month).toBe(month);
          }
        });
      });

      describe('Invalid Values', () => {
        it('should reject month less than 1', async () => {
          const invalidMonths = [0, -1, -12];

          for (const month of invalidMonths) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: month.toString(),
              year: '2024',
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const monthErrors = errors.find(
              (error) => error.property === 'month',
            );
            expect(monthErrors).toBeDefined();
            expect(monthErrors?.constraints).toHaveProperty('min');
            expect(monthErrors?.constraints?.min).toContain(
              'Month must be between 1 and 12',
            );
          }
        });

        it('should reject month greater than 12', async () => {
          const invalidMonths = [13, 14, 24, 100];

          for (const month of invalidMonths) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: month.toString(),
              year: '2024',
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const monthErrors = errors.find(
              (error) => error.property === 'month',
            );
            expect(monthErrors).toBeDefined();
            expect(monthErrors?.constraints).toHaveProperty('max');
            expect(monthErrors?.constraints?.max).toContain(
              'Month must be between 1 and 12',
            );
          }
        });

        it('should reject non-integer month values', async () => {
          const nonIntegerValues = ['6.5', '3.14', '2.9'];

          for (const month of nonIntegerValues) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month,
              year: '2024',
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const monthErrors = errors.find(
              (error) => error.property === 'month',
            );
            expect(monthErrors).toBeDefined();
            expect(monthErrors?.constraints).toHaveProperty('isInt');
            expect(monthErrors?.constraints?.isInt).toContain(
              'Month must be an integer',
            );
          }
        });

        it('should reject string month values that cannot be parsed as integers', async () => {
          const invalidStrings = ['abc', 'january', 'month1', ''];

          for (const month of invalidStrings) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month,
              year: '2024',
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const monthErrors = errors.find(
              (error) => error.property === 'month',
            );
            expect(monthErrors).toBeDefined();
            expect(monthErrors?.constraints).toHaveProperty('isInt');
          }
        });

        it('should reject null month value', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: null,
            year: '2024',
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const monthErrors = errors.find(
            (error) => error.property === 'month',
          );
          expect(monthErrors).toBeDefined();
        });

        it('should reject undefined month value', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: undefined,
            year: '2024',
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const monthErrors = errors.find(
            (error) => error.property === 'month',
          );
          expect(monthErrors).toBeDefined();
        });

        it('should reject missing month field', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            year: '2024',
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const monthErrors = errors.find(
            (error) => error.property === 'month',
          );
          expect(monthErrors).toBeDefined();
        });
      });
    });

    describe('Year Field', () => {
      describe('Valid Values', () => {
        it('should accept valid year values (1900-3000)', async () => {
          const validYears = [1900, 2000, 2024, 2025, 2100, 3000];

          for (const year of validYears) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: '6',
              year: year.toString(),
            });

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
            expect(dto.year).toBe(year);
          }
        });

        it('should accept year as string and transform to integer', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: '6',
            year: '2024',
          });

          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
          expect(dto.year).toBe(2024);
          expect(typeof dto.year).toBe('number');
        });

        it('should accept year as integer', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: 6,
            year: 2024,
          });

          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
          expect(dto.year).toBe(2024);
          expect(typeof dto.year).toBe('number');
        });

        it('should handle edge years (1900 and 3000)', async () => {
          const edgeYears = [1900, 3000];

          for (const year of edgeYears) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: '6',
              year: year.toString(),
            });

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
            expect(dto.year).toBe(year);
          }
        });

        it('should accept common year values', async () => {
          const commonYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

          for (const year of commonYears) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: '3',
              year: year.toString(),
            });

            const errors = await validate(dto);

            expect(errors).toHaveLength(0);
            expect(dto.year).toBe(year);
          }
        });
      });

      describe('Invalid Values', () => {
        it('should reject year less than 1900', async () => {
          const invalidYears = [1899, 1000, 100, 0, -1, -2024];

          for (const year of invalidYears) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: '6',
              year: year.toString(),
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const yearErrors = errors.find(
              (error) => error.property === 'year',
            );
            expect(yearErrors).toBeDefined();
            expect(yearErrors?.constraints).toHaveProperty('min');
            expect(yearErrors?.constraints?.min).toContain(
              'Year must be a valid year',
            );
          }
        });

        it('should reject year greater than 3000', async () => {
          const invalidYears = [3001, 4000, 9999, 10000];

          for (const year of invalidYears) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: '6',
              year: year.toString(),
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const yearErrors = errors.find(
              (error) => error.property === 'year',
            );
            expect(yearErrors).toBeDefined();
            expect(yearErrors?.constraints).toHaveProperty('max');
            expect(yearErrors?.constraints?.max).toContain(
              'Year must be a valid year',
            );
          }
        });

        it('should reject non-integer year values', async () => {
          const nonIntegerValues = ['2024.5', '2023.1', '2025.99'];

          for (const year of nonIntegerValues) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: '6',
              year,
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const yearErrors = errors.find(
              (error) => error.property === 'year',
            );
            expect(yearErrors).toBeDefined();
            expect(yearErrors?.constraints).toHaveProperty('isInt');
            expect(yearErrors?.constraints?.isInt).toContain(
              'Year must be an integer',
            );
          }
        });

        it('should reject string year values that cannot be parsed as integers', async () => {
          const invalidStrings = ['abc', 'year2024', '24', 'twenty24', ''];

          for (const year of invalidStrings) {
            const dto = plainToInstance(MonthlySpendingQueryDto, {
              month: '6',
              year,
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const yearErrors = errors.find(
              (error) => error.property === 'year',
            );
            expect(yearErrors).toBeDefined();
            expect(yearErrors?.constraints).toHaveProperty('isInt');
          }
        });

        it('should reject null year value', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: '6',
            year: null,
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const yearErrors = errors.find((error) => error.property === 'year');
          expect(yearErrors).toBeDefined();
        });

        it('should reject undefined year value', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: '6',
            year: undefined,
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const yearErrors = errors.find((error) => error.property === 'year');
          expect(yearErrors).toBeDefined();
        });

        it('should reject missing year field', async () => {
          const dto = plainToInstance(MonthlySpendingQueryDto, {
            month: '6',
          });

          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const yearErrors = errors.find((error) => error.property === 'year');
          expect(yearErrors).toBeDefined();
        });
      });
    });

    describe('Combined Field Validation', () => {
      it('should accept valid month and year combinations', async () => {
        const validCombinations = [
          { month: '1', year: '2024' },
          { month: '12', year: '2023' },
          { month: '6', year: '1900' },
          { month: '7', year: '3000' },
          { month: 3, year: 2025 },
          { month: 11, year: 2022 },
        ];

        for (const { month, year } of validCombinations) {
          const dto = plainToInstance(MonthlySpendingQueryDto, { month, year });

          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
          expect(typeof dto.month).toBe('number');
          expect(typeof dto.year).toBe('number');
        }
      });

      it('should reject when both month and year are invalid', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '13',
          year: '1800',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);

        const monthErrors = errors.find((error) => error.property === 'month');
        const yearErrors = errors.find((error) => error.property === 'year');

        expect(monthErrors).toBeDefined();
        expect(yearErrors).toBeDefined();
      });

      it('should validate independently - valid month with invalid year', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '6',
          year: '1800',
        });

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        const yearErrors = errors.find((error) => error.property === 'year');
        expect(yearErrors).toBeDefined();

        const monthErrors = errors.find((error) => error.property === 'month');
        expect(monthErrors).toBeUndefined();
      });

      it('should validate independently - invalid month with valid year', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '15',
          year: '2024',
        });

        const errors = await validate(dto);

        expect(errors.length).toBe(1);
        const monthErrors = errors.find((error) => error.property === 'month');
        expect(monthErrors).toBeDefined();

        const yearErrors = errors.find((error) => error.property === 'year');
        expect(yearErrors).toBeUndefined();
      });

      it('should handle leap year scenarios correctly', async () => {
        const leapYearCombinations = [
          { month: '2', year: '2024' }, // 2024 is a leap year
          { month: '2', year: '2020' }, // 2020 is a leap year
          { month: '2', year: '2023' }, // 2023 is not a leap year
          { month: '2', year: '2100' }, // 2100 is not a leap year (divisible by 100 but not 400)
        ];

        for (const { month, year } of leapYearCombinations) {
          const dto = plainToInstance(MonthlySpendingQueryDto, { month, year });

          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
          expect(dto.month).toBe(2);
          expect(dto.year).toBe(parseInt(year));
        }
      });
    });

    describe('Transformation', () => {
      it('should transform string month to number', () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '8',
          year: '2024',
        });

        expect(dto.month).toBe(8);
        expect(typeof dto.month).toBe('number');
      });

      it('should transform string year to number', () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '6',
          year: '2024',
        });

        expect(dto.year).toBe(2024);
        expect(typeof dto.year).toBe('number');
      });

      it('should handle numeric strings with leading zeros', () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '06',
          year: '02024',
        });

        expect(dto.month).toBe(6);
        expect(dto.year).toBe(2024);
      });

      it('should handle numeric strings with whitespace', () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: ' 7 ',
          year: ' 2024 ',
        });

        expect(dto.month).toBe(7);
        expect(dto.year).toBe(2024);
      });

      it('should maintain original numeric values', () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: 9,
          year: 2024,
        });

        expect(dto.month).toBe(9);
        expect(dto.year).toBe(2024);
        expect(typeof dto.month).toBe('number');
        expect(typeof dto.year).toBe('number');
      });

      it('should handle transformation of edge values', () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '1',
          year: '1900',
        });

        expect(dto.month).toBe(1);
        expect(dto.year).toBe(1900);

        const dto2 = plainToInstance(MonthlySpendingQueryDto, {
          month: '12',
          year: '3000',
        });

        expect(dto2.month).toBe(12);
        expect(dto2.year).toBe(3000);
      });
    });

    describe('Error Messages', () => {
      it('should provide correct error message for month validation', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '15',
          year: '2024',
        });

        const errors = await validate(dto);
        const monthErrors = errors.find((error) => error.property === 'month');

        expect(monthErrors?.constraints?.max).toBe(
          'Month must be between 1 and 12',
        );
      });

      it('should provide correct error message for year validation', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '6',
          year: '1800',
        });

        const errors = await validate(dto);
        const yearErrors = errors.find((error) => error.property === 'year');

        expect(yearErrors?.constraints?.min).toBe('Year must be a valid year');
      });

      it('should provide correct error message for integer validation', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: 'abc',
          year: 'xyz',
        });

        const errors = await validate(dto);

        const monthErrors = errors.find((error) => error.property === 'month');
        const yearErrors = errors.find((error) => error.property === 'year');

        expect(monthErrors?.constraints?.isInt).toBe(
          'Month must be an integer',
        );
        expect(yearErrors?.constraints?.isInt).toBe('Year must be an integer');
      });

      it('should provide multiple error messages for multiple violations', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '0',
          year: '4000',
        });

        const errors = await validate(dto);

        const monthErrors = errors.find((error) => error.property === 'month');
        const yearErrors = errors.find((error) => error.property === 'year');

        expect(monthErrors?.constraints?.min).toBe(
          'Month must be between 1 and 12',
        );
        expect(yearErrors?.constraints?.max).toBe('Year must be a valid year');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty object', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {});

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
        expect(errors.some((error) => error.property === 'month')).toBe(true);
        expect(errors.some((error) => error.property === 'year')).toBe(true);
      });

      it('should handle object with extra properties', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '6',
          year: '2024',
          extraProperty: 'should be ignored',
        });

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
        expect(dto.month).toBe(6);
        expect(dto.year).toBe(2024);
        expect((dto as any).extraProperty).toBeUndefined(); // class-transformer ignores unknown properties by default
      });

      it('should handle very large numeric strings', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: '999999999999999999999',
          year: '999999999999999999999',
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);

        const monthErrors = errors.find((error) => error.property === 'month');
        const yearErrors = errors.find((error) => error.property === 'year');

        expect(monthErrors).toBeDefined();
        expect(yearErrors).toBeDefined();
      });

      it('should handle boolean values', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: true,
          year: false,
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
      });

      it('should handle array values', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: [6],
          year: [2024],
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
      });

      it('should handle object values', async () => {
        const dto = plainToInstance(MonthlySpendingQueryDto, {
          month: { value: 6 },
          year: { value: 2024 },
        });

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
