import { useTheme } from '@/providers/ThemeProvider';

// Function to get color for charts based on current theme
export function useChartColors() {
  const { theme } = useTheme();

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return {
    // Primary colors for charts
    primaryColors: isDarkMode
      ? ['hsl(220, 70%, 50%)', 'hsl(160, 60%, 45%)', 'hsl(30, 80%, 55%)', 'hsl(280, 65%, 60%)', 'hsl(340, 75%, 55%)']
      : ['hsl(12, 76%, 61%)', 'hsl(173, 58%, 39%)', 'hsl(197, 37%, 24%)', 'hsl(43, 74%, 66%)', 'hsl(27, 87%, 67%)'],

    // Text color for chart labels
    textColor: isDarkMode ? 'hsl(0, 0%, 83.1%)' : 'hsl(0, 0%, 3.9%)',

    // Grid line colors
    gridColor: isDarkMode ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 90%)',

    // Tooltip and popover background
    tooltipBackground: isDarkMode ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 100%)',

    // Status colors
    successColor: isDarkMode ? 'hsl(142, 69%, 58%)' : 'hsl(142, 76%, 36%)',
    warningColor: isDarkMode ? 'hsl(38, 92%, 50%)' : 'hsl(45, 93%, 47%)',
    dangerColor: isDarkMode ? 'hsl(358, 75%, 59%)' : 'hsl(0, 84%, 60%)',

    // Background for chart sections
    cardBackground: isDarkMode ? 'hsl(0, 0%, 7%)' : 'hsl(0, 0%, 100%)',
  };
}

// Function to generate chart options that adapt to theme
/* eslint-disable-next-line */
export function adaptiveChartOptions(baseOptions: Record<string, any> = {}, isDarkMode: boolean): Record<string, any> {
  return {
    ...baseOptions,
    // Customize global chart appearance based on theme
    chart: {
      ...baseOptions.chart,
      background: isDarkMode ? 'hsl(0, 0%, 7%)' : 'hsl(0, 0%, 100%)',
      foreColor: isDarkMode ? 'hsl(0, 0%, 83.1%)' : 'hsl(0, 0%, 3.9%)',
    },
    // Customize grid appearance
    grid: {
      ...baseOptions.grid,
      borderColor: isDarkMode ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 90%)',
      row: {
        ...baseOptions.grid?.row,
        colors: isDarkMode ? ['hsl(0, 0%, 7%)', 'hsl(0, 0%, 10%)'] : ['hsl(0, 0%, 100%)', 'hsl(0, 0%, 97%)'],
      },
    },
    // Customize tooltip appearance
    tooltip: {
      ...baseOptions.tooltip,
      theme: isDarkMode ? 'dark' : 'light',
    },
  };
}
